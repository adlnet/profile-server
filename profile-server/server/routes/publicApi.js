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
const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profiles');
const apiKeyController = require('../controllers/apiKeys');
const responses = require('../reponseTypes/responses');
const errors = require('../errorTypes/errors');
const unlock = require('../utils/unlock');
const getResource = require('../utils/getResource');
const ProfileVersionModel = require('../ODM/models').profileVersion;

router.use('/sparql', require('./sparql'));
router.post(
    '/profile',
    apiKeyController.middleware.validateApiKey('organization'),
    profileController.validateProfile(true),
    profileController.importProfile,
);

// look to see if the extracted components already exist on the server
// harvest requires a UI.. this will move to appAPI when harvest is implemented
// router.post('/workinggroup/:wg/harvest', async (req, res, next) => {
//     const statements = (Array.isArray(req.body) ? req.body : [req.body]).filter((el) => Object.keys(el).length !== 0);

//     if (statements.length < 1) {
//         return res.status(400)
//             .send(responses.validation(false, 'No statements were found.'));
//     }

//     const componentsList = [];
//     for (const statement of statements) {
//         // get verbs, object types, extensions from statement and return in an object
//         const comps = {};
//         if (statement.verb) comps.Verb = statement.verb;
//         if (statement.object && statement.object.definition) {
//             if (statement.object.definition.type) {
//                 comps.ActivityType = statement.object.definition.type;
//             }
//             if (statement.object.definition.extensions) {
//                 comps.ActivityExtension = statement.object.definition.extensions;
//             }
//         }
//         if (statement.attachments) comps.AttachmentUsageType = statement.attachments;
//         if (statement.context && statement.context.extensions) comps.ContextExtension = statement.context.extensions;
//         if (statement.result && statement.result.extensions) comps.ResultExtension = statement.result.extensions;

//         if (Object.keys(comps).length) componentsList.push(comps);
//     }
//     console.log(componentsList);
//     if (!componentsList.length) {
//         return res.status(400)
//             .send(responses.validation(false, 'No statements were found.'));
//     }

//     return res.send(
//         responses.profile(
//             true,
//             { todos: ['fill in metadata', 'save profile'] },
//             { id: 'todo:return_profile', count: statements.length },
//         ),
//     );
// });

router.put(
    '/profile/:profile',
    apiKeyController.middleware.validateApiKey('organization'),
    profileController.validateProfile(true),
    getResource(ProfileVersionModel, 'profile', 'uuid', true, 'profile'),
    profileController.middleware.testIfUnmodifiedSince,
    profileController.middleware.checkUpdateDraftProfile,
    profileController.importProfile,
);

// published profiles
// recordAPIRead is done in controller for this and get by iri
router.get('/profile/:profile',
    apiKeyController.middleware.validateApiKey('profile'),
    profileController.middleware.populateProfile,
    profileController.exportProfile);

// published profiles, also handles get profile by iri
router.get('/profile', profileController.getPublishedProfiles);

// delete draft profile (only draft)
router.delete('/profile/:profile',
    apiKeyController.middleware.validateApiKey('profile'),
    profileController.middleware.populateProfile,
    profileController.middleware.prepForLock,
    unlock(true, true),
    profileController.deletePublishedProfile);

router.delete('/profile/:profile/draft',
    apiKeyController.middleware.validateApiKey('profile'),
    profileController.middleware.populateProfile,
    profileController.middleware.prepForLock,
    unlock(true, true),
    profileController.deleteProfileDraft);

// Get the metadata of the profile, such as versions, status, publish state and group.
router.get('/profile/:profile/meta',
    apiKeyController.middleware.validateApiKey('profile'),
    profileController.middleware.populateProfile,
    profileController.getMetadata);

router.post('/profile/:profile/status',
    apiKeyController.middleware.validateApiKey('profile'),
    profileController.middleware.populateProfile,
    profileController.updateStatus);

router.post('/validate', profileController.validateProfile(false));

router.use((err, req, res, next) => {
    console.log(err);
    if (err instanceof errors.authorizationError) {
        res.status(err.status).send(responses.unauthorized(err.message));
    } else if (err instanceof errors.conflictError) {
        res.status(err.status).send(responses.conflict(err.message));
    } else if (err instanceof errors.validationError) {
        res.status(err.status).send(responses.validation(false, err.message));
    } else if (err instanceof errors.notAllowedError) {
        res.status(err.status).send(responses.notAllowed(false, err.message));
    } else {
        res.status(err.status || 500).send({
            success: false,
            message: err.message,
        });
    }
});

module.exports = router;
