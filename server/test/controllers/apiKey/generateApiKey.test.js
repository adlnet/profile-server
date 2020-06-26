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

describe('Generating an api key', () => {
    const next = response => err => {
        if (err) {
            response.statusCode = 400;
            response.statusMessage = err.message;
        }
    };

    describe('when passed a valid organization scope', () => {
        let res;
        let org;
        let user;
        let badUser;
        beforeEach(async () => {
            org = new organizationModel({ name: 'test' });
            await org.save();

            user = new userModel({ name: 'test_name', uuid: require('uuid').v4() });
            await user.save();

            badUser = new userModel({ name: 'bad_test_name', uuid: require('uuid').v4() });
        });

        describe('and a valid user', () => {
            let req;
            beforeEach(async () => {
                req = httpmocks.createRequest({
                    method: 'POST',
                    url: '/apiKey',
                    organization: org,
                    user: user,
                    body: {
                        uuid: require('uuid').v4(),
                        description: 'this is an api key',
                        writePermission: true,
                        readPermission: true,
                        isEnabled: true,
                    },
                });
                res = httpmocks.createResponse();

                await apiKeyController.generateApiKey(req, res, next(res));
            });
            test('it should respond with a status 200.', async () => {
                expect(res.statusCode).toEqual(200);
            });

            test('it should respond with an apiKey object.', () => {
                const data = res._getData().apiKey;
                expect(data).not.toBeUndefined();
                expect(data.description).toEqual('this is an api key');
                expect(data.writePermission).toBeTruthy();
                expect(data.readPermission).toBeTruthy();
                expect(data.isEnabled).toBeTruthy();
            });

            test('it should respond with a success.', () => {
                expect(res._getData().success).toBeTruthy();
            });
        });

        describe('and an invalid user', () => {
            let req;
            beforeEach(async () => {
                req = httpmocks.createRequest({
                    method: 'POST',
                    url: '/apiKey',
                    organization: org,
                    user: badUser,
                });
                res = httpmocks.createResponse();

                await apiKeyController.generateApiKey(req, res, next(res));
            });

            test('it should respond with a failed status.', () => {
                expect(res.statusCode).toEqual(400);
            });

            test('it should respond with an error meesage.', () => {
                expect(res.statusMessage).toMatch(/User does not exist/);
            });
        });

        describe('and a missing user', () => {
            let req;
            beforeEach(async () => {
                req = httpmocks.createRequest({
                    method: 'POST',
                    url: '/apiKey',
                    organization: org,
                });
                res = httpmocks.createResponse();

                await apiKeyController.generateApiKey(req, res, next(res));
            });

            test('it should respond with a failed status.', () => {
                expect(res.statusCode).toEqual(400);
            });

            test('it should respond with an validation error meesage.', () => {
                expect(res.statusMessage).toMatch(/validation/);
            });
        });
    });

    describe('when passed an invalid organization scope', () => {
        let res;
        let req;
        beforeEach(async () => {
            const org = await new organizationModel({ name: 'test' });

            req = httpmocks.createRequest({
                method: 'POST',
                url: '/apiKey',
                organization: org,
            });
            res = httpmocks.createResponse();

            await apiKeyController.generateApiKey(req, res, next(res));
        });

        test('it should respond with an error.', () => {
            expect(res.statusMessage).toMatch(/Organization does not exist./);
        });
    });
});
