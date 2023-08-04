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
const conceptService = require('../services/conceptService');
const createIRI = require('../utils/createIRI');
const queryBuilder = require('../utils/searchQueryBuilder');
const mongoSanitize = require('mongo-sanitize');
const memoizee = require('memoizee');

async function getVersionConcepts(versionUuid) {
    let concepts;
    try {
        const profileVersion = await profileVersionModel
            .findByUuid(versionUuid)
            .populate({
                path: 'concepts',
                select: 'uuid iri name conceptType updatedOn updatedBy isDeprecated',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid iri name state',
                    populate: { path: 'parentProfile', select: 'uuid name' },
                },
            })
            .populate({
                path: 'externalConcepts',
                select: 'uuid iri name conceptType updatedOn updatedBy isDeprecated',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid iri name state',
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
            .find({ parentProfile: { $ne: null } }, 'uuid iri name description conceptType updatedOn updatedBy')
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name state',
                populate: { path: 'parentProfile', select: 'uuid name' },
            });
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }

    return concepts;
}

exports.getAllConcepts = getAllConcepts;

/**
 * Find concepts
 *
 * @param {*} search what to search for in name, desc, and iri
 * @param {*} limit how many to return
 * @param {*} page what page of results
 * @param {*} sort asc or desc
 * @param {*} filter currently just a parentProfile uuid or nothing
 */
async function searchConcepts(search, limit, page, sort, filter) {
    const searchFilter = (filter) ? JSON.parse(mongoSanitize(filter)) : filter;
    const query = queryBuilder.buildSearchQuery(mongoSanitize(search));
    if (searchFilter.parentProfile) {
        const profileVersion = await profileVersionModel.findByUuid(searchFilter.parentProfile);
        query.parentProfile = profileVersion._id;
    }

    let results = conceptModel.find(query);
    if (!results) return [];
    if (limit) {
        const offset = limit * (page - 1 || 0);
        results = results.limit(Number(limit)).skip(offset);
    }
    if (sort) {
        const sorting = (sort === 'desc') ? '-createdOn' : 'createdOn';
        results = results.sort(sorting);
    }

    results = results.populate({
        path: 'parentProfile',
        select: 'uuid iri name state',
        populate: { path: 'organization parentProfile', select: 'uuid name' },
    })
        .populate({ path: 'similarTerms.concept', select: 'uuid name iri' })
        .populate({ path: 'recommendedTerms', select: 'uuid name iri' });

    return results;
}

exports.searchConcepts = searchConcepts;

const mem_getProfileVersionModel = memoizee(async (profileVersionId) => await profileVersionModel
    .findByUuid(profileVersionId)
    .populate({
        path: 'templates',
    }).exec(), {
    promise: true,
    maxAge: 100,

});


const mem_getAllTemplates = memoizee(async () => { console.prodLog('really qeurying all'); return await templateModel.find().exec(); }, {
    promise: true,
    maxAge: 100,

});

exports.getTemplatesUsingConcept = async function (conceptId, profileVersionId) {
    let templates;
    let concept;
    try {
        if (conceptId instanceof conceptModel) { concept = conceptId; } else { concept = await conceptModel.findByUuid(conceptId); }
        if (!concept) {
            throw new Error('Invalid concept id.');
        }
        if (profileVersionId) {
            const profileVersion = await mem_getProfileVersionModel(profileVersionId);

            if (!profileVersion) {
                throw new Error('Invalid profile version id.');
            }

            templates = profileVersion.templates;
        } else {
            templates = await mem_getAllTemplates();
        }
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
    return templates.filter(t => t.concepts.map(c => c._id.toString()).includes(concept._id.toString()));
};

const mem_getTemplatesUsingConcept = memoizee(async (c, pid) => await exports.getTemplatesUsingConcept(c, pid), {
    promise: true,
    maxAge: 100,

});

exports.getConcepts = async function (req, res) {
    let concepts;
    let profileVersionId = null;
    try {
        if (req.params.version) {
            profileVersionId = req.params.version;
            concepts = await getVersionConcepts(req.params.version);
        } else if (req.query.search !== undefined) {
            // search = 'string to search'
            // limit = # of results
            // sort = asc (oldest) | desc (newest)
            concepts = await searchConcepts(req.query.search, req.query.limit, req.query.page, req.query.sort, req.query.filter);
        } else {
            concepts = await getAllConcepts();
        }
        // for (const i in concepts) {
        //     const c = concepts[i].toObject();
        //     c.templates = await mem_getTemplatesUsingConcept(concepts[i], profileVersionId);
        //     concepts[i] = c;
        // }
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
                select: 'uuid iri name state',
                populate: [
                    { path: 'organization', select: 'uuid name' },
                    { path: 'parentProfile', select: 'uuid iri name' },
                ],
            })
            .populate({
                path: 'similarTerms.concept',
                populate: { path: 'parentProfile', populate: { path: 'parentProfile' } },
            })
            .populate('recommendedTerms')
            // .populate('updatedBy', 'firstname lastname email uuid');
            .populate('updatedBy', 'username uuid');

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

exports.onlyCreateConcept = async function (orguuid, versionuuid, conceptBody, user) {
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
    profileVersion.updatedBy = user;
    await profileVersion.save();
    return concept;
};

exports.createConcept = async function (req, res) {
    let concept;
    try {
        concept = await exports.onlyCreateConcept(req.params.org, req.params.version, req.body, req.user);
    } catch (err) {
        console.error(err);
        if (err instanceof require('mongoose').Error.ValidationError) {
            return res.status(400).send({
                success: false,
                message: err.message,
            });
        }
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

        Object.assign(concept, req.body, { updatedOn: new Date(), updatedBy: req.user });
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
        const conceptUuid = req.params.concept;
        const organizationId = req.params.org;
        const concept = await conceptModel.findOne({uuid: conceptUuid });
        if (!concept) throw new Error('Concept not found');
        let hasReferences = await conceptService.isReferencedElsewhere(concept._id);
        
        if (hasReferences) {
            conceptService.moveToOrphanContainer(req.user, organizationId, concept);
        } else {
            await conceptModel.deleteByUuid(conceptUuid);
        }

        const profileVersion = await profileVersionModel.findByUuid(req.params.version);
        profileVersion.concepts = [...profileVersion.concepts].filter(t => !t.equals(concept._id));
        profileVersion.externalConcepts = [...profileVersion.externalConcepts].filter(t => !t.equals(concept._id));
        profileVersion.updatedOn = new Date();
        profileVersion.updatedBy = req.user;
        await profileVersion.save();

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

exports.unlinkConcept = async function(concept, profileVersion, version) {
    if (!profileVersion) {
        profileVersion = await profileVersionModel.findByUuid(version);
    }

    // only unlink external concepts (aka different parent profile version)
    if (concept.parentProfile.uuid !== profileVersion.uuid) {
        if (profileVersion.externalConcepts && profileVersion.externalConcepts.length) {
            profileVersion.externalConcepts = profileVersion.externalConcepts.filter(c => c._id.toString() !== concept._id.toString());
            await profileVersion.save();
        }
    }
}


exports.unlinkConceptReq = async function (req, res) {
    try {
        const concept = req.resource;
        const profileVersion = await profileVersionModel.findByUuid(req.params.version);
        if (!profileVersion) {
            res.status(404).send({
                status: false,
                message: 'Unknown profile version',
            });
        }

        module.exports.unlinkConcept(concept, profileVersion)
        
    } catch (err) {
        if (console.prodLog) console.prodLog(err);
        else console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({ success: true });
};

exports.claimConcept = async function (req, res) {
    try {
        const concept = req.resource;
        const orphanProfileVersion = await profileVersionModel.findOne({ _id: concept.parentProfile });
        const newProfile = await profileModel.findOne({ _id: req.params.profile });

        const newProfileVersion = await profileVersionModel.findOne({ _id: (newProfile.currentDraftVersion || newProfile.currentPublishedVersion)});

        await conceptService.claimDeleted(concept, orphanProfileVersion, newProfileVersion);
    } catch (err) {
        if (console.prodLog) console.prodLog(err);
        else console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({ success: true });
}
