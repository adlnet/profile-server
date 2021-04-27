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

describe('Using organization apiKeys virtual property', () => {
    let testOrg;
    let otherOrg;
    let testApiKeys;
    let otherApiKey;
    let virtualKeys;
    beforeEach(async () => {
        const user = new userModel({ name: 'name' });
        testOrg = new organizationModel({ name: 'name' });
        await testOrg.save();
        testApiKeys = [...Array(2).keys()].map((a, i) => new apiKeyModel({
            name: `test_${i}`,
            scope: 'organization',
            scopeObject: testOrg,
            createdBy: user,
            updatedBy: user,
        }));
        await Promise.all(testApiKeys.map(async (t) => t.save()));

        otherOrg = new organizationModel({ name: 'other_name' });
        await otherOrg.save();
        otherApiKey = new apiKeyModel({
            name: 'other_key',
            scope: 'organization',
            scopeObject: otherOrg,
            createdBy: user,
            updatedBy: user,
        });
        await otherApiKey.save();

        await testOrg.populate('apiKeys').execPopulate();
        virtualKeys = testOrg.apiKeys;
    });

    describe('when there are 3 api keys scoped to an organization and 1 not scoped to that organization', () => {
        test('it should return only those api keys scoped to the organization.', () => {
            expect(virtualKeys.map(v => testApiKeys.map(t => t._id.toString()).includes(v._id.toString())).every(v => v)).toBeTruthy();
        });
    });
});
