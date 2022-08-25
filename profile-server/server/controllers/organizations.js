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
const profileModel = require('../ODM/models').profile;
const userModel = require('../ODM/models').user;
const mongoSanitize = require('mongo-sanitize');
const { resendValidation } = require('./users');

function removePrivateNames(organizations) {

    for (let org of organizations) {

        if (org == undefined)
            continue;

        for (let member of org.members) {

            if (member == undefined || member.user == undefined)
                continue;

            if (member.user.publicizeName == false) {
                delete member.user.fullname;
                delete member.user.firstname;
                delete member.user.lastname;
            }
        }

        for (let request of org.memberRequests) {

            if (request == undefined || request.user == undefined)
                continue;
            
            if (request.user.publicizeName == false) {
                delete request.user.fullname;
                delete request.user.firstname;
                delete request.user.lastname;
            }
        }
    }
}

function cleanMembershipInfo(organizations, user) {

    for (let org of organizations) {

        org.memberCount = org.members.length;

        let matchingMembers = org.members.filter(i => i.user.id.toString() == user.id);
        let belongsToOrg = matchingMembers.length > 0;
        if (belongsToOrg) { 
            org.membership = matchingMembers[0].level; 
        } 
        
        else {
            // delete org.members;
            // delete org.memberRequests;

            // TODO: Resolve on UI side and eventually remove this.
            org.members = [];
            org.memberRequests = [];
        }
    }
}

function removeMemberInfo(organizations) {
    for (let org of organizations) {

        if (Array.isArray(org.members))
            org.memberCount = org.members.length;
        else
            org.memberCount = "Unknown";

        delete org.members;
        delete org.memberRequests;
    }
}

function setRegex(column, searchArray) {
    return searchArray.map(s => ({ [column]: { $regex: `.*${s}.*`, $options: 'i' } }));
}

function orgQuery(searchString) {
    if (!searchString) return { parentProfile: { $ne: null } };
    let search = searchString.split(' ')
        .map(s => s.trim())
        .filter(s => s);
    // if it's empty the search string was " "
    if (!search.length) { search = ['\\w']; }

    return {
        $or: [
            { $or: setRegex('name', search) },
            { $or: setRegex('description', search) },
        ],
    };
}

function searchOrganizations(search, limit, page, sort) {
    const query = orgQuery(mongoSanitize(search));
    let results = organizationModel.find(query);
    if (!results) return [];
    if (limit) {
        const offset = limit * (page - 1 || 0);
        results = results.limit(Number(limit)).skip(offset);
    }
    if (sort) {
        const sorting = (sort === 'desc') ? '-createdOn' : 'createdOn';
        results = results.sort(sorting);
    }
    return results;
}

exports.getOrganizations = async function (req, res) {
    let organizations;
    let orphanProfile;
    try {
        if (req.query.search !== undefined) {
            organizations = searchOrganizations(req.query.search, req.query.limit, req.query.page, req.query.sort);
            organizations = await organizations.populate({ path: 'profiles', select: 'uuid name' })
                .populate({ path: 'members.user', select: 'uuid firstname lastname fullname username _created publicizeName' })
                .populate({ path: 'memberRequests.user', select: 'uuid firstname lastname fullname username _created publicizeName' });
        } else {
            organizations = await organizationModel.find({}).populate({ path: 'profiles', select: 'uuid name' })
                .populate({ path: 'members.user', select: 'uuid firstname lastname fullname username _created publicizeName' })
                .populate({ path: 'memberRequests.user', select: 'uuid firstname lastname fullname username _created publicizeName' });
        }

        orphanProfile = await profileModel.findOne({ orphanContainer: true});
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    organizations = organizations.map(i => i.toObject({ virtuals: true }));
    removePrivateNames(organizations);

    if (req.user) {
        cleanMembershipInfo(organizations, req.user);
    }
    else {
        removeMemberInfo(organizations);
    }

    // Remove orphanProfile from results
    for (const i in organizations) {
        for(const j in organizations[i].profiles) {
            if (organizations[i].profiles[j].uuid === orphanProfile.uuid) {
                delete organizations[i].profiles[j];
            }
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
            level: 'admin',
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

exports.getOrganizationPublic = async function (req, res) {
    let organization;
    try {
        organization = await organizationModel.findOne({ uuid: req.params.org })
            .populate('createdBy', 'uuid fullname publicizeName')
            .populate({
                path: 'profiles',
                select: 'uuid updatedOn',
                //  where: { currentPublishedVersion: { $exists: true } },
                populate: [
                    { path: 'currentDraftVersion', select: 'uuid name' },
                    { path: 'currentPublishedVersion', select: 'uuid name isVerified' },
                ],
            });

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

    removePrivateNames([organization]);
    removeMemberInfo([organization]);

    if (req.permissionLevel) {
        organization.membership = req.permissionLevel;
    }

    if (organization.createdBy != null && organization.createdBy.publicizeName == false) {
        delete organization.createdBy.fullname;
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
            .populate('createdBy', 'uuid fullname')
            .populate({
                path: 'profiles',
                select: 'uuid updatedOn',
                populate: [
                    { path: 'currentDraftVersion', select: 'uuid name' },
                    { path: 'currentPublishedVersion', select: 'uuid name isVerified' },
                ],
            })
            .populate({ path: 'members.user', select: 'uuid firstname lastname fullname username _created publicizeName' })
            .populate({ path: 'memberRequests.user', select: 'uuid firstname lastname fullname username _created publicizeName' })
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

    removePrivateNames([organization]);
    
    if (req.user)
        cleanMembershipInfo([organization], req.user);
    else
        removeMemberInfo([organization]);

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
        const orgToDelete = await organizationModel.findOne({ uuid: req.params.org });

        if (orgToDelete && !orgToDelete.orphanContainer) {
            await organizationModel.deleteByUuid(req.params.org);
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
    });
};

exports.requestJoinOrganization = async function (req, res) {
    try {
        const org = req.resource;
        const user = await userModel.findOne({ uuid: req.body.uuid });
        if (!org) {
            return req.status(404).send({
                success: false,
                message: 'The requested organization was not found.',
            });
        }
        if (org.members.find(mem => mem.user.toString() === user._id.toString()) === undefined
            && org.memberRequests.find(mr => mr.user.toString() === user._id.toString()) === undefined) {
            org.memberRequests.push({
                user: user,
            });
            await org.save();
        }
        return res.send({
            success: true,
            organization: org,
        });
    } catch (err) {
        console.prodLog(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};

exports.approveJoinOrganization = async function (req, res, next) {
    const { addMember } = require('./members');
    try {
        const org = req.resource;
        if (!org) {
            return resendValidation.status(404).send({
                success: false,
                message: 'The requested organization was not found.',
            });
        }
        const idx = org.memberRequests.findIndex(mr => mr.user.toString() === req.body.user.id);
        if (idx > -1) {
            org.memberRequests.splice(idx, 1);
            await org.save();
        }
        await addMember(req, res, next);
    } catch (err) {
        console.prodLog(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};

async function removeMemberFromOrganization(org, userId) {
    const idx = org.memberRequests.findIndex(mr => mr.user.toString() === userId);
    if (idx > -1) {
        org.memberRequests.splice(idx, 1);
        await org.save();
    }
}

/**
 * To be called when an admin of a org denies a "join" request.
 * This is the same functionality as revokeJoinOrganization, but
 * this may be updated to send an email or track differently, so I
 * kept them separate.
 * @param {*} req
 * @param {*} res
 */
exports.denyJoinOrganization = async function (req, res) {
    if (!req.resource) {
        return resendValidation.status(404).send({
            success: false,
            message: 'The requested organization was not found.',
        });
    }

    try {
        const org = req.resource;
        removeMemberFromOrganization(org, req.params.userId);
        return res.send({
            success: true,
            organization: org,
        });
    } catch (err) {
        console.prodLog(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};

/**
 * To be called when the user that requested to join an org cancels that request
 * @param {*} req
 * @param {*} res
 */
exports.revokeJoinOrganization = async function (req, res) {
    if (!req.resource) {
        return resendValidation.status(404).send({
            success: false,
            message: 'The requested organization was not found.',
        });
    }

    try {
        const org = req.resource;
        removeMemberFromOrganization(org, req.params.userId);
        return res.send({
            success: true,
            organization: org,
        });
    } catch (err) {
        console.prodLog(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};
