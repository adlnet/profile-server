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
const mongoose = require('mongoose');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

const app = require('../../../../../app');

const profileDir = 'server/test/routes/publicAPI/profile';
const goodProfile1Path = './test_resources/good_1.jsonld';
const scromProfile1Path = './test_resources/scorm.jsonld';
const badProfile1Path = './test_resources/bad_1.jsonld';


describe('Validate good', () => {
    test('test validation endpoint - good basic', async () => {
        const goodProfile1 = JSON.parse(fs.readFileSync(path.join(profileDir, goodProfile1Path)));
        const res = await request(app)
            .post('/api/validate')
            .send(goodProfile1);
        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    test('test validation endpoint - scorm profile', async () => {
        const goodProfile1 = JSON.parse(fs.readFileSync(path.join(profileDir, scromProfile1Path)));
        const res = await request(app)
            .post('/api/validate')
            .send(goodProfile1);
        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});

describe('Validate bad', () => {
    test('test validation endpoint - bad basic', async () => {
        const badProfile1 = JSON.parse(fs.readFileSync(path.join(profileDir, badProfile1Path)));
        const res = await request(app)
            .post('/api/validate')
            .send(badProfile1);
        expect(res.status).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    test('test validation endpoint - bad null', async () => {
        const badProfile1 = null;
        const res = await request(app)
            .post('/api/validate')
            .send(badProfile1);
        expect(res.status).toEqual(400);
        expect(res.body.success).toBe(false);
    });
});
