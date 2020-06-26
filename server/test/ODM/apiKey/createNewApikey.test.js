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

describe('Creating a new api key', () => {
    describe('when passed in a valid organization scope', () => {
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

        describe('and a valid scope', () => {
            describe('and a valid user', () => {
                test('it should return an api key object.', async () => {
                    const apiKey = await apiKeyModel.createNew('organization', org, user);

                    expect(apiKey).not.toBeNull();
                });

                describe('with its own uuid', () => {
                    test('it should return an apiKey with that uuid', async () => {
                        const uuid = require('uuid').v4();
                        const apiKey = await apiKeyModel.createNew(
                            'organization', org, user, { uuid: uuid },
                        );

                        expect(apiKey.uuid).toEqual(uuid);
                    });
                });

                describe('with read permission', () => {
                    test('it should return an apiKey with readPermission', async () => {
                        const apiKey = await apiKeyModel.createNew(
                            'organization', org, user, { readPermission: true },
                        );

                        expect(apiKey.readPermission).toBeTruthy();
                    });

                    test('it should return an apiKey without writePermission', async () => {
                        const apiKey = await apiKeyModel.createNew(
                            'organization', org, user, { readPermission: true },
                        );

                        expect(apiKey.writePermission).toBeFalsy();
                    });
                });

                describe('with write permission', () => {
                    test('it should return an apiKey with writePermission', async () => {
                        const apiKey = await apiKeyModel.createNew(
                            'organization', org, user, { writePermission: true },
                        );

                        expect(apiKey.writePermission).toBeTruthy();
                    });

                    test('it should return an apiKey without readPermission', async () => {
                        const apiKey = await apiKeyModel.createNew(
                            'organization', org, user, { writePermission: true },
                        );

                        expect(apiKey.readPermission).toBeFalsy();
                    });
                });

                describe('with read and write permission', () => {
                    test('it should return an apiKey with read and writePermission', async () => {
                        const apiKey = await apiKeyModel.createNew(
                            'organization', org, user, { readPermission: true, writePermission: true },
                        );

                        expect(apiKey.writePermission && apiKey.readPermission).toBeTruthy();
                    });
                });
            });

            describe('and an invalid user', () => {
                test('if should throw an error.', async () => {
                    let error;
                    try {
                        await apiKeyModel.createNew('organization', org, badUser);
                    } catch (err) {
                        error = err;
                    }

                    expect(error.message).toMatch(/User does not exist/);
                });
            });

            describe('and a missing user', () => {
                test('it should throw a validation error.', async () => {
                    let error;
                    try {
                        await apiKeyModel.createNew('organization', org);
                    } catch (err) {
                        error = err;
                    }

                    expect(error.message).toMatch(/validation/);
                });
            });
        });

        describe('and an invalid scope', () => {
            test('it should return throw a validation error.', async () => {
                let error;
                try {
                    await apiKeyModel.createNew('not_organization', org);
                } catch (err) {
                    error = err;
                }

                expect(error.message).toMatch(/validation/);
            });
        });
    });

    describe('when passed an invalid organizaion scope', () => {
        let org;

        beforeEach(async () => {
            org = await new organizationModel({ name: 'test' });
        });

        describe('and the scope is valid', () => {
            test('it should throw an error.', async () => {
                let error;
                try {
                    await apiKeyModel.createNew('organization', org);
                } catch (err) {
                    error = err;
                }

                expect(error.message).toMatch(/Organization does not exist./);
            });
        });
    });

    describe('when not passed a scope object', () => {
        test('it should throw a validation error.', async () => {
            let error;
            try {
                await apiKeyModel.createNew('organization');
            } catch (err) {
                error = err;
            }

            expect(error.message).toMatch(/validation/);
        });
    });
});
