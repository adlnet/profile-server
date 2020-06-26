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
const profileVersions = Express.Router({ mergeParams: true });
const controller = require('../controllers/profileVersions');
// Protected by parent router

const lock = require('../utils/lock');
const unlock = require('../utils/unlock');

const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const permissions = require('../utils/permissions');
const deny = require('../utils/deny');

const ProfileVersion = require('../ODM/models').profileVersion;
const Profile = require('../ODM/models').profile;

const getProfileVersion = getResource(ProfileVersion, 'version');

const Template = require('../ODM/models').template;

const permissionStack = [
    mustBeLoggedIn,
    getProfileVersion,
    permissions(),
    deny,
];

const profilePermissionStack = [
    mustBeLoggedIn,
    getResource(Profile, 'profile'),
    permissions(),
    deny,
];

profileVersions.post('/', ...profilePermissionStack, controller.createProfileVersion);
profileVersions.get('/:version', controller.getProfileVersion);
profileVersions.get('/:version/lock', ...permissionStack, lock());
profileVersions.get('/:version/unlock', ...permissionStack, unlock());
profileVersions.put('/:version', ...permissionStack, unlock(true), controller.updateProfileVersion);

const concepts = require('./concepts');
profileVersions.use('/:version/concept', concepts);

const templates = require('./templates');
profileVersions.use('/:version/template', templates);

const patterns = require('./patterns');
profileVersions.use('/:version/pattern', patterns);

module.exports = profileVersions;
