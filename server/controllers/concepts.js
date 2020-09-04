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
const conceptModel = require('../ODM/models').concept;
const templateModel = require('../ODM/models').template;
const profileVersionModel = require('../ODM/models').profileVersion;
const organizationModel = require('../ODM/models').organization;
const profileModel = require('../ODM/models').profile;
const createIRI = require('../utils/createIRI');
const queryBuilder = require('../utils/searchQueryBuilder');
const mongoSanitize = require('mongo-sanitize');

async function getVersionConcepts(versionUuid) {
    let concepts;
    try {
        const profileVersion = await profileVersionModel
            .findByUuid(versionUuid)
            .populate({
                path: 'concepts',
                select: 'uuid iri name conceptType updatedOn',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid iri name',
                    populate: { path: 'parentProfile', select: 'uuid name' },
                },
            })
            .populate({
                path: 'externalConcepts',
                select: 'uuid iri name conceptType updatedOn',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid iri name',
                    populate: { path: 'parentProfile', select: 'uuid name' },
                },
            });

        if (!profileVersion) {
            throw new Error('A profile version was not found for this uuid');
        }

        concepts = [...profileVersion.concepts, ...profileVersion.externalConcepts];
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }

    return concepts;
}

exports.getVersionConcepts = getVersionConcepts;

async function getAllConcepts() {
    let concepts;
    try {
        concepts = await conceptModel
            .find({}, 'uuid iri name description conceptType updatedOn')
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name',
                populate: { path: 'parentProfile', select: 'uuid name' },
            });
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }

    return concepts;
}

exports.getAllConcepts = getAllConcepts;

async function searchConcepts(search) {
    const query = queryBuilder.buildSearchQuery(search);
    const results = await conceptModel.find(query)
        .populate({
            path: 'parentProfile',
            select: 'uuid iri name',
            populate: { path: 'organization', select: 'uuid name' },
        })
        .populate({ path: 'similarTerms.concept', select: 'uuid name iri' })
        .populate({ path: 'recommendedTerms', select: 'uuid name iri' });

    return results;
}

exports.searchConcepts = searchConcepts;

exports.getTemplatesUsingConcept = async function (conceptId, profileVersionId) {
    let templates;
    let concept;
    try {
        concept = await conceptModel.findByUuid(conceptId);
        if (!concept) {
            throw new Error('Invalid concept id.');
        }
        if (profileVersionId) {
            const profileVersion = await profileVersionModel
                .findByUuid(profileVersionId)
                .populate({
                    path: 'templates',
                });

            if (!profileVersion) {
                throw new Error('Invalid profile version id.');
            }

            templates = profileVersion.templates;
        } else {
            templates = await templateModel.find();
        }
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
    return templates.filter(t => t.concepts.map(c => c._id.toString()).includes(concept._id.toString()));
};

exports.getConcepts = async function (req, res) {
    let concepts;
    let profileVersionId = null;
    try {
        if (req.params.version) {
            profileVersionId = req.params.version;
            concepts = await getVersionConcepts(req.params.version);
        } else if (req.query.search) {
            concepts = await searchConcepts(req.query.search);
        } else {
            concepts = await getAllConcepts();
        }

        concepts = await Promise.all(concepts.map(async concept => {
            const c = concept.toObject();
            c.templates = await exports.getTemplatesUsingConcept(concept.uuid, profileVersionId);
            console.log(concept.templates);
            return c;
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        concepts: concepts,
    });
};

exports.getConcept = async function (req, res) {
    let concept;
    try {
        concept = await conceptModel.findByUuid(req.params.concept)
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name',
                populate: [
                    { path: 'organization', select: 'uuid name' },
                    { path: 'parentProfile', select: 'uuid iri name' },
                ],
            })
            .populate('similarTerms.concept')
            .populate('recommendedTerms');

        if (!concept) {
            return res.status(404).send({
                success: false,
                message: 'A concept was not found for this uuid.',
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        concept: concept,
    });
};

exports.onlyCreateConcept = async function (orguuid, versionuuid, conceptBody) {
    const organization = await organizationModel.findByUuid(orguuid);
    const profileVersion = await profileVersionModel.findByUuid(versionuuid);

    if (!(organization && profileVersion)) {
        throw new Error('A organization or profile version was not found for this uuid.');
    }

    if (!conceptBody.iri) {
        const profileiri = (await profileVersion.populate('parentProfile').execPopulate()).parentProfile.iri;
        conceptBody.iri = createIRI.concept(profileiri, conceptBody.name, conceptBody.type);
    }
    conceptBody.parentProfile = profileVersion._id;

    const concept = new conceptModel();
    Object.assign(concept, conceptBody);

    await concept.save();
    profileVersion.concepts.push(concept);
    profileVersion.updatedOn = new Date();
    await profileVersion.save();
    return concept;
};

exports.createConcept = async function (req, res) {
    let concept;
    try {
        concept = await exports.onlyCreateConcept(req.params.org, req.params.version, req.body);
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        concept: concept,
    });
};

exports.updateConcept = async function (req, res) {
    let concept;
    try {
        concept = await conceptModel.findByUuid(req.params.concept);

        if (!concept) {
            return res.status(404).send({
                success: false,
                message: 'A concept was not found for this uuid.',
            });
        }

        Object.assign(concept, req.body, { updatedOn: new Date() });
        await concept.save();
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        concept: concept,
    });
};

exports.deleteConcept = async function (req, res) {
    try {
        await conceptModel.deleteByUuid(req.params.concept);
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
    });
};
