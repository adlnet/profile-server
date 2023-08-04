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

//const iri = require('./iri');
//router.use('/api', iri)

// set up GET request router when searching by IRI
router.get('/api/iri/:iri', (req, res) => {
    // store the iri from url as a string
    let iri = String(req.params[0]);

    /*  store our queries as an array to run them simultaneously in our promise function.
        each query will go through each model and find the matching IRI in each model.
        may need to implement a different function rather than findOne(), as the iri key
        is not valid identifier
    */
    var queries = [
        // search through concepts
        models.concept.findOne({ iri: iri }),
        // search through profiles
        models.profile.findOne({ iri: iri }),
        // search through patterns
        models.pattern.findOne({ iri: iri }),
        // search through statement templates
        models.templates.findOne({ iri: iri }),
    ];
    // debugger
  
    Promise.allSettled(queries) // Promise.all() will immediately reject if any promises fail, so we use .allSettled() instead
    .then(results => {
    // if the results are null -- AKA can't find the IRI -- return an error
        if (!results[0] && !results[1] && !results[2] && !results[3]) {
            console.log("No matching IRIs");
            return; // will probably want to return a 500 status here

    // else if there is a result, parse the results array for the non-empty value and redirect it 
        } else {
            /*
                will need to add additional code
            */
            return;
        }

    // store the result of the profile & identifier so we can redirect to the appropriate url
        // let profile = results[0].profileID
        // let uniqueID = results[0].uri


        // here we can either render the json (WiP), or just redirect to the appropriate page of the object
        // res.render('index.html', { data: {
        //     status: 302,
        //     result: result,
        //     message: "Working"
        // } });
    })
    .catch(err => {
    //
        console.log("Error in getting queries", err);
        res.status(500).send({
          success: false,
          err: err
        })
    });
  });




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
    let queryUsernames = {};
    let queryRealNames = {};
    if (search) {
        search = search.split(' ')
            .map(s => s.trim())
            .filter(s => s);
        queryUsernames = {
            $or: [
                { username: new RegExp(search, 'ig') },
            ],
        };
        queryRealNames = {
            $or: [
                { username: new RegExp(search, 'ig') },
                { firstname: new RegExp(search, 'ig') },
                { lastname: new RegExp(search, 'ig') },
            ],
        };
    }

    let usernameResults = await models.user.find(queryUsernames).select('username');
    let realNameResults = await models.user.find(queryRealNames).select('username firstname lastname fullname publicizeName');

    let resultMap = {};

    for (let user of usernameResults) {
        resultMap[user.username] = user;
    }
    for (let user of realNameResults) {
        if (user.publicizeName) {
            resultMap[user.username] = user;
        }
    }

    let uniqueUsernames = Object.keys(resultMap);
    let upperBound = uniqueUsernames.length >= 8 ? 8 : uniqueUsernames.length;
    let top8 = uniqueUsernames.slice(0, upperBound);
    let results = top8.map(username => resultMap[username]);

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
