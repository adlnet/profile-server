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
const TemplateModel = require('../../ODM/models').template;
const ConceptModel = require('../../ODM/models').concept;
const { conflictError, validationError } = require('../../errorTypes/errors');

exports.TemplateLayer = function (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const templateDocument = versionLayer.templateDocument;
    const model = new TemplateModel({
        iri: templateDocument.id,
        parentProfile: versionLayer.parentProfile,
        name: jsonLdToModel.toName(templateDocument.prefLabel),
        description: jsonLdToModel.toDescription(templateDocument.definition),
        translations: jsonLdToModel.toTranslations(templateDocument.prefLabel, templateDocument.definition),
        isDeprecated: jsonLdToModel.toIsDeprecated(templateDocument.deprecated),
    });

    return {
        scanProfileComponentLayer: async function () {
            const exists = await TemplateModel.findOne({ iri: templateDocument.id });
            if (exists) {
                throw new conflictError(`Template ${templateDocument.id} already exists.`);
            }

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
                const exists = profileConcepts.find(c => c.iri === conceptId)
                    || await ConceptModel.findOne({ iri: conceptId });
                if (!exists) {
                    throw new validationError(`Concept ${conceptId} cannot be a ${property} for this template because it is does not exist in this profile version or on the server.`);
                }
                if (!propertyTypeMap[exists.conceptType].includes(property)) {
                    throw new validationError(`Concept ${conceptId} cannot be the ${property} for this template because it is type ${exists.conceptType}.`);
                }

                return exists;
            }

            const propertyObj = {};
            await Promise.all(properties.filter(p => Object.keys(templateDocument).includes(p)).map(
                async property => {
                    if (templateDocument[property]) {
                        let props;
                        if (Array.isArray(templateDocument[property])) {
                            props = await Promise.all(templateDocument[property].map(
                                async p => getConcept(p, property),
                            ));
                        } else {
                            props = await getConcept(templateDocument[property], property);
                        }

                        propertyObj[property] = props;
                    }
                },
            ));

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

            propertyObj.rules = templateDocument.rules;

            Object.assign(model, propertyObj);
            return model;
        },
    };
};
