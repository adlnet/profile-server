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
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const uuid = require('uuid');

const app = require('../../../../../app');
const createIRI = require('../../../../utils/createIRI');
const { organization, apiKey, user, profile, profileVersion } = require('../../../../ODM/models');

const makeRequest = async (uuid, requestObject, key, ifUnmodifiedSince) => {
    const res = await request(app)
        .put(`/api/profile/${uuid}`)
        .set('Content-Type', 'application/json')
        .set('x-api-key', key.uuid)
        .set('If-Unmodified-Since', ifUnmodifiedSince)
        .send(requestObject);
        // .send({
        //     status: {
        //         published: false,
        //     },
        //     profile: goodProfile1,
        // });
    return res;
};

const makeBadRequestNoApiKey = async (uuid, requestObject, ifUnmodifiedSince) => {
    const res = await request(app)
        .put(`/api/profile/${uuid}`)
        .set('Content-Type', 'application/json')
        .set('If-Unmodified-Since', ifUnmodifiedSince)
        .send(requestObject);
    return res;
};

const makeBadRequestNoIfUnmodifiedSince = async (uuid, requestObject, apiKey) => {
    const res = await request(app)
        .put(`/api/profile/${uuid}`)
        .set('Content-Type', 'application/json')
        .set('x-api-key', apiKey.uuid)
        .send(requestObject);
    return res;
};

describe('Update Profile', () => {
    const mongoServer = new MongoMemoryServer();
    jest.setTimeout(10000);


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    const VERSION1_ID = 'version1_id';
    const VERSION2_ID = 'version2_id';
    const PROFILE1_ID = 'profile1_id';
    let key;
    let wg;
    let maker;
    let requestObject;
    let profileDocument;
    let draftVersionModel;
    let draftProfileModel;
    let versionModel;
    let profileModel;
    let publishedVersionModel;
    let response;
    let ifUnmodifiedSince;
    let metadata;
    beforeEach(async () => {
        wg = new organization({ name: 'an_org' });
        await wg.save();
        maker = new user({ email: 'test_name@test.com' });
        await maker.save();
        key = new apiKey({ scope: 'organization', scopeObject: wg, createdBy: maker, updatedBy: maker });
        await key.save();

        requestObject = {};
    });

    afterEach(async () => {
        await wg.remove();
        await maker.remove();
        await key.remove();
    });

    describe('when the requester is authorized', () => {
        describe('and a profile is provided', () => {
            beforeEach(async () => {
                profileDocument = {
                    id: PROFILE1_ID,
                    '@context': 'https://w3id.org/xapi/profiles/context',
                    type: 'Profile',
                    conformsTo: 'https://w3id.org/xapi/profiles#1.0',
                    prefLabel: { en: 'profile1' },
                    definition: { en: 'profile 1' },
                    versions: [{
                        id: VERSION1_ID,
                        generatedAtTime: Date.now().toString(),
                    }],
                    author: {
                        type: 'Organization',
                        name: 'an_org',
                    },
                };

                requestObject.profile = profileDocument;
            });

            describe('and there is a draft profile and profile verion on the server', () => {
                beforeEach(async () => {
                    draftProfileModel = new profile({
                        iri: PROFILE1_ID,
                        organization: wg._id,
                    });
                    await draftProfileModel.save();

                    draftVersionModel = new profileVersion({
                        iri: VERSION1_ID,
                        name: 'profile1',
                        description: 'profile 1',
                        organization: wg,
                        parentProfile: draftProfileModel._id,
                        state: 'draft',
                    });
                    await draftVersionModel.save();

                    draftProfileModel.currentDraftVersion = draftVersionModel._id;
                    await draftProfileModel.save();
                });

                afterEach(async () => {
                    await draftVersionModel.remove();
                    await draftProfileModel.remove();
                });

                describe('and the a valid If-Unmodified-Since was provided.', () => {
                    beforeEach(() => { ifUnmodifiedSince = draftVersionModel.updatedOn.toString(); });

                    describe('and the draft profile has NOT been published', () => {
                        describe('and published is true', () => {
                            beforeEach(async () => {
                                requestObject.status = { published: true };
                                // change some things.
                                profileDocument.id = 'change_profile1_id';
                                profileDocument.versions[0].id = 'change_version1_id';

                                response = await makeRequest(draftVersionModel.uuid, requestObject, key, ifUnmodifiedSince);
                            });

                            test('it should return a success response.', () => {
                                expect(response.status).toEqual(200);
                            });

                            test('it should return a reponse with a metadata object that has the correct changes.', () => {
                                metadata = response.body.metadata;
                                expect(metadata.profile_id).toEqual('change_profile1_id');
                                expect(metadata.version_id).toEqual('change_version1_id');
                                expect(metadata.status.published).toBeTruthy();
                            });
                        });

                        describe('and published is false', () => {
                            beforeEach(async () => {
                                requestObject.status = { published: false };
                                // change some things.
                                profileDocument.id = 'change_profile1_id';
                                profileDocument.versions[0].id = 'change_version1_id';

                                response = await makeRequest(draftVersionModel.uuid, requestObject, key, ifUnmodifiedSince);
                            });

                            test('it should return a success response.', () => {
                                expect(response.status).toEqual(200);
                            });

                            test('it should return a reponse with a metadata object that has the correct changes.', () => {
                                metadata = response.body.metadata;
                                expect(metadata.profile_id).toEqual('change_profile1_id');
                                expect(metadata.version_id).toEqual('change_version1_id');
                                expect(metadata.status.published).toBeFalsy();
                            });
                        });
                    });

                    describe('and the draft profile has been published', () => {
                        beforeEach(async () => {
                            profileDocument.versions[0].wasRevisionOf = [VERSION2_ID];
                            profileDocument.versions.push({
                                id: VERSION2_ID,
                                generatedAtTime: Date.now().toString(),
                            });

                            publishedVersionModel = new profileVersion({
                                iri: VERSION2_ID,
                                name: 'profile1',
                                description: 'profile 1',
                                organization: wg._id,
                                parentProfile: draftProfileModel._id,
                                state: 'published',
                            });
                            await publishedVersionModel.save();

                            draftVersionModel.version = 2;
                            await draftVersionModel.save();

                            draftProfileModel.currentPublishedVersion = publishedVersionModel._id;
                            await draftProfileModel.save();
                        });

                        afterEach(async () => {
                            await publishedVersionModel.remove();
                        });
                        describe('and published is true', () => {
                            beforeEach(async () => {
                                requestObject.status = { published: true };
                                // change some things.
                                profileDocument.versions[0].id = 'change_version1_id';

                                response = await makeRequest(draftVersionModel.uuid, requestObject, key, ifUnmodifiedSince);
                            });

                            test('it should return a success response.', () => {
                                expect(response.status).toEqual(200);
                            });

                            test('it should return a reponse with a metadata object that has the correct changes.', () => {
                                metadata = response.body.metadata;
                                expect(metadata.version_id).toEqual('change_version1_id');
                                expect(metadata.status.published).toBeTruthy();
                            });
                        });

                        describe('and published is false', () => {
                            beforeEach(async () => {
                                requestObject.status = { published: false };
                                // change some things.
                                profileDocument.versions[0].id = 'change_version1_id';

                                response = await makeRequest(draftVersionModel.uuid, requestObject, key, ifUnmodifiedSince);
                            });

                            test('it should return a success response.', () => {
                                expect(response.status).toEqual(200);
                            });

                            test('it should return a reponse with a metadata object that has the correct changes.', () => {
                                metadata = response.body.metadata;
                                expect(metadata.version_id).toEqual('change_version1_id');
                                expect(metadata.status.published).toBeFalsy();
                            });
                        });
                    });
                });

                describe('and the an invalid If-Unmodified-Since was provided.', () => {
                    test('it should return an precondition failed error response.', async () => {
                        response = await makeRequest(draftVersionModel.uuid, requestObject, key, new Date().toString());

                        expect(response.status).toEqual(412);
                        expect(response.text).toMatch(/This profile was modified/);
                    });
                });

                describe('and no If-Unmodified-Since was provided.', () => {
                    test('it should return an precondition required error response.', async () => {
                        response = await makeBadRequestNoIfUnmodifiedSince(draftVersionModel.uuid, requestObject, key);

                        expect(response.status).toEqual(428);
                        expect(response.text).toMatch(/This request requires a value for the If-Unmodified-Since header property/);
                    });
                });
            });

            describe('and there is NO draft profile or profile verion on the server', () => {
                test('it should return an error response.', async () => {
                    const uuidValue = uuid.v4();
                    response = await makeRequest(uuidValue, requestObject, key, new Date().toString());

                    expect(response.status).toEqual(404);
                    expect(response.text).toMatch(`Could not locate profile resource with uuid: ${uuidValue}`);
                });
            });
        });

        describe('and a profile is NOT provided', () => {
            test('it should return an error response.', async () => {
                const uuidValue = uuid.v4();
                response = await makeRequest(uuidValue, requestObject, key, new Date().toString());

                expect(response.status).toEqual(400);
                expect(response.text).toMatch(/Profile document missing/);
            });
        });
    });

    describe('when the requester is NOT authorized', () => {
        test('it should return an error response.', async () => {
            const uuidValue = uuid.v4();
            response = await makeBadRequestNoApiKey(uuidValue, requestObject, new Date().toString());

            expect(response.status).toEqual(401);
            expect(response.text).toMatch(/ApiKey is missing or incorrect/);
        });
    });
});
