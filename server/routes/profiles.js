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
const profiles = Express.Router({ mergeParams: true });
const controller = require('../controllers/profiles');
const lock = require('../utils/lock');
const unlock = require('../utils/unlock');

const Profile = require('../ODM/models').profile;
const Org = require('../ODM/models').organization;


const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const permissions = require('../utils/permissions');
const deny = require('../utils/deny');

const permissionStack = [
    mustBeLoggedIn,
    getResource(Profile, 'profile', 'uuid'),
    permissions(),
    deny,
];

const orgPermissionStack = [
    mustBeLoggedIn,
    getResource(Org, 'org', 'uuid'),
    permissions(),
    deny,
];

const usage = require('../controllers/metrics').serveProfileSparkline();

const getProfile = getResource(Profile, 'profile');
// Protected by parent router
profiles.post('/', ...orgPermissionStack, controller.createProfile);

profiles.post('/:profile/publish', controller.publishProfile);

profiles.get('/:profile', controller.getProfile);
profiles.get('/resolve/:profile', controller.resolveProfile);

profiles.get('/:profile/lock', ...permissionStack, lock());
profiles.get('/:profile/usage', usage);
profiles.get('/:profile/unlock', ...permissionStack, unlock());


profiles.put('/:profile', ...permissionStack, unlock(true), controller.updateProfile);
profiles.delete('/:profile', ...permissionStack, lock(true), controller.deleteProfile);

const profileVersions = require('./profileVersions');

profiles.use('/:profile/version', profileVersions);

module.exports = profiles;
