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

const models = require('../../../../ODM/models');
const profileController = require('../../../../controllers/profiles');

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

const next = response => err => {
    if (err) {
        response.statusCode = err.status || 500;
        response.statusMessage = err.message;
    }
};

const makeRequest = async (reqObject) => {
    const req = httpmocks.createRequest(reqObject);
    const res = httpmocks.createResponse(req);
    await profileController.middleware.checkUpdateDraftProfile(req, res, next(res));
    return { req: req, res: res };
};

const PROFILE_VERSION1_ID = 'profile_version1_id';
const PROFILE_VERSION2_ID = 'profile_version2_id';
const PROFILE1_ID = 'profile1_id';
const PROFILE2_ID = 'profile2_id';
const CONCEPT1_ID = 'concept1_id';
const CONCEPT2_ID = 'concept2_id';

let profileModel;
let profileVersionModel;
let requestObject;
let requestResponse;
let organization;
let profileDocument;
let existingDraftProfileVersion;
let otherExistingProfileVersion;
let existingParentProfile;
let otherExistingParentProfile;
let metadata;
let success;
let body;
let newConceptDoc;
let existingConceptDoc;
let newConcept;
let existingConcept;
describe('controllers.profiles.middleware.updateDraftProfile', () => {
    beforeEach(() => {
        requestObject = {
            method: 'PUT',
            url: '/endpoint',
        };

        newConceptDoc = {
            id: CONCEPT1_ID,
            inScheme: 'profile_version1_id',
            prefLabel: { en: 'concept1' },
            definition: { en: 'concept 1' },
            type: 'Verb',
        };

        existingConceptDoc = {
            id: CONCEPT2_ID,
            inScheme: 'profile_version1_id',
            prefLabel: { en: 'concept2' },
            definition: { en: 'concept 2' },
            type: 'Verb',
        };
    });

    describe('if request.profile exists', () => {
        beforeEach(async () => {
            organization = new models.organization({ name: 'an_org' });
            await organization.save();
            existingDraftProfileVersion = new models.profileVersion({
                iri: PROFILE_VERSION1_ID,
                name: 'profile1',
                description: 'profile version 1',
                organization: organization,
            });
            await existingDraftProfileVersion.save();
            requestObject.profile = existingDraftProfileVersion;
        });

        afterEach(async () => {
            await organization.remove();
            await existingDraftProfileVersion.remove();
        });

        describe('and request.body.profile exists', () => {
            beforeEach(() => {
                profileDocument = {
                    '@context': 'https://w3id.org/xapi/profiles/context',
                    id: PROFILE1_ID,
                    type: 'Profile',
                    prefLabel: {
                        en: 'profile1',
                    },
                    definition: {
                        en: 'profile version 1',
                    },
                    conformsTo: 'https://w3id.org/xapi/profiles#1.0',
                    versions: [
                        {
                            id: PROFILE_VERSION1_ID,
                            generatedAtTime: '2017-08-21T14:25:59.295Z',
                        },
                    ],
                    author: {
                        type: 'Organization',
                        name: 'an_org',
                    },
                };
                requestObject.body = {
                    profile: profileDocument,
                    status: { published: false },
                };
            });

            describe('and req.profile is in a draft state', () => {
                beforeEach(async () => {
                    existingDraftProfileVersion.state = 'draft';
                    await existingDraftProfileVersion.save();
                });

                describe('and the parent profile of req.profile exists', () => {
                    beforeEach(async () => {
                        existingParentProfile = new models.profile({
                            iri: PROFILE1_ID,
                            organization: organization,
                        });
                        await existingParentProfile.save();

                        existingDraftProfileVersion.parentProfile = existingParentProfile._id;
                        await existingDraftProfileVersion.save();
                    });

                    afterEach(async () => {
                        await existingParentProfile.remove();
                    });

                    describe('and the parent profile of req.profile has a currentDraftVersion', () => {
                        describe('and the req.profile is the parent profiles currentDraftVersion', () => {
                            beforeEach(async () => {
                                existingParentProfile.currentDraftVersion = existingDraftProfileVersion._id;
                                await existingParentProfile.save();
                            });

                            test('it should return a success response with req.profile attached as req.draftVersion and the root profileModel as req.draftProfile.', async () => {
                                requestResponse = await makeRequest(requestObject);

                                expect(requestResponse.req.draftVersion._id.toString()).toEqual(requestObject.profile._id.toString());
                                expect(requestResponse.req.draftProfile._id.toString()).toEqual(existingParentProfile._id.toString());
                            });
                        });

                        describe('and the req.profile is NOT the parent profiles currentDraftVersion', () => {
                            beforeEach(async () => {
                                otherExistingProfileVersion = new models.profileVersion({
                                    iri: PROFILE_VERSION2_ID,
                                    name: 'profile_version_2',
                                    description: 'profile version 2',
                                    parentProfile: existingParentProfile._id,
                                });
                                await otherExistingProfileVersion.save();

                                existingParentProfile.currentDraftVersion = otherExistingProfileVersion._id;
                                await existingParentProfile.save();
                            });

                            afterEach(async () => {
                                await otherExistingProfileVersion.remove();
                            });

                            test('it should return a conflict error response.', async () => {
                                requestResponse = await makeRequest(requestObject);

                                expect(requestResponse.res.statusCode).toEqual(409);
                                expect(requestResponse.res.statusMessage).toMatch(/Cannot update a profile that is not in a draft state/);
                            });
                        });
                    });

                    describe('and the parent profile of req.profile does NOT have a currentDraftVersion', () => {
                        test('it should return a conflict error response.', async () => {
                            requestResponse = await makeRequest(requestObject);

                            expect(requestResponse.res.statusCode).toEqual(409);
                            expect(requestResponse.res.statusMessage).toMatch(/Cannot update a profile that is not in a draft state/);
                        });
                    });
                });

                describe('and the parent profile of req.profile does not exist', () => {
                    test('it should return a conflict error response.', async () => {
                        requestResponse = await makeRequest(requestObject);

                        expect(requestResponse.res.statusCode).toEqual(409);
                        expect(requestResponse.res.statusMessage).toMatch(/Profile version does not a have a root profile/);
                    });
                });
            });

            describe('and req.profile is not in a draft state', () => {
                beforeEach(async () => {
                    existingDraftProfileVersion.state = 'published';
                    await existingDraftProfileVersion.save();
                });

                test('it should return a conflict error response.', async () => {
                    requestResponse = await makeRequest(requestObject);

                    expect(requestResponse.res.statusCode).toEqual(409);
                    expect(requestResponse.res.statusMessage).toMatch(/Cannot update a profile version that is not in a draft state/);
                });
            });
        });

        describe('and request.body.profile does not exist', () => {
            test('it should return an validation error response.', async () => {
                requestResponse = await makeRequest(requestObject);

                expect(requestResponse.res.statusCode).toEqual(400);
                expect(requestResponse.res.statusMessage).toMatch(/The profile document is missing from the request/);
            });
        });
    });

    describe('if request.profile does not exist', () => {
        test('it should return a server error response.', async () => {
            requestResponse = await makeRequest(requestObject);

            expect(requestResponse.res.statusCode).toEqual(500);
            expect(requestResponse.res.statusMessage).toMatch(/The profile version model is missing from the request/);
        });
    });
});
