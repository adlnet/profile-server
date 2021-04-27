const { pattern } = require('../../ODM/models');

/** ***************************************************************
* Copyright 2020 Advanced Distributed Learning (ADL)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**************************************************************** */
const PatternModel = require('../../ODM/models').pattern;
const TemplateModel = require('../../ODM/models').template;
const PatternComponentModel = require('../../ODM/models').patternComponent;
const JsonLdToModel = require('./JsonLdToModel').JsonLdToModel;
const { conflictError, validationError } = require('../../errorTypes/errors');
const hasNoDuplicates = require('../../utils/hasNoDuplicates');
const jsonLdDiff = require('../../utils/jsonLdDiff');

exports.PatternLayer = function (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const patternDocument = versionLayer.patternDocument;
    let model = new PatternModel({
        iri: patternDocument.id,
        parentProfile: versionLayer.parentProfile,
        name: jsonLdToModel.toName(patternDocument.prefLabel),
        description: jsonLdToModel.toDescription(patternDocument.definition, true),
        translations: jsonLdToModel.toTranslations(patternDocument.prefLabel, patternDocument.definition, { definition: true }),
        isDeprecated: patternDocument.deprecated,
        primary: patternDocument.primary,
        type: jsonLdToModel.toPatternType(patternDocument),
        createdBy: versionLayer.parentProfile.updatedBy,
        updatedBy: versionLayer.parentProfile.updatedBy,
    });
    const existingPatternComponentModels = [];
    let existingParentlessComponent;

    async function getTemplate(componentId, profileTemplates) {
        let exists = profileTemplates.find(c => c.iri === componentId)
            || await TemplateModel.findOne({ iri: componentId });
        if (exists) {
            exists = new PatternComponentModel({ component: exists, componentType: 'template' });
            await exists.save();
        }

        return exists;
    }

    async function getPattern(componentId, profilePatterns) {
        let exists = profilePatterns.find(c => c.iri === componentId)
            || await PatternModel.findOne({ iri: componentId });
        if (exists) {
            exists = new PatternComponentModel({ component: exists, componentType: 'pattern' });
            await exists.save();
        }

        return exists;
    }

    async function getComponent(componentId, patternType, profileTemplates, profilePatterns) {
        if (componentId === patternDocument.id) {
            throw new validationError(`Pattern ${componentId} cannot be a member of its own ${patternType} property`);
        }
        let component = await getTemplate(componentId, profileTemplates)
            || await getPattern(componentId, profilePatterns);

        if (!component) {
            const parentlessModel = new TemplateModel({ iri: componentId });
            await parentlessModel.save();
            component = new PatternComponentModel({ component: parentlessModel, componentType: 'template' });
            await component.save();
        }

        return component;
    }

    async function testModel() {
        let thisModel;

        const exists = await PatternModel.findOne({ iri: patternDocument.id })
            || await TemplateModel.findOne({ iri: patternDocument.id });
        if (exists) {
            if (exists.parentProfile) {
                if (versionLayer.versionStatus === 'new'
                    || (versionLayer.versionStatus === 'draft' && exists.parentProfile._id.toString() !== versionLayer.parentProfile._id.toString())
                ) {
                    const existingJsonLd = await exists.export(versionLayer.parentProfile.iri);
                    jsonLdDiff(existingJsonLd, patternDocument, (path, action, value) => {
                        const splitPath = path.split('.');
                        if (!(
                            (action === 'add' && ['prefLabel', 'definition'].some(s => splitPath.includes(s)))
                            || (['add', 'update', 'delete'].includes(action) && splitPath.includes('deprecated'))
                            || (['add', 'delete'].includes(action) && splitPath.includes('inScheme'))
                        )) {
                            let actionError;
                            if (action === 'add') {
                                actionError = 'added to';
                            } else if (action === 'delete') {
                                actionError = 'deleted from';
                            } else {
                                actionError = 'updated on';
                            }

                            throw new conflictError(
                                `${path} cannot be ${actionError} published pattern ${patternDocument.id}`,
                            );
                        }
                    }, ['id']);
                } else if (versionLayer.versionStatus === 'draft') {
                } else {
                    throw new conflictError(`Pattern ${patternDocument.id} already exists.`);
                }

                model.parentProfile = undefined;
                thisModel = model.toObject();
                delete thisModel._id;
                delete thisModel.createdOn;
                delete thisModel.uuid;
                delete thisModel.createdBy;
                exists.set(thisModel);
                model = exists;
            } else {
                existingParentlessComponent = exists;
                model._id = exists._id;
                const existingCompModels = await PatternComponentModel.find({ component: exists });
                existingCompModels.forEach(m => {
                    m.componentType = 'pattern';
                    m.component = model;
                    existingPatternComponentModels.push(m);
                });
            }
        }
    }

    return {
        scanProfileComponentLayer: async function () {
            await testModel();

            return model;
        },
        scanSubcomponentLayer: async function (profileTemplates, profilePatterns) {
            const patternTypeProperty = patternDocument[model.type];

            let property;
            if (Array.isArray(patternTypeProperty)) {
                property = await Promise.all(patternTypeProperty.map(
                    async p => getComponent(p, model.type, profileTemplates, profilePatterns),
                ));


                if (property.length < 2) {
                    if (model.type === 'sequence') {
                        if (!(patternDocument && patternDocument.primary === 'true')) {
                            throw new validationError(`The sequence property in ${patternDocument.id} cannot have only one member because it is not a primary pattern.`);
                        }
                        if (property[0].componentType !== 'template') {
                            throw new validationError(`The sequence property in ${patternDocument.id} cannot have only one member if that member is not a statement template.`);
                        }
                    } else {
                        throw new validationError(`The alternates property of ${patternDocument.id} cannot have only one member.`);
                    }
                }

                if (model.type === 'alternates') {
                    if (property.some(p => p.componentType === 'pattern'
                            && ['optional', 'zeroOrMore'].includes(p.component.type))) {
                        throw new validationError(`The alternates property of ${patternDocument.id} cannot have pattern members that are type optional or zeroOrMore.`);
                    }
                }
            } else {
                property = await getComponent(patternTypeProperty, model.type, profileTemplates, profilePatterns);
            }

            model[model.type] = property;

            await model.validate();

            return model;
        },
        save: async function () {
            if (existingParentlessComponent) await existingParentlessComponent.remove();
            await model.save();
            await Promise.all(existingPatternComponentModels.map(async p => p.save()));
            return model;
        },
    };
};
