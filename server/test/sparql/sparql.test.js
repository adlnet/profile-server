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
**************************************************************** */const mongoose = require('mongoose');
const request = require('supertest');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const fs = require('fs');
const path = require('path');
const { organization, apiKey, user, profile } = require('../../ODM/models');

const app = require('../../../app');

const profileDir = 'server/test/routes/publicAPI/profile';
const goodProfile1Path = './test_resources/good_1.jsonld';
const badProfile1Path = './test_resources/bad_1.jsonld';

describe('sparql', () => {
    const mongoServer = new MongoMemoryServer();
    jest.setTimeout(1000000);

    let key;
    beforeEach(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });

        const wg = new organization({ name: 'wg_name' });
        await wg.save();
        const maker = new user({ email: 'test_name@test.com' });
        await maker.save();
        key = new apiKey({ scope: 'organization', scopeObject: wg, createdBy: maker, updatedBy: maker });
        await key.save();

        const goodProfile1 = JSON.parse(fs.readFileSync(path.join(profileDir, goodProfile1Path)));
        const res = await request(app)
            .post('/api/profile')
            .set('Content-Type', 'application/json')
            .set('x-api-key', key.uuid)
            .send({
                status: {
                    published: false,
                },
                profile: goodProfile1,
            });
        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.metadata.profile_id).toBe(goodProfile1.id);
        expect(res.body.metadata.status.published).toBeFalsy();
    });

    afterEach(async () => {
        await mongoose.disconnect();
        mongoServer.stop();
    });

    test('Should return all verbs', async () => {
        const res = await request(app)
            .post('/api/sparql')
            .set('Content-Type', 'text/plain')
            .set('x-api-key', key.uuid)
            .send(
                `
               select ?o 
               where {
                   
               ?o a <https://w3id.org/xapi/ontology#Verb>
               }
               `,
            );
        console.log('res is', res);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
