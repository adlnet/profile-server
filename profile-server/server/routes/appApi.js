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
const models = require('../ODM/models');

const validate = require('../utils/validator');
const validIRI = require('../schema/validIRI');

const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');

router.use(cookieParser('asdfasdfasdfasdfasdf'));
router.use(cookieSession({
    name: 'profileSession', // stop colliding with other  projects
    keys: ['asdfasdfasdfasdfasdf'],
    // Cookie Options
    maxAge: 0,
}));

// validate iris when they exist
router.use(validate(validIRI));

const users = require('./users');
require('../controllers/users').setupPassport();
router.use(require('../controllers/users').passport.initialize());
router.use(require('../controllers/users').passport.session());
router.use('/user', users);

const organizations = require('./organizations');
router.use('/org', organizations);


const concepts = require('./concepts');
router.use('/concept', concepts);

const templates = require('./templates');
router.use('/template', templates);

const patterns = require('./patterns');
router.use('/pattern', patterns);

const profiles = require('./profiles');
router.use('/profile', profiles);

const versions = require('./profileVersions');
router.use('/version', versions);

router.get('/concept/:concept', async (req, res, next) => {
    const concept = await models.concept.findOne({ uuid: req.params.concept });
    if (!concept) {
        return res.status(404).send();
    }

    res.send({
        success: true,
        concept: concept,
    });
});

function setRegex(column, searchArray) {
    return searchArray.map(s => ({ [column]: { $regex: new RegExp(s, 'i') } }));
}

router.get('/user', async (req, res, next) => {
    let search = req.query.search;
    let query = {};
    if (search) {
        search = search.split(' ')
            .map(s => s.trim())
            .filter(s => s);
        query = {
            $or: [
                { firstname: new RegExp(search, 'ig') },
                { lastname: new RegExp(search, 'ig') },
                { email: new RegExp(search, 'ig') },
            ],
        };
    }

    const results = await models.user.find(query).select('firstname lastname fullname email uuid');
    console.log('results', JSON.stringify(results));
    res.send({
        success: true,
        users: results,
    });
});

router.use('/admin', require('./admin'));
router.use('/search', require('./search'));

router.use('/metrics/mostViewed', require('../controllers/metrics').mostViewed);
router.use('/metrics/mostExported', require('../controllers/metrics').mostExported);
router.use('/metrics/mostAPIRetrievals', require('../controllers/metrics').mostAPIRetrievals);

router.use('/metrics/profile/:profile/usageOverTime', require('../controllers/metrics').serveProfileSparkline());
router.use('/metrics/profile/:profile/viewTotal', require('../controllers/metrics').serveProfileViewTotal());
router.use('/metrics/profile/:profile/exportTotal', require('../controllers/metrics').serveProfileExportTotal());

router.get('/rootProfileIRI', (req, res, next) => {
    const settings = require('../settings');
    res.send({ success: true, iri: settings.profileRootIRI });
});


router.use((err, req, res, next) => {
    const responses = require('../reponseTypes/responses');
    const errors = require('../errorTypes/errors');


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
