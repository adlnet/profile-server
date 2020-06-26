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

const responses = require('../reponseTypes/responses');
const profileController = require('../controllers/profiles');

const models = require('../ODM/models');
const createIRI = require('../utils/createIRI');
const apiKeyController = require('../controllers/apiKeys');
const errors = require('../errorTypes/errors');

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

router.put('/profile/:profile', async (req, res, next) => {

});

// published profiles
// foo.com/profile/abc123
// foo.com/profile/1232343
// bob.com/profiles/n/profile/abc123/v/2  version
// statements.context.contextActivity.grouping[{id: foo.com/profile/12321312}]
router.get('/profile/:profile',
    apiKeyController.middleware.validateApiKey('profile'),
    profileController.middleware.populateProfile,
    profileController.exportProfile);

// published profiles
router.get('/profile', async (req, res, next) => {

});

// delete draft profile (only draft)
router.delete('/profile/:profile', async (req, res, next) => {

});

router.post('/profile/:profile/meta', async (req, res, next) => {

});

// Get the metadata of the profile, such as versions, status, publish state and group.
router.get('/profile/:profile/meta', async (req, res, next) => {

});

router.post('/profile/:profile/verify', async (req, res, next) => {

});

router.post('/validate', profileController.validateProfile(false));

router.use((err, req, res, next) => {
    if (err instanceof errors.authorizationError) {
        res.status(err.status).send(responses.unauthorized(err.message));
    } else if (err instanceof errors.conflictError) {
        res.status(err.status).send(responses.conflict(err.message));
    } else if (err instanceof errors.validationError) {
        res.status(err.status).send(responses.validation(false, err.message));
    } else {
        res.status(err.status || 500).send({
            success: false,
            message: err.message,
        });
    }
});

module.exports = router;
