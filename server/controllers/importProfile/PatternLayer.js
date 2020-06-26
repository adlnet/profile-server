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
const JsonLdToModel = require('./JsonLdToModel').JsonLdToModel;
const { conflictError, validationError } = require('../../errorTypes/errors');

exports.PatternLayer = function (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const patternDocument = versionLayer.patternDocument;
    const model = new PatternModel({
        iri: patternDocument.id,
        parentProfile: versionLayer.parentProfile,
        name: jsonLdToModel.toName(patternDocument.prefLabel),
        description: jsonLdToModel.toDescription(patternDocument.definition),
        translations: jsonLdToModel.toTranslations(patternDocument.prefLabel, patternDocument.definition),
        isDeprecated: patternDocument.deprecated,
        primary: patternDocument.primary,
        type: jsonLdToModel.toPatternType(patternDocument),
    });

    async function getTemplate(componentId, profileTemplates) {
        let exists = profileTemplates.find(c => c.iri === componentId)
            || await TemplateModel.findOne({ iri: componentId });
        if (exists) {
            exists = { component: exists, componentType: 'template' };
        }

        return exists;
    }

    async function getPattern(componentId, profilePatterns) {
        let exists = profilePatterns.find(c => c.iri === componentId)
            || await PatternModel.findOne({ iri: componentId });
        if (exists) {
            exists = { component: exists, componentType: 'pattern' };
        }

        return exists;
    }

    async function getComponent(componentId, patternType, profileTemplates, profilePatterns) {
        if (componentId === patternDocument.id) {
            throw new validationError(`Pattern ${componentId} cannot be a member of its own ${patternType} property`);
        }
        const component = await getTemplate(componentId, profileTemplates)
            || await getPattern(componentId, profilePatterns);
        if (!component) {
            throw new validationError(`${componentId} cannot be a ${patternType} member of ${patternDocument.id} because it is not on the server or in this profile version`);
        }

        return component;
    }

    return {
        scanProfileComponentLayer: async function () {
            const exists = await PatternModel.findOne({ iri: patternDocument.id });
            if (exists) {
                throw new conflictError(`Pattern ${patternDocument.id} already exists.`);
            }

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

            return model;
        },
    };
};
