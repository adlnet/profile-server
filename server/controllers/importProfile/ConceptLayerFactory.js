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
const ConceptModel = require('../../ODM/models').concept;
const JsonLdToModel = require('./JsonLdToModel').JsonLdToModel;
const { conflictError, validationError } = require('../../errorTypes/errors');

async function conceptExists(id) {
    const exists = await ConceptModel.findOne({ iri: id });
    return exists;
}

function commonConceptProperties(conceptDocument, parentProfile) {
    const jsonLdToModel = new JsonLdToModel();

    return {
        iri: conceptDocument.id,
        type: conceptDocument.type,
        parentProfile: parentProfile,
        name: jsonLdToModel.toName(conceptDocument.prefLabel),
        description: jsonLdToModel.toDescription(conceptDocument.definition),
        translations: jsonLdToModel.toTranslations(conceptDocument.prefLabel, conceptDocument.definition),
        isDeprecated: conceptDocument.deprecated,
    };
}

function SemanticallyRelatableConceptLayer (versionLayer) {
    const conceptDocument = versionLayer.conceptDocument;
    const model = new ConceptModel({
        ...commonConceptProperties(conceptDocument, versionLayer.parentProfile),
        conceptType: conceptDocument.type,
    });

    return {
        scanProfileComponentLayer: async function () {
            const exists = await conceptExists(conceptDocument.id);
            if (exists) {
                throw new conflictError(`Concept ${conceptDocument.id} already exists.`);
            }

            return model;
        },
        scanSubcomponentLayer: async function (profileConcepts) {
            const externalRelationTypes = ['relatedMatch', 'broadMatch', 'narrowMatch', 'exactMatch'];
            const profileRelationTypes = ['related', 'broader', 'narrower'];

            const similarTerms = [];
            await Promise.all(externalRelationTypes.map(async e => {
                const terms = conceptDocument[e] || [];
                await Promise.all(terms.map(async t => {
                    const externalConcept = await conceptExists(t);
                    if (externalConcept) {
                        similarTerms.push({
                            relationType: e,
                            concept: externalConcept,
                        });
                    } else {
                        throw new validationError(`Concept ${t} cannot have a ${e} relation because it does not exist on the server`);
                    }
                }));
            }));

            profileRelationTypes.forEach(e => {
                const terms = conceptDocument[e] || [];
                terms.forEach(t => {
                    const profileConcept = profileConcepts.find(p => p.iri === t);
                    if (profileConcept) {
                        similarTerms.push({
                            relationType: e,
                            concept: profileConcept,
                        });
                    } else {
                        throw new validationError(`Concept ${t} cannot have a ${e} relation because it is not part of this profile version`);
                    }
                });
            });

            if (similarTerms.length > 0) {
                model.similarTerms = similarTerms;
            }

            return model;
        },
    };
}

function DocumentConceptLayer (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const conceptDocument = versionLayer.conceptDocument;
    const model = new ConceptModel({
        ...commonConceptProperties(conceptDocument, versionLayer.parentProfile),
        conceptType: 'Document',
        mediaType: conceptDocument.contentType,
        ...jsonLdToModel.toSchema(conceptDocument.inlineSchema, conceptDocument.schema),
    });

    return {
        scanProfileComponentLayer: async function () {
            const exists = await conceptExists(conceptDocument.id);
            if (exists) {
                throw new conflictError(`Concept ${conceptDocument.id} already exists.`);
            }

            return model;
        },
        scanSubcomponentLayer: function () {
            return model;
        },
    };
}

function ExtensionConceptLayer (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const conceptDocument = versionLayer.conceptDocument;
    const model = new ConceptModel({
        ...commonConceptProperties(conceptDocument, versionLayer.parentProfile),
        conceptType: 'Extension',
        ...jsonLdToModel.toSchema(conceptDocument.inlineSchema, conceptDocument.schema),
    });

    return {
        scanProfileComponentLayer: async function () {
            const exists = await conceptExists(conceptDocument.id);
            if (exists) {
                throw new conflictError(`Concept ${conceptDocument.id} already exists.`);
            }

            return model;
        },
        scanSubcomponentLayer: async function (profileConcepts) {
            const recommendedActivityTypes = conceptDocument.recommendedActivityTypes || [];
            const recommendedVerbs = conceptDocument.recommendedVerbs || [];

            const recommendedTerms = [];
            if (recommendedActivityTypes.length > 0) {
                if (conceptDocument.type !== 'ActivityExtension') {
                    throw new validationError(
                        `Concept ${conceptDocument.id} has a recommendedActivityTypes property but is not an ActivityExtension type`,
                    );
                }

                await Promise.all(recommendedActivityTypes.map(async a => {
                    let recommendedActivityType = profileConcepts.find(p => p.iri === a);
                    if (!recommendedActivityType) {
                        recommendedActivityType = await conceptExists(a);
                    }
                    if (!recommendedActivityType) {
                        throw new validationError(
                            `Concept ${a} cannot be a recommended activity type for ${conceptDocument.id} because it is not in this profile version or on the server.`,
                        );
                    }
                    if (recommendedActivityType.type !== 'ActivityType') {
                        throw new validationError(
                            `Concept ${a} is not an ActivityType and therefore cannot be a recommended activity type.`,
                        );
                    }

                    recommendedTerms.push(recommendedActivityType);
                }));
            }

            if (recommendedVerbs.length > 0) {
                if (!['ContextExtension', 'ResultExtension'].includes((conceptDocument.type))) {
                    throw new validationError(
                        `Concept ${conceptDocument.id} has a recommendedVerbs property but is not a ContextExtension or a ResultExtension type`,
                    );
                }


                await Promise.all(recommendedVerbs.map(async v => {
                    let recommendedVerb = profileConcepts.find(p => p.iri === v);
                    if (!recommendedVerb) {
                        recommendedVerb = await conceptExists(v);
                    }
                    if (!recommendedVerb) {
                        throw new validationError(
                            `Concept ${v} cannot be a recommended verb for ${conceptDocument.id} because it is not in this profile version or on the server.`,
                        );
                    }
                    if (recommendedVerb.type !== 'Verb') {
                        throw new validationError(
                            `Concept ${v} is not a Verb and therefore cannot be a recommended verb.`,
                        );
                    }

                    recommendedTerms.push(recommendedVerb);
                }));
            }

            model.recommendedTerms = recommendedTerms;
            return model;
        },
    };
}

function ActivityConceptLayer (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const conceptDocument = versionLayer.conceptDocument;
    const model = new ConceptModel({
        conceptType: conceptDocument.type,
        iri: conceptDocument.id,
        type: conceptDocument.type,
        parentProfile: versionLayer.parentProfile,
        ...jsonLdToModel.toActivityDefinition(conceptDocument.activityDefinition),
    });

    return {
        scanProfileComponentLayer: async function () {
            const exists = await conceptExists(conceptDocument.id);
            if (exists) {
                throw new conflictError(`Concept ${conceptDocument.id} already exists.`);
            }

            return model;
        },
        scanSubcomponentLayer: function () {
            return model;
        },
    };
}

exports.ConceptLayerFactory = function (versionLayer) {
    const conceptType = versionLayer.conceptDocument.type.toLowerCase();
    let conceptLayer;

    switch (conceptType) {
    case 'verb':
    case 'activitytype':
    case 'attachmentusagetype':
        conceptLayer = new SemanticallyRelatableConceptLayer(versionLayer);
        break;
    case 'contextextension':
    case 'resultextension':
    case 'activityextension':
        conceptLayer = new ExtensionConceptLayer(versionLayer);
        break;
    case 'stateresource':
    case 'agentprofileresource':
    case 'activityprofileresource':
        conceptLayer = new DocumentConceptLayer(versionLayer);
        break;
    case 'activity':
        conceptLayer = new ActivityConceptLayer(versionLayer);
        break;
    default:
        break;
    }

    return conceptLayer;
};
