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
const patternComponentModel = require('../ODM/models').patternComponent;
const profileVersionModel = require('../ODM/models').profileVersion;
const organizationModel = require('../ODM/models').organization;
const profileModel = require('../ODM/models').profile;
const patternService = require('../services/patternService');
const createIRI = require('../utils/createIRI');
const queryBuilder = require('../utils/searchQueryBuilder');
const mongoSanitize = require('mongo-sanitize');

async function getVersionPatterns(versionUuid) {
    let patterns;
    try {
        const profileVersion = await profileVersionModel
            .findByUuid(versionUuid)
            .populate({
                path: 'patterns',
                select: 'uuid iri name primary type updatedOn updatedBy isDeprecated',
                populate: {
                    path: 'parentProfile',
                    select: 'uuid iri name state',
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
            .find({ parentProfile: { $ne: null } }, 'uuid iri name primary type updatedOn updatedBy')
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name state',
                populate: { path: 'parentProfile', select: 'uuid name' },
            });
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }

    return patterns;
}

exports.getAllPatterns = getAllPatterns;

async function searchPatterns(search, limit, page, sort) {
    const query = queryBuilder.buildSearchQuery(mongoSanitize(search));
    let results = patternModel.find(query);
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
        select: 'uuid name iri state',
        populate: { path: 'organization parentProfile', select: 'uuid name' },
    })
        .populate({
            path: 'sequence',
            populate: {
                path: 'component',
                select: 'uuid iri name',
            },
        })
        .populate({
            path: 'alternates',
            populate: {
                path: 'component',
                select: 'uuid iri name',
            },
        })
        .populate({
            path: 'oneOrMore',
            populate: {
                path: 'component',
                select: 'uuid iri name',
            },
        })
        .populate({
            path: 'zeroOrMore',
            populate: {
                path: 'component',
                select: 'uuid iri name',
            },
        })
        .populate({
            path: 'optional',
            populate: {
                path: 'component',
                select: 'uuid iri name',
            },
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
            patterns = await searchPatterns(req.query.search, req.query.limit, req.query.page, req.query.sort);
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
            const profileiri = (await profileVersion.populate('parentProfile').execPopulate()).parentProfile.iri;
            req.body.iri = createIRI.pattern(profileiri, req.body.name);
        }
        req.body.parentProfile = profileVersion._id;

        if (Array.isArray(req.body[req.body.type])) {
            req.body[req.body.type] = await Promise.all(
                req.body[req.body.type].map(async c => {
                    const comp = new patternComponentModel({
                        componentType: c.componentType,
                        component: c.component,
                    });
                    comp.save();
                    return comp;
                }),
            );
        } else if (req.body[req.body.type]) {
            const comp = new patternComponentModel({
                componentType: req.body[req.body.type].componentType,
                component: req.body[req.body.type].component,
            });
            await comp.save();
            req.body[req.body.type] = comp;
        }

        pattern = new patternModel();
        Object.assign(pattern, req.body);

        await pattern.save();
        profileVersion.patterns.push(pattern);
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
        pattern: pattern,
    });
};

exports.getPattern = async function (req, res) {
    let pattern;
    try {
        pattern = await patternModel.findByUuid(req.params.pattern)
            .populate('updatedBy', 'username uuid')
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name state',
                populate: [
                    { path: 'organization', select: 'uuid name' },
                    { path: 'parentProfile', select: 'uuid iri name' },
                ],
            })
            .populate({
                path: 'sequence',
                populate: {
                    path: 'component',
                    select: 'uuid iri name description type updatedOn updatedBy',
                    populate: {
                        path: 'parentProfile',
                        select: 'uuid name',
                        populate: { path: 'organization', select: 'uuid name' },
                    },
                },
            })
            .populate({
                path: 'alternates',
                populate: {
                    path: 'component',
                    select: 'uuid iri name description type updatedOn updatedBy',
                    populate: {
                        path: 'parentProfile',
                        select: 'uuid name',
                        populate: { path: 'organization', select: 'uuid name' },
                    },
                },
            })
            .populate({
                path: 'oneOrMore',
                populate: {
                    path: 'component',
                    select: 'uuid iri name description type updatedOn updatedBy',
                    populate: {
                        path: 'parentProfile',
                        select: 'uuid name',
                        populate: { path: 'organization', select: 'uuid name' },
                    },
                },
            })
            .populate({
                path: 'zeroOrMore',
                populate: {
                    path: 'component',
                    select: 'uuid iri name description type updatedOn updatedBy',
                    populate: {
                        path: 'parentProfile',
                        select: 'uuid name',
                        populate: { path: 'organization', select: 'uuid name' },
                    },
                },
            })
            .populate({
                path: 'optional',
                populate: {
                    path: 'component',
                    select: 'uuid iri name description type updatedOn updatedBy',
                    populate: {
                        path: 'parentProfile',
                        select: 'uuid name',
                        populate: { path: 'organization', select: 'uuid name' },
                    },
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
        pattern = await patternModel.findByUuid(req.params.pattern)
            .populate(req.body.type);

        if (!pattern) {
            return res.status(404).send({
                success: false,
                message: 'A pattern was not found for this uuid.',
            });
        }

        if (Array.isArray(pattern[pattern.type])) {
            await Promise.all(
                pattern[pattern.type].map(async c => {
                    c.remove();
                }),
            );

            req.body[req.body.type] = await Promise.all(
                req.body[req.body.type].map(async c => {
                    const comp = new patternComponentModel({
                        componentType: c.componentType,
                        component: c.component,
                    });
                    comp.save();
                    return comp;
                }),
            );
        } else if (req.body[req.body.type]) {
            if (pattern[pattern.type]) {
                await pattern[pattern.type].remove();
            }

            const comp = new patternComponentModel({
                componentType: req.body[req.body.type].componentType,
                component: req.body[req.body.type].component,
            });
            await comp.save();
            req.body[req.body.type] = comp;
        }

        Object.assign(pattern, req.body, { updatedOn: new Date(), updatedBy: req.user });
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

        if (!pattern.type) throw new Error('Pattern must have a type');
        // await pattern.populate(pattern.type).execPopulate();

        let hasReferences = await patternService.hasProfileReferences(pattern._id);

        if (hasReferences) {
            await patternService.moveToOrphanContainer(req.user, req.params.org, pattern);
        }
        else {
            if (pattern.parentProfile.equals(profileVersion._id)) {
                if (Array.isArray(pattern[pattern.type])) {
                    await Promise.all(
                        pattern[pattern.type].map(async c => {
                            c.remove();
                        }),
                    );
                } else if (pattern[pattern.type]) {
                    await pattern[pattern.type].remove();
                }
                await pattern.remove();
            }
        }
        
        profileVersion.patterns = [...profileVersion.patterns].filter(t => !t.equals(pattern._id));
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

exports.claimPattern = async function (req, res) {
    try {
        const pattern = req.resource;
        const orphanProfileVersion = await profileVersionModel.findOne({ _id: pattern.parentProfile});
        const newProfile = await profileModel.findOne({ _id: req.params.profile });
        const newProfileVersion = await profileVersionModel.findOne({ _id: (newProfile.currentDraftVersion || newProfile.currentPublishedVersion)});

        await patternService.claimDeleted(pattern, orphanProfileVersion, newProfileVersion);   

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