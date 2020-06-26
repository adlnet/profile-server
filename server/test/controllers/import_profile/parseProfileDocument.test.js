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
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const fs = require('fs');
const path = require('path');
const ConceptModel = require('../../../ODM/models').concept;
const TemplateModel = require('../../../ODM/models').template;

const testDirPath = 'server/test/controllers/import_profile';
const justProfile1 = './test_resources/profile_only_1.jsonld';
const parseProfileDocument = require('../../../controllers/importProfile/parseProfileDocument')
    .parseProfileDocument;
const authError = require('../../../errorTypes/authorizationError');
const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

beforeAll(async () => {
    const cnnStr = await mongoServer.getUri();
    await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

let profileDocument;
describe('Parsing profile only', () => {
    // beforeAll(() => {
    //     profileDocument = JSON.parse(fs.readFileSync(path.join(testDirPath, justProfile1)));
    // });

    test('should return a parsed object with just that profile in it.', async () => {
        let error;
        try {
            throw new authError('uh oh');
        } catch (err) {
            error = err;
        }

        console.log(error);
        expect(error.message).toEqual('uh oh');
        expect(error.status).toEqual(401);
        expect(error instanceof authError).toBeTruthy();
        expect(error instanceof Error).toBeTruthy();
    });
});
