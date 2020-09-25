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
const Express = require('express');
const organizations = Express.Router();
const controller = require('../controllers/organizations');

const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const permissions = require('../utils/permissions');
const level = require('../utils/level');

const Org = require('../ODM/models').organization;

const permissionStack = [
    mustBeLoggedIn,
    getResource(Org, 'org', 'uuid'),
    permissions(),
];

const lock = require('../utils/lock');
const unlock = require('../utils/unlock');

organizations.get('/', controller.getOrganizations);
organizations.post('/', mustBeLoggedIn, controller.createOrganization);

organizations.get('/:org', ...permissionStack, controller.getOrganization);
organizations.get('/:org/lock', ...permissionStack, lock());
organizations.get('/:org/unlock', ...permissionStack, unlock());
organizations.put('/:org', ...permissionStack, level('admin'), unlock(true), controller.updateOrganization);
organizations.delete('/:org', ...permissionStack, level('admin'), lock(true), controller.deleteOrganization);
organizations.post('/:org/join', ...permissionStack, controller.requestJoinOrganization);
organizations.post('/:org/join/member', ...permissionStack, controller.approveJoinOrganization);
organizations.delete('/:org/deny/member/:userId', ...permissionStack, controller.denyJoinOrganization);
organizations.delete('/:org/join/member/:userId', ...permissionStack, controller.revokeJoinOrganization);

const apiKeys = require('./apiKeys');
const profiles = require('./profiles');
const members = require('./members');


organizations.use('/:org/apiKey', ...permissionStack, getResource(Org, 'org', 'uuid', true, 'organization'), apiKeys);
organizations.use('/:org/profile', profiles);
organizations.use('/:org/member', members);

module.exports = organizations;
