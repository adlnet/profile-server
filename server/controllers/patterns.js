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
const patternModel = require('../ODM/models').pattern;
const profileVersionModel = require('../ODM/models').profileVersion;
const organizationModel = require('../ODM/models').organization;
const createIRI = require('../utils/createIRI');
const queryBuilder = require('../utils/searchQueryBuilder');

async function getVersionPatterns(versionUuid) {
    let patterns;
    try {
        const profileVersion = await profileVersionModel
            .findByUuid(versionUuid)
            .populate({
                path: 'patterns',
                select: 'uuid iri name primary type updatedOn',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid iri name',
                    populate: { path: 'parentProfile', select: 'uuid name' },
                },
            });

        if (!profileVersion) {
            throw new Error('A profile version was not found for this uuid');
        }

        patterns = profileVersion.patterns;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }

    return patterns;
}

exports.getVersionPatterns = getVersionPatterns;

async function getAllPatterns() {
    let patterns;
    try {
        patterns = await patternModel
            .find({}, 'uuid iri name primary type updatedOn')
            .where({ isActive: true })
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name',
                populate: { path: 'parentProfile', select: 'uuid name' },
            });
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }

    return patterns;
}

exports.getAllPatterns = getAllPatterns;

async function searchPatterns(search) {
    const query = queryBuilder.buildSearchQuery(search);
    const results = await patternModel.find(query)
        .where({ isActive: true })
        .populate({
            path: 'parentProfile',
            select: 'uuid name iri',
            populate: { path: 'organization', select: 'uuid name' },
        })
        .populate({
            path: 'sequence.component',
            select: 'uuid iri name',
        })
        .populate({
            path: 'alternates.component',
            select: 'uuid iri name',
        })
        .populate({
            path: 'oneOrMore.component',
            select: 'uuid iri name',
        })
        .populate({
            path: 'zeroOrMore.component',
            select: 'uuid iri name',
        })
        .populate({
            path: 'optional.component',
            select: 'uuid iri name',
        });

    return results;
}

exports.searchPatterns = searchPatterns;

exports.getPatterns = async function (req, res) {
    let patterns;
    try {
        if (req.params.version) {
            patterns = await getVersionPatterns(req.params.version);
        } else if (req.query.search) {
            patterns = await searchPatterns(req.query.search);
        } else {
            patterns = await getAllPatterns();
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
        patterns: patterns,
    });
};

exports.createPattern = async function (req, res) {
    let pattern;
    try {
        const organization = await organizationModel.findByUuid(req.params.org);
        const profileVersion = await profileVersionModel.findByUuid(req.params.version);

        if (!(organization && profileVersion)) {
            return res.status(404).send({
                success: false,
                message: 'A organization or profile version was not found for this uuid.',
            });
        }

        if (!req.body.iri) {
            const profileuuid = (await profileVersion.populate('parentProfile').execPopulate()).parentProfile.uuid;
            req.body.iri = createIRI.pattern(profileuuid, req.body.name);
        }
        req.body.parentProfile = profileVersion._id;

        pattern = new patternModel();
        Object.assign(pattern, req.body);

        await pattern.save();
        profileVersion.patterns.push(pattern);
        profileVersion.updatedOn = new Date();
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
        pattern: pattern,
    });
};

exports.getPattern = async function (req, res) {
    let pattern;
    try {
        pattern = await patternModel.findByUuid(req.params.pattern)
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name',
                populate: [
                    { path: 'organization', select: 'uuid name' },
                    { path: 'parentProfile', select: 'uuid iri name' },
                ],
            })
            .populate({
                path: 'sequence.component',
                select: 'uuid iri name description type updatedOn updatedOn',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid name',
                    populate: { path: 'organization', select: 'uuid name' },
                },
            })
            .populate({
                path: 'alternates.component',
                select: 'uuid iri name description type updatedOn',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid name',
                    populate: { path: 'organization', select: 'uuid name' },
                },
            })
            .populate({
                path: 'oneOrMore.component',
                select: 'uuid iri name description type updatedOn',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid name',
                    populate: { path: 'organization', select: 'uuid name' },
                },
            })
            .populate({
                path: 'zeroOrMore.component',
                select: 'uuid iri name description type updatedOn',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid name',
                    populate: { path: 'organization', select: 'uuid name' },
                },
            })
            .populate({
                path: 'optional.component',
                select: 'uuid iri name description type updatedOn',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid name',
                    populate: { path: 'organization', select: 'uuid name' },
                },
            });

        if (!pattern) {
            return res.status(404).send({
                success: false,
                message: 'A pattern was not found for this uuid.',
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
        pattern: pattern,
    });
};

exports.updatePattern = async function (req, res) {
    let pattern;
    try {
        pattern = await patternModel.findByUuid(req.params.pattern);

        if (!pattern) {
            return res.status(404).send({
                success: false,
                message: 'A pattern was not found for this uuid.',
            });
        }

        Object.assign(pattern, req.body, { updatedOn: new Date() });
        await pattern.save();
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        pattern: pattern,
    });
};

exports.deletePattern = async function (req, res) {
    try {
        const pattern = await patternModel.findByUuid(req.params.pattern);
        const profileVersion = await profileVersionModel.findByUuid(req.params.version);

        if (!(pattern && profileVersion)) {
            return res.status(404).send({
                success: false,
                message: 'A pattern or profileVersion was not found for this uuid.',
            });
        }

        if (pattern.parentProfile.equals(profileVersion._id)) {
            pattern.isActive = false;
            pattern.updatedOn = new Date();
            await pattern.save();
        }

        profileVersion.patterns = [...profileVersion.patterns].filter(t => !t.equals(pattern._id));
        profileVersion.updatedOn = new Date();
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
