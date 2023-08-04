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
const templateModel = require('../ODM/models').template;
const profileVersionModel = require('../ODM/models').profileVersion;
const organizationModel = require('../ODM/models').organization;
const profileModel = require('../ODM/models').profile;
const templateService = require('../services/templateService');
const createIRI = require('../utils/createIRI');
const queryBuilder = require('../utils/searchQueryBuilder');
const mongoSanitize = require('mongo-sanitize');
const templates = require('../routes/templates');

async function getVersionTemplates(versionUuid) {
    let templates;
    try {
        const profileVersion = await profileVersionModel
            .findByUuid(versionUuid)
            .populate({
                path: 'templates',
                parentProfile: { $ne: null },
                populate: {
                    path: 'parentProfile concepts verb objectActivityType contextCategoryActivityType contextGroupingActivityType contextOtherActivityType contextParentActivityType attachmentUsageType',
                    select: 'name uuid state',
                    populate: { path: 'parentProfile', select: 'uuid', populate: { path: 'parentProfile organization', select: 'uuid' } },
                },
            });

        if (!profileVersion) {
            throw new Error('A profile version was not found for this uuid');
        }

        templates = profileVersion.templates;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }

    return templates;
}

exports.getVersionTemplates = getVersionTemplates;

async function searchTemplates(search, limit, page, sort) {
    const query = queryBuilder.buildSearchQuery(mongoSanitize(search));
    let results = templateModel.find(query);
    if (!results) return [];
    if (limit) {
        const offset = limit * (page - 1 || 0);
        results = results.limit(Number(limit)).skip(offset);
    }
    if (sort) {
        const sorting = (sort === 'desc') ? '-createdOn' : 'createdOn';
        results = results.sort(sorting);
    }
    results.populate({
        path: 'parentProfile',
        select: 'uuid iri name state',
        populate: { path: 'organization parentProfile', select: 'uuid name' },
    })
        .populate({
            path: 'verb',
            select: 'uuid iri name description',
        })
        .populate({
            path: 'objectActivityType',
            select: 'uuid iri name description',
        })
        .populate({
            path: 'contextGroupingActivityType',
            select: 'uuid iri name description',
        })
        .populate({
            path: 'contextParentActivityType',
            select: 'uuid iri name description',
        })
        .populate({
            path: 'contextOtherActivityType',
            select: 'uuid iri name description',
        })
        .populate({
            path: 'contextCategoryActivityType',
            select: 'uuid iri name description',
        })
        .populate({
            path: 'attachmentUsageType',
            select: 'uuid iri name description',
        });

    return results;
}

exports.searchTemplates = searchTemplates;

async function getAllTemplates() {
    let templates;
    try {
        templates = await templateModel
            .find({ parentProfile: { $ne: null } }, 'uuid iri name description updatedOn updatedBy')
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name state',
                populate: { path: 'organization', select: 'uuid name' },
            });
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }

    return templates;
}

exports.getAllTemplates = getAllTemplates;

exports.getTemplates = async function (req, res) {
    let templates = [];
    try {
        if (req.params.version) {
            templates = await getVersionTemplates(req.params.version);
        } else if (req.query.search) {
            templates = await searchTemplates(req.query.search, req.query.limit, req.query.page, req.query.sort);
        } else {
            templates = await getAllTemplates();
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
        templates: templates,
    });
};

exports.createTemplate = async function (req, res) {
    let template;
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
            req.body.iri = createIRI.template(profileiri, req.body.name);
        }
        req.body.parentProfile = profileVersion._id;
        req.body.updatedBy = req.user;

        template = new templateModel();
        Object.assign(template, req.body);

        await template.save();
        profileVersion.templates.push(template);
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
        template: template,
    });
};

exports.getTemplate = async function (req, res) {
    let template;
    try {
        template = await templateModel.findByUuid(req.params.template)
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name state',
                populate: [
                    { path: 'organization', select: 'uuid name' },
                    { path: 'parentProfile', select: 'uuid iri' },
                ],
            })
            .populate({
                path: 'verb',
                select: 'uuid iri name conceptType updatedOn description',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'objectActivityType',
                select: 'uuid iri name conceptType updatedOn description',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'contextGroupingActivityType',
                select: 'uuid iri name conceptType updatedOn description',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'contextParentActivityType',
                select: 'uuid iri name conceptType updatedOn description',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'contextOtherActivityType',
                select: 'uuid iri name conceptType updatedOn description',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'contextCategoryActivityType',
                select: 'uuid iri name conceptType updatedOn description',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'attachmentUsageType',
                select: 'uuid iri name conceptType updatedOn description',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'objectStatementRefTemplate',
                select: 'uuid iri name updatedOn description',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'contextStatementRefTemplate',
                select: 'uuid iri name updatedOn description',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'updatedBy',
                // select: 'email firstname lastname uuid',
                select: 'username uuid',
            });

        if (!template) {
            return res.status(404).send({
                success: false,
                message: 'A template was not found for this uuid.',
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
        template: template,
    });
};

exports.updateTemplate = async function (req, res) {
    let template;
    try {
        template = await templateModel.findByUuid(req.params.template);

        if (!template) {
            return res.status(404).send({
                success: false,
                message: 'A template was not found for this uuid.',
            });
        }

        Object.assign(template, req.body, { updatedOn: new Date(), updatedBy: req.user });
        await template.save();
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        template: template,
    });
};

exports.deleteTemplate = async function (req, res) {
    try {
        const template = await templateModel.findByUuid(req.params.template);
        const profileVersion = await profileVersionModel.findByUuid(req.params.version);

        if (!(template && profileVersion)) {
            return res.status(404).send({
                success: false,
                message: 'No template or profile version found for this uuid.',
            });
        }

        let hasReferences = await templateService.hasPatternReferences(template._id);

        if (hasReferences) {
            await templateService.moveToOrphanContainer(req.user, req.params.org, template);
        }
        else {
            if (template.parentProfile.equals(profileVersion._id)) {
                await template.remove();
            }
        }

        profileVersion.templates = [...profileVersion.templates].filter(t => !t.equals(template._id));
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

exports.unlinkTemplate = async function (req, res) {
    try {
        const template = req.resource;
        const profileVersion = await profileVersionModel.findByUuid(req.params.version);
        if (!profileVersion) {
            res.status(404).send({
                status: false,
                message: 'Unknown profile version',
            });
        }

        // only unlink external templates (aka different parent profile version)
        if (template.parentProfile.uuid !== profileVersion.uuid) {
            if (profileVersion.templates && profileVersion.templates.length) {
                profileVersion.templates = profileVersion.templates.filter(c => c._id.toString() !== template._id.toString());
                await profileVersion.save();
            }
        }
    } catch (err) {
        if (console.prodLog) console.prodLog(err);
        else console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    return res.send({ success: true });
};

exports.claimTemplate = async function (req, res) {
    try {
        const template = req.resource;
        const orphanProfileVersion = await profileVersionModel.findOne({ _id: template.parentProfile});
        const newProfile = await profileModel.findOne({ _id: req.params.profile });
        const newProfileVersion = await profileVersionModel.findOne({ _id: (newProfile.currentDraftVersion || newProfile.currentPublishedVersion)});

        await templateService.claimDeleted(template, orphanProfileVersion, newProfileVersion);
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