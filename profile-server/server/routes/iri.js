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
const concepts = Express.Router({ mergeParams: true });
const conceptController = require('../controllers/concepts');
const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const permissions = require('../utils/permissions');
const deny = require('../utils/deny');

const lock = require('../utils/lock');
const unlock = require('../utils/unlock');

const Concept = require('../ODM/models').concept;

const conceptPermissionStack = [
    mustBeLoggedIn,
    getResource(Concept, 'concept', 'uuid'),
    permissions(),
    deny,
];

concepts.get('/', conceptController.getConcepts);

concepts.get('/:concept/lock', ...conceptPermissionStack, lock());
concepts.get('/:concept/unlock', ...conceptPermissionStack, unlock());

concepts.get('/:concept', conceptController.getConcept);




//
//
//


const patterns = Express.Router({ mergeParams: true });
const patternController = require('../controllers/patterns');

const Pattern = require('../ODM/models').pattern;
const patternPermissionStack = [
    mustBeLoggedIn,
    getResource(Pattern, 'pattern', 'uuid'),
    permissions(),
    deny,
];

patterns.get('/', patternController.getPatterns);

patterns.get('/:pattern/lock', ...patternPermissionStack, lock());
patterns.get('/:pattern/unlock', ...patternPermissionStack, unlock());

patterns.get('/:pattern', patternController.getPattern);




//
//
//


const profiles = Express.Router({ mergeParams: true });
const profileController = require('../controllers/profiles');

const Profile = require('../ODM/models').profile;
const Org = require('../ODM/models').organization;

const profilePermissionStack = [
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

function countUIViewProfile(req, res, next) {
    const metrics = require('../controllers/metrics');
    metrics.count(req.params.profile, 'profileUIView');
    next();
}
const metrics = require('../controllers/metrics');

const getProfile = getResource(Profile, 'profile');
// Protected by parent router
profiles.get('/', profileController.getProfiles);
profiles.get('/published', profileController.getPublishedProfilesPage);

profiles.get('/:profile', countUIViewProfile, profileController.getProfile);
profiles.get('/resolve/:profile', profileController.resolveProfile);

profiles.get('/:profile/lock', ...profilePermissionStack, lock());
profiles.get('/:profile/usage', metrics.serveProfileSparkline());
profiles.get('/:profile/usage/populate', metrics.populateDemoData);
profiles.get('/:profile/unlock', ...profilePermissionStack, unlock());

const profileVersions = require('./profileVersions');

profiles.use('/:profile/version', profileVersions);




//
//
//


const templates = Express.Router({ mergeParams: true });
const templateController = require('../controllers/templates');

const Template = require('../ODM/models').template;

const templatePermissionStack = [
    mustBeLoggedIn,
    getResource(Template, 'template', 'uuid'),
    permissions(),
    deny,
];


templates.get('/', templateController.getTemplates);

templates.get('/:template/lock', ...templatePermissionStack, lock());
templates.get('/:template/unlock', ...templatePermissionStack, unlock());


templates.get('/:template', templateController.getTemplate);

module.exports = {
    concepts,
    patterns,
    profiles,
    templates
};