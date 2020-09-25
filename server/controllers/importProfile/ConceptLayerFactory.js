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
const hasNoDuplicates = require('../../utils/hasNoDuplicates');
const jsonLdDiff = require('../../utils/jsonLdDiff');

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

async function testModel(conceptDocument, conceptModel, versionStatus, parentProfile) {
    let thisModel;
    let testedModel;

    const exists = await conceptExists(conceptDocument.id);
    if (exists) {
        if (exists.parentProfile) {
            if (versionStatus === 'new'
                || (versionStatus === 'draft' && exists.parentProfile._id.toString() !== parentProfile._id.toString())
            ) {
                const existingJsonLd = await exists.export(parentProfile.iri);
                jsonLdDiff(existingJsonLd, conceptDocument, (path, action, value) => {
                    const splitPath = path.split('.');
                    if (!(
                        (action === 'add' && ['prefLabel', 'definition'].some(s => splitPath.includes(s)))
                        || (['add', 'update', 'delete'].includes(action) && splitPath.includes('deprecated'))
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
                            `${path} cannot be ${actionError} published concept ${conceptDocument.id}`,
                        );
                    }
                }, ['id']);
            } else if (versionStatus === 'draft') {
            } else {
                throw new conflictError(`Concept ${conceptDocument.id} already exists.`);
            }

            conceptModel.parentProfile = undefined;
        }

        thisModel = conceptModel.toObject();
        delete thisModel._id;
        delete thisModel.createdOn;
        delete thisModel.uuid;
        delete thisModel.createdBy;
        exists.set(thisModel);
        testedModel = exists;
    } else {
        testedModel = conceptModel;
    }

    return testedModel;
}

function SemanticallyRelatableConceptLayer (versionLayer) {
    const conceptDocument = versionLayer.conceptDocument;
    let model = new ConceptModel({
        ...commonConceptProperties(conceptDocument, versionLayer.parentProfile),
        conceptType: conceptDocument.type,
        createdBy: versionLayer.parentProfile.updatedBy,
        updatedBy: versionLayer.parentProfile.updatedBy,
    });

    return {
        scanProfileComponentLayer: async function () {
            model = await testModel(conceptDocument, model, versionLayer.versionStatus, versionLayer.parentProfile);

            return model;
        },
        scanSubcomponentLayer: async function (profileConcepts) {
            const externalRelationTypes = ['relatedMatch', 'broadMatch', 'narrowMatch', 'exactMatch'];
            const profileRelationTypes = ['related', 'broader', 'narrower'];

            const similarTerms = [];
            for (const type of externalRelationTypes.filter(t => Object.keys(conceptDocument).includes(t))) {
                if (!hasNoDuplicates(conceptDocument[type])) {
                    throw new validationError(`Concept ${conceptDocument.id} has duplicate concepts in property ${type}`);
                }
                await Promise.all(conceptDocument[type].map(async t => {
                    if (profileConcepts.find(p => p.iri === t)) {
                        throw new validationError(`Concept ${t} cannot have a ${type} relation because it is part of this profile version.`);
                    }

                    let externalConcept = await conceptExists(t);
                    if (!externalConcept) {
                        externalConcept = new ConceptModel({ iri: t });
                        await externalConcept.save();
                    }

                    similarTerms.push({
                        relationType: type,
                        concept: externalConcept,
                    });
                }));
            }

            profileRelationTypes.filter(t => Object.keys(conceptDocument).includes(t)).forEach(e => {
                const terms = conceptDocument[e] || [];
                if (!hasNoDuplicates(terms)) {
                    throw new validationError(`Concept ${conceptDocument.id} has duplicate concepts in property ${e}`);
                }
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

            await model.validate();
            return model;
        },
    };
}

function DocumentConceptLayer (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const conceptDocument = versionLayer.conceptDocument;
    let model = new ConceptModel({
        ...commonConceptProperties(conceptDocument, versionLayer.parentProfile),
        contextIri: conceptDocument.context,
        conceptType: 'Document',
        mediaType: conceptDocument.contentType,
        ...jsonLdToModel.toSchema(conceptDocument.inlineSchema, conceptDocument.schema),
        createdBy: versionLayer.parentProfile.updatedBy,
        updatedBy: versionLayer.parentProfile.updatedBy,
    });

    return {
        scanProfileComponentLayer: async function () {
            model = await testModel(conceptDocument, model, versionLayer.versionStatus, versionLayer.parentProfile);

            return model;
        },
        scanSubcomponentLayer: async function () {
            await model.validate();
            return model;
        },
    };
}

function ExtensionConceptLayer (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const conceptDocument = versionLayer.conceptDocument;
    let model = new ConceptModel({
        ...commonConceptProperties(conceptDocument, versionLayer.parentProfile),
        contextIri: conceptDocument.context,
        conceptType: 'Extension',
        ...jsonLdToModel.toSchema(conceptDocument.inlineSchema, conceptDocument.schema),
        createdBy: versionLayer.parentProfile.updatedBy,
        updatedBy: versionLayer.parentProfile.updatedBy,
    });

    return {
        scanProfileComponentLayer: async function () {
            model = await testModel(conceptDocument, model, versionLayer.versionStatus, versionLayer.parentProfile);

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
                if (!hasNoDuplicates(recommendedActivityTypes)) {
                    throw new validationError(`Concept ${conceptDocument.id} has duplicate concepts in property recommendedActivityTypes`);
                }

                await Promise.all(recommendedActivityTypes.map(async a => {
                    let recommendedActivityType = profileConcepts.find(p => p.iri === a);
                    if (!recommendedActivityType) {
                        recommendedActivityType = await conceptExists(a);
                    }
                    if (!recommendedActivityType) {
                        recommendedActivityType = new ConceptModel({ iri: a, type: 'ActivityType' });
                        await recommendedActivityType.save();
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
                if (!hasNoDuplicates(recommendedVerbs)) {
                    throw new validationError(`Concept ${conceptDocument.id} has duplicate concepts in property recommendedVerbs`);
                }

                await Promise.all(recommendedVerbs.map(async v => {
                    let recommendedVerb = profileConcepts.find(p => p.iri === v);
                    if (!recommendedVerb) {
                        recommendedVerb = await conceptExists(v);
                    }
                    if (!recommendedVerb) {
                        recommendedVerb = new ConceptModel({ iri: v, type: 'Verb' });
                        await recommendedVerb.save();
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

            await model.validate();
            return model;
        },
    };
}

function ActivityConceptLayer (versionLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const conceptDocument = versionLayer.conceptDocument;
    let model = new ConceptModel({
        conceptType: conceptDocument.type,
        iri: conceptDocument.id,
        type: conceptDocument.type,
        parentProfile: versionLayer.parentProfile,
        ...jsonLdToModel.toActivityDefinition(conceptDocument.activityDefinition),
        createdBy: versionLayer.parentProfile.updatedBy,
        updatedBy: versionLayer.parentProfile.updatedBy,
    });

    return {
        scanProfileComponentLayer: async function () {
            model = await testModel(conceptDocument, model, versionLayer.versionStatus, versionLayer.parentProfile);

            return model;
        },
        scanSubcomponentLayer: async function () {
            await model.validate();
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
