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
const JsonLdToModel = require('./JsonLdToModel').JsonLdToModel;
const jsonLdDiff = require('../../utils/jsonLdDiff');
const TemplateModel = require('../../ODM/models').template;
const ConceptModel = require('../../ODM/models').concept;
const { conflictError, validationError } = require('../../errorTypes/errors');
const hasNoDuplicates = require('../../utils/hasNoDuplicates');

async function testModel(templateDocument, templateModel, versionStatus, parentProfile) {
    let thisModel;
    let testedModel;

    const exists = await TemplateModel.findOne({ iri: templateDocument.id });
    if (exists) {
        if (exists.parentProfile) {
            if (versionStatus === 'new'
                || (versionStatus === 'draft' && exists.parentProfile._id.toString() !== parentProfile._id.toString())
            ) {
                // or if versionStatus == 'draft' and exists.parentProfile._id !== parentProfile._id
                // (need to pass in version.parentProfile and get rid of parentProfileId)
                const existingJsonLd = await exists.export(parentProfile.iri);
                jsonLdDiff(existingJsonLd, templateDocument, (path, action, value) => {
                    const splitPath = path.split('.');
                    if (!(
                        (action === 'add' && ['prefLabel', 'definition'].some(s => splitPath.includes(s)))
                        || (['add', 'update', 'delete'].includes(action) && splitPath.includes('deprecated'))
                        || (['add', 'update', 'delete'].includes(action) && path === 'rules.scopeNote')
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
                            `${path} cannot be ${actionError} published template ${templateDocument.id}`,
                        );
                    }
                }, ['id', 'location']);
            } else if (versionStatus === 'draft') {
            } else {
                throw new conflictError(`Template ${templateDocument.id} already exists.`);
            }
            templateModel.parentProfile = undefined;
        }

        thisModel = templateModel.toObject();
        delete thisModel._id;
        delete thisModel.createdOn;
        delete thisModel.uuid;
        delete thisModel.createdBy;
        exists.set(thisModel);
        testedModel = exists;
    } else {
        testedModel = templateModel;
    }

    return testedModel;
}

exports.TemplateLayer = function (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const templateDocument = versionLayer.templateDocument;
    let model = new TemplateModel({
        iri: templateDocument.id,
        parentProfile: versionLayer.parentProfile,
        name: jsonLdToModel.toName(templateDocument.prefLabel),
        description: jsonLdToModel.toDescription(templateDocument.definition),
        translations: jsonLdToModel.toTranslations(templateDocument.prefLabel, templateDocument.definition),
        isDeprecated: jsonLdToModel.toIsDeprecated(templateDocument.deprecated),
        rules: templateDocument.rules,
        createdBy: versionLayer.parentProfile.updatedBy,
        updatedBy: versionLayer.parentProfile.updatedBy,
    });

    return {
        scanProfileComponentLayer: async function () {
            model = await testModel(templateDocument, model, versionLayer.versionStatus, versionLayer.parentProfile);

            return model;
        },
        scanSubcomponentLayer: async function (profileConcepts, profileTemplates) {
            if (templateDocument.objectActivityType
                    && (templateDocument.objectStatementRefTemplate
                    && templateDocument.objectStatementRefTemplate.length > 0)) {
                throw new validationError(`${templateDocument.id} cannot have both an objectStatementRefTemplate and an objectActivityType.`);
            }

            const properties = [
                'verb', 'objectActivityType', 'contextGroupingActivityType', 'contextParentActivityType',
                'contextOtherActivityType', 'contextCategoryActivityType', 'attachmentUsageType',
            ];
            const propertyTypeMap = {
                Verb: ['verb'],
                ActivityType: [
                    'objectActivityType', 'contextGroupingActivityType', 'contextParentActivityType',
                    'contextOtherActivityType', 'contextCategoryActivityType',
                ],
                AttachmentUsageType: ['attachmentUsageType'],
            };

            async function getConcept(conceptId, property) {
                let exists = profileConcepts.find(c => c.iri === conceptId)
                    || await ConceptModel.findOne({ iri: conceptId });
                if (!exists) {
                    exists = new ConceptModel({ iri: conceptId });
                    await exists.save();
                    return exists;
                }

                if (!exists.parentProfile) {
                    return exists;
                }

                if (!propertyTypeMap[exists.conceptType].includes(property)) {
                    throw new validationError(`Concept ${conceptId} cannot be the ${property} for this template because it is type ${exists.conceptType}.`);
                }

                return exists;
            }

            const propertyObj = {};
            for (const property of properties.filter(p => Object.keys(templateDocument).includes(p))) {
                if (templateDocument[property]) {
                    let props;
                    if (Array.isArray(templateDocument[property])) {
                        if (!hasNoDuplicates(templateDocument[property])) {
                            throw new validationError(`Template ${templateDocument.id} has a duplicate concept id in property ${property}.`);
                        }

                        props = await Promise.all(templateDocument[property].map(
                            async p => getConcept(p, property),
                        ));
                    } else {
                        props = await getConcept(templateDocument[property], property);
                    }

                    propertyObj[property] = props;
                }
            }

            if (templateDocument.objectStatementRefTemplate
                    && templateDocument.objectStatementRefTemplate.length > 0) {
                propertyObj.objectStatementRefTemplate = templateDocument.objectStatementRefTemplate.map(
                    t => {
                        const exists = profileTemplates.find(p => p.iri === t);
                        if (!exists) {
                            throw new validationError(`${t} cannot be the objectStatementRefTemplate for template ${templateDocument.id} because it is not a template from this profile version.`);
                        }
                        return exists;
                    },
                );
            }

            if (templateDocument.contextStatementRefTemplate
                    && templateDocument.contextStatementRefTemplate.length > 0) {
                propertyObj.contextStatementRefTemplate = templateDocument.contextStatementRefTemplate.map(
                    t => {
                        const exists = profileTemplates.find(p => p.iri === t);
                        if (!exists) {
                            throw new validationError(`${t} cannot be the contextStatementRefTemplate for template ${templateDocument.id} because it is not a template from this profile version.`);
                        }
                        return exists;
                    },
                );
            }

            // propertyObj.rules = templateDocument.rules;

            Object.assign(model, propertyObj);
            await model.validate();
            return model;
        },
    };
};
