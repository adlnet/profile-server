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
const createIRI = require('../utils/createIRI');
const queryBuilder = require('../utils/searchQueryBuilder');
const mongoSanitize = require('mongo-sanitize');

async function getVersionTemplates(versionUuid) {
    let templates;
    try {
        const profileVersion = await profileVersionModel
            .findByUuid(versionUuid)
            .populate({
                path: 'templates',
                select: 'uuid name iri updatedOn',
                populate: { path: 'parentProfile', select: 'uuid name' },
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

async function searchTemplates(search) {
    const query = queryBuilder.buildSearchQuery(search);
    const results = await templateModel.find(mongoSanitize(query))
        .populate({
            path: 'parentProfile',
            select: 'uuid iri name state',
            populate: { path: 'organization', select: 'uuid name' },
        })
        .populate({
            path: 'verb',
            select: 'uuid iri name',
        })
        .populate({
            path: 'objectActivityType',
            select: 'uuid iri name',
        })
        .populate({
            path: 'contextGroupingActivityType',
            select: 'uuid iri name',
        })
        .populate({
            path: 'contextParentActivityType',
            select: 'uuid iri name',
        })
        .populate({
            path: 'contextOtherActivityType',
            select: 'uuid iri name',
        })
        .populate({
            path: 'contextCategoryActivityType',
            select: 'uuid iri name',
        })
        .populate({
            path: 'attachmentUsageType',
            select: 'uuid iri name',
        });

    return results;
}

exports.searchTemplates = searchTemplates;

async function getAllTemplates() {
    let templates;
    try {
        templates = await templateModel
            .find({}, 'uuid iri name description updatedOn ')
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
            templates = await searchTemplates(req.query.search);
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

        template = new templateModel();
        Object.assign(template, req.body);

        await template.save();
        profileVersion.templates.push(template);
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
        template: template,
    });
};

exports.getTemplate = async function (req, res) {
    let template;
    try {
        template = await templateModel.findByUuid(req.params.template)
            .populate({
                path: 'parentProfile',
                select: 'uuid iri name',
                populate: [
                    { path: 'organization', select: 'uuid name' },
                    { path: 'parentProfile', select: 'uuid iri' },
                ],
            })
            .populate({
                path: 'verb',
                select: 'uuid iri name conceptType updatedOn',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'objectActivityType',
                select: 'uuid iri name conceptType updatedOn',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'contextGroupingActivityType',
                select: 'uuid iri name conceptType updatedOn',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'contextParentActivityType',
                select: 'uuid iri name conceptType updatedOn',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'contextOtherActivityType',
                select: 'uuid iri name conceptType updatedOn',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'contextCategoryActivityType',
                select: 'uuid iri name conceptType updatedOn',
                populate: { path: 'parentProfile', select: 'uuid name' },
            })
            .populate({
                path: 'attachmentUsageType',
                select: 'uuid iri name conceptType updatedOn',
                populate: { path: 'parentProfile', select: 'uuid name' },
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

        Object.assign(template, req.body, { updatedOn: new Date() });
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

        if (template.parentProfile.equals(profileVersion._id)) {
            await template.remove();
        }

        profileVersion.templates = [...profileVersion.templates].filter(t => !t.equals(template._id));
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
