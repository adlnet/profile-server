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

const apiKeyModel = require('../../../ODM/models').apiKey;
const organizationModel = require('../../../ODM/models').organization;
const userModel = require('../../../ODM/models').user;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

beforeEach(async () => {
    const cnnStr = await mongoServer.getUri();
    await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Deleing an api key', () => {
    let org;
    let user;
    let apiKey;
    let uuid;
    beforeEach(async () => {
        org = new organizationModel({ name: 'test' });
        await org.save();

        user = new userModel({ name: 'test_name', uuid: require('uuid').v4() });
        await user.save();

        uuid = require('uuid').v4();
        apiKey = await apiKeyModel.createNew('organization', org, user, { uuid: uuid });
    });

    describe('when passed an existing api key id', () => {
        test('it should be found but not active.', async () => {
            await apiKeyModel.deleteByUuid(uuid);
            const deletedApiKey = await apiKeyModel.findOne({ uuid: uuid });

            expect(deletedApiKey).toBeNull();
        });
    });

    describe('when passed an invalid key', () => {
        test('it should throw an error.', async () => {
            let error;
            try {
                await apiKeyModel.deleteByUuid('some-bad-id');
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Api Key does not exist/);
        });
    });
});
