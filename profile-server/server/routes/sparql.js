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
const sparql = Express.Router({ mergeParams: true });
const bodyParser = require('body-parser');
const rdfstore = require('rdfstore');
const profiles = require('../controllers/profiles');
const profileVersionModel = require('../ODM/models').profileVersion;
const profileModel = require('../ODM/models').profile;
const responses = require('../reponseTypes/responses');

function promiseify(store, func) {
    if (!store.promised) { store.promised = {}; }

    store.promised[func] = function (...args) {
        return new Promise((res) => {
            store[func](...args, (err, ...ret) => {
                if (err) throw (err);
                if (ret.length === 1) { res(ret[0]); } else res(ret);
            });
        });
    };
}

promiseify(rdfstore, 'create');
sparql.post('/', bodyParser.text(), async (req, res, next) => {
    try {
        if (!(req.body && Object.keys(req.body).length)) { return res.status(400).send(responses.validation(false, 'The request did not have a SPARQL query in the body')); }

        const SparqlParser = require('sparqljs').Parser;
        const parser = new SparqlParser();
        try {
            const parsedQuery = parser.parse(req.body);
            console.log(parsedQuery);
        } catch (e) {
            console.log(e);
            res.status(400).send(responses.validation(false, e.message));
        }

        const store = await rdfstore.promised.create();

        promiseify(store, 'execute');
        promiseify(store, 'insert');
        promiseify(store, 'load');
        promiseify(store, 'graph');

        let allprofiles = await profileModel
            .find({
                currentPublishedVersion: { $ne: null },
            })
            .populate('currentPublishedVersion');


        allprofiles = await Promise.all(allprofiles.map(async i => profiles.profileToJSONLD(await profiles.getProfilePopulated(i.currentPublishedVersion.uuid))));

        await store.promised.load('application/ld+json', allprofiles);
        store.registerDefaultProfileNamespaces();

        const graph = await store.promised.graph();
        const results = await store.promised.execute(req.body);
        return res.send(results);
    } catch (e) {
        console.log(e);
        res.status(400).send(responses.validation(false, 'Your request was invalid'));
    }
});

module.exports = sparql;
