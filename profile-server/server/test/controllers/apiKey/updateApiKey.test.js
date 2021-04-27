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
const httpmocks = require('node-mocks-http');
const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const apiKeyController = require('../../../controllers/apiKeys');
const organizationModel = require('../../../ODM/models').organization;
const apiKeyModel = require('../../../ODM/models').apiKey;
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

describe('Updating an api key', () => {
    const next = response => err => {
        if (err) {
            response.statusCode = 400;
            response.statusMessage = err.message;
        }
    };

    let org;
    let user;
    let apiKey;
    let uuid;
    let updateWith;
    beforeEach(async () => {
        org = new organizationModel({ name: 'test' });
        await org.save();

        user = new userModel({ name: 'test_name', uuid: require('uuid').v4() });
        await user.save();

        uuid = require('uuid').v4();
        apiKey = await apiKeyModel.createNew('organization', org, user, {
            uuid: uuid,
            readPermission: true,
        });

        updateWith = {
            uuid: uuid,
            readPermission: false,
            writePermission: true,
            isEnabled: false,
        };
    });

    describe('when passed a valid api key id', () => {
        let res;
        beforeEach(async () => {
            const req = httpmocks.createRequest({
                method: 'PUT',
                url: `/org/${org.uuid}/apiKey/${uuid}`,
                params: {
                    org: org.uuid,
                    apiKey: apiKey.uuid,
                },
                body: updateWith,
            });
            res = httpmocks.createResponse();

            await apiKeyController.updateApiKey(req, res, next(res));
        });

        test('it should respond with a 200 status.', () => {
            expect(res.statusCode).toEqual(200);
        });

        test('it should respond with a success.', () => {
            expect(res._getData().success).toBeTruthy();
        });

        test('it should respond with the updated object.', () => {
            const data = res._getData().apiKey;
            expect(data).not.toBeUndefined();
            expect(data.uuid).toEqual(uuid);
            expect(data.readPermission).toBeFalsy();
            expect(data.writePermission).toBeTruthy();
            expect(data.isEnabled).toBeFalsy();
        });
    });

    describe('when passed an invalid api key id', () => {
        let res;
        beforeEach(async () => {
            const req = httpmocks.createRequest({
                method: 'PUT',
                url: `/org/${org.uuid}/apiKey/badApiKeyId`,
                params: {
                    org: org.uuid,
                    apiKey: 'badApiKeyId',
                },
                body: updateWith,
            });
            res = httpmocks.createResponse();

            await apiKeyController.updateApiKey(req, res, next(res));
        });

        test('it should respond with a failed status.', () => {
            expect(res.statusCode).toEqual(400);
        });

        test('it should respond with an error.', () => {
            expect(res.statusMessage).toMatch(/Api Key does not exist/);
        });
    });

    describe('when missing an api key id', () => {
        let res;
        beforeEach(async () => {
            const req = httpmocks.createRequest({
                method: 'PUT',
                url: `/org/${org.uuid}/apiKey`,
                params: {
                    org: org.uuid,
                },
                body: updateWith,
            });
            res = httpmocks.createResponse();

            await apiKeyController.updateApiKey(req, res, next(res));
        });

        test('it should respond with a failed status.', () => {
            expect(res.statusCode).toEqual(400);
        });

        test('it should respond with an error.', () => {
            expect(res.statusMessage).toMatch(/Api Key does not exist/);
        });
    });
});
