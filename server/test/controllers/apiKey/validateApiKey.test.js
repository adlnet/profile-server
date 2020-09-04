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
const profileController = require('../../../controllers/profiles');
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

describe('Validating an api key', () => {
    describe('when requesting a profile', () => {
        let profileOrg;
        let p_profile;
        let user;
        let apiKey;
        const next = response => err => {
            if (err) {
                response.statusCode = 400;
                response.statusMessage = err.message;
            }
        };

        beforeEach(async () => {
            profileOrg = new organizationModel({
                name: 'test',
            });
            await profileOrg.save();

            user = new userModel({ name: 'test_name', uuid: require('uuid').v4() });
            await user.save();

            apiKey = await apiKeyModel.createNew('organization', profileOrg, user);

            p_profile = await profileController.addNewProfile(
                profileOrg.uuid,
                {
                    iri: 'https://test.tom.com/test/testprofile',
                    name: 'test profile',
                    description: 'it is the test version',
                },
            );
        });

        describe('and the api key is missing', () => {
            test('the validationScope should be public.', async () => {
                const req = httpmocks.createRequest({
                    method: 'GET',
                    url: `/profile/${p_profile.uuid}`,
                    params: { profile: p_profile.uuid },
                });
                const res = httpmocks.createResponse();

                await apiKeyController.middleware.validateApiKey('profile')(req, res, next);

                expect(req.validationScope).toEqual('public');
            });
        });

        describe('and there is an api key', () => {
            describe('but the api key is not found', () => {
                test('the validationScope should be public.', async () => {
                    const req = httpmocks.createRequest({
                        method: 'GET',
                        url: `/profile/${p_profile.uuid}`,
                        headers: { 'x-api-key': 'goofy api key' },
                        params: { profile: p_profile.uuid },
                    });
                    const res = httpmocks.createResponse();

                    await apiKeyController.middleware.validateApiKey('profile')(req, res, next);
                    expect(req.validationScope).toEqual('public');
                });
            });

            describe('and the api key is found', () => {
                describe('but the api key does not have a scope object', () => {
                    test('the validationScope should be public.', async () => {
                        const scopeObject = new organizationModel({ name: 'bad org' });
                        await scopeObject.save();
                        const otherApiKey = await apiKeyModel.createNew('organization', scopeObject, user);
                        await otherApiKey.save();
                        await scopeObject.remove();

                        const req = httpmocks.createRequest({
                            method: 'GET',
                            url: `/profile/${p_profile.uuid}`,
                            headers: { 'x-api-key': otherApiKey.uuid },
                            params: { profile: p_profile.uuid },
                        });
                        const res = httpmocks.createResponse();

                        await apiKeyController.middleware.validateApiKey('profile')(req, res, next);
                        expect(req.validationScope).toEqual('public');
                    });
                });

                describe('but the profile does not exist', () => {
                    let res;
                    beforeEach(async () => {
                        const req = httpmocks.createRequest({
                            method: 'GET',
                            url: '/profile/badProfileId',
                            headers: { 'x-api-key': apiKey.uuid },
                            params: { profile: 'badProfileId' },
                        });
                        res = httpmocks.createResponse();

                        await apiKeyController.middleware.validateApiKey('profile')(req, res, next(res));
                    });

                    test('it should respond with a failed status', () => {
                        expect(res.statusCode).toEqual(400);
                    });

                    test('it should respond with an error.', async () => {
                        expect(res.statusMessage).toMatch(/There was no profile found with uuid badProfileId/);
                    });
                });

                describe('but the api key is scoped to an organization different from the profile', () => {
                    test('the validationScope should be public.', async () => {
                        const scopeObject = new organizationModel({ name: 'bad org' });
                        await scopeObject.save();
                        const otherApiKey = await apiKeyModel.createNew('organization', scopeObject, user);
                        await otherApiKey.save();

                        const req = httpmocks.createRequest({
                            method: 'GET',
                            url: `/profile/${p_profile.uuid}`,
                            headers: { 'api-key': otherApiKey.uuid },
                            params: { profile: p_profile.uuid },
                        });
                        const res = httpmocks.createResponse();

                        await apiKeyController.middleware.validateApiKey('profile')(req, res, next);
                        expect(req.validationScope).toEqual('public');
                    });
                });

                describe('and the api key is scoped to an organization that matches the profile', () => {
                    test('the validationScope should be `private`.', async () => {
                        const req = httpmocks.createRequest({
                            method: 'GET',
                            url: `/profile/${p_profile.uuid}`,
                            headers: { 'x-api-key': apiKey.uuid },
                            params: { profile: p_profile.uuid },
                        });
                        const res = httpmocks.createResponse();

                        await apiKeyController.middleware.validateApiKey('profile')(req, res, next);
                        expect(req.validationScope).toEqual('private');
                    });
                });
            });
        });
    });
});
