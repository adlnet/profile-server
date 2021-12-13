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

const Organization = require('../ODM/models').organization;

module.exports = function enforcePermissions(resourceSelector = 'resource', requiredLevel = ['any']) {
    if (!Array.isArray(requiredLevel)) { requiredLevel = [requiredLevel]; }
    return async function (req, res, next) {
        let parent = req[resourceSelector];
        if (!parent) {
            return res.status(500).send({
                success: false,
                message: 'Could not determine resource in permissions enforcement.',
            });
        }
        if (!req.user) {
            return res.status(500).send({
                success: false,
                message: 'Could not determine user in permissions enforcement.',
            });
        }

        if (req.user.type === 'admin') {
            req.permissionState = 'allowed';
            req.permissionLevel = 'admin';
            return next();
        }

        while (parent && parent.parentProfile) {
            await parent.populate([{ path: 'parentProfile' }]).execPopulate();
            parent = parent.parentProfile;
        }

        let organization;
        if (parent instanceof Organization) {
            organization = parent;
        } else {
            if (!parent.organization) {
                return res.status(500).send({
                    success: false,
                    message: 'Could not determine organization for resource in permissions enforcement.',
                });
            }
            await parent.populate([{ path: 'organization' }]).execPopulate();
            organization = parent.organization;
        }

        const matchingMembers = organization.members.filter(
            i => i.user.toString() == req.user.id,
        );
        req.permissionState = 'denied';

        if (!matchingMembers[0]) {
            req.permissionState = 'denied';
        } else {
            for (const i in requiredLevel) {
                console.log(requiredLevel[i], matchingMembers[0].level);
                if (requiredLevel[i] === matchingMembers[0].level) { req.permissionState = 'allowed'; }
                if (requiredLevel[i] == 'any') { req.permissionState = 'allowed'; }
            }
        }
        req.permissionLevel = matchingMembers[0] ? matchingMembers[0].level : undefined;
        next();
    };
};
