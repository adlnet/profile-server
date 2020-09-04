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

const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');

router.use(cookieParser('asdfasdfasdfasdfasdf'));
router.use(cookieSession({
    name: 'profileSession', // stop colliding with other  projects
    keys: ['asdfasdfasdfasdfasdf'],
    // Cookie Options
    maxAge: 0,
}));

const users = require('../routes/users');
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

router.get('/concept', async (req, res, next) => {
    let search = req.query.search;
    let query = {};

    if (search) {
        search = search.split(' ')
            .map(s => s.trim())
            .filter(s => s);
        query = {
            $or: [
                { $or: setRegex('name', search) },
                { $or: setRegex('description', search) },
                { $or: setRegex('uuid', search) },
                { $or: setRegex('iri', search) },
            ],
        };
    }
    const results = await models.concept.find(query);
    res.send({
        success: true,
        concepts: results,
    });
});

router.get('/profile', async (req, res, next) => {
    let search = req.query.search;
    let query = {};
    if (search) {
        search = search.split(' ')
            .map(s => s.trim())
            .filter(s => s);
        query = {
            $or: [
                { $or: setRegex('name', search) },
                { $or: setRegex('description', search) },
                { $or: setRegex('uuid', search) },
                { $or: setRegex('iri', search) },
            ],
        };
    }
    const results = await models.profile.find(query);
    res.send({
        success: true,
        profiles: results,
    });
});

router.get('/organization', async (req, res, next) => {
    let search = req.query.search;
    let query = {};
    if (search) {
        search = search.split(' ')
            .map(s => s.trim())
            .filter(s => s);
        query = {
            $or: [
                { $or: setRegex('name', search) },
                { $or: setRegex('uuid', search) },
            ],
        };
    }

    const results = await models.organization.find(query);
    console.log('results', JSON.stringify(results));
    res.send({
        success: true,
        profiles: results,
    });
});

router.get('/user', async (req, res, next) => {
    let search = req.query.search;
    let query = {};
    if (search) {
        search = search.split(' ')
            .map(s => s.trim())
            .filter(s => s);
        query = {
            $or: [
                { username: new RegExp(search, 'ig') },
                { email: new RegExp(search, 'ig') },
                { uuid: new RegExp(search, 'ig') },
            ],
        };
    }

    const results = await models.user.find(query).select('username email uuid');
    console.log('results', JSON.stringify(results));
    res.send({
        success: true,
        users: results,
    });
});

router.use('/search', require('./search'));

router.use((err, req, res, next) => {
    // Change in prod mode.
    console.log(err);
    res.status(500).send(err);
});
module.exports = router;
