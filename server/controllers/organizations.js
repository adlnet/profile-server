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
const organizationModel = require('../ODM/models').organization;
const mongoSanitize = require('mongo-sanitize');

exports.getOrganizations = async function (req, res) {
    let organizations;
    try {
        organizations = await organizationModel
            .find({ })
            .populate({ path: 'profiles', select: 'uuid name' })
            .populate({ path: 'members.user', select: 'uuid username' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
    organizations = organizations.map(i => i.toObject({ virtuals: true }));
    if (req.user) {
        for (const i in organizations) {
            organizations[i].membership = organizations[i].members.filter(
                i => i.user.id.toString() == req.user.id,
            );
            if (organizations[i].membership[0]) { organizations[i].membership = organizations[i].membership[0].level; } else delete organizations[i].membership;
        }
    }
    res.send({
        success: true,
        organizations: organizations,
    });
};

exports.createOrganization = async function (req, res) {
    let organization;
    try {
        organization = new organizationModel(req.body);
        organization.members.push({
            level: 'owner',
            user: req.user,
        });
        organization.createdBy = req.user;
        organization.updatedBy = req.user;
        await organization.save();
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        organization: organization,
    });
};

exports.getOrganization = async function (req, res) {
    let organization;
    try {
        organization = await organizationModel.findByUuid(req.params.org)
            .populate('createdBy', 'uuid username')
            .populate({
                path: 'profiles',
                select: 'uuid updatedOn',
                populate: [
                    { path: 'currentDraftVersion', select: 'uuid name' },
                    { path: 'currentPublishedVersion', select: 'uuid name' },
                ],
            })
            .populate({ path: 'members.user', select: 'uuid username' })
            .populate({ path: 'apiKeys', select: 'uuid' });

        if (!organization) {
            return res.status(404).send({
                success: false,
                message: 'No organization found for this uuid',
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
    organization = organization.toObject({ virtuals: true });
    organization.membership = req.permissionLevel;
    res.send({
        success: true,
        organization: organization,
    });
};

exports.updateOrganization = async function (req, res) {
    let organization;
    try {
        organization = await organizationModel.findByUuid(req.params.org);

        if (!organization) {
            return res.status(404).send({
                success: false,
                message: 'No organization found for this uuid',
            });
        }

        Object.assign(organization, req.body);
        organization.updatedOn = new Date();
        organization.updatedBy = req.user;
        await organization.save();
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        organization: organization,
    });
};

exports.deleteOrganization = async function (req, res) {
    try {
        await organizationModel.deleteByUuid(req.params.org);
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
