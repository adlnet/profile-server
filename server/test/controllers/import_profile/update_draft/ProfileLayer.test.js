const { expectCt } = require('helmet');
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

const ConceptModel = require('../../../../ODM/models').concept;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const ProfileModel = require('../../../../ODM/models').profile;
const OraganizationModel = require('../../../../ODM/models').organization;
const UserModel = require('../../../../ODM/models').user;
const ProfileLayer = require('../../../../controllers/importProfile/ProfileLayer')
    .ProfileLayer;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

const testDraftSuccess = async (workGroup, user, profileDocument, draftProfileModel, draftVersionModel) => {
    const profileImporter = new ProfileLayer(
        workGroup, user, profileDocument, false, null,
        draftProfileModel, draftVersionModel,
    );
    const profileModel = await (await (await (await
    profileImporter
        .scanProfileLayer())
        .scanVersionLayer())
        .scanProfileComponentLayer())
        .save();
    return profileModel;
};

const testPublishedSuccess = async (workGroup, user, profileDocument, draftProfileModel, draftVersionModel) => {
    const profileImporter = new ProfileLayer(
        workGroup, user, profileDocument, true, null,
        draftProfileModel, draftVersionModel,
    );
    const profileModel = await (await (await (await
    profileImporter
        .scanProfileLayer())
        .scanVersionLayer())
        .scanProfileComponentLayer())
        .save();
    return profileModel;
};

const testError = async (workGroup, user, profileDocument, draftProfileModel, draftVersionModel) => {
    const profileImporter = new ProfileLayer(
        workGroup, user, profileDocument, false, undefined,
        draftProfileModel, draftVersionModel,
    );

    let error;
    try {
        const profileModel = await (await (await (await
        profileImporter
            .scanProfileLayer())
            .scanVersionLayer())
            .scanProfileComponentLayer())
            .save();
    } catch (err) {
        error = err.message;
    }

    return error;
};

beforeAll(async () => {
    const cnnStr = await mongoServer.getUri();
    await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

const VERSION1_ID = 'version1_id';
const VERSION2_ID = 'version2_id';
const PROFILE1_ID = 'profile1_id';
const CONCEPT1_ID = 'concept1_id';
let draftVersionModel;
let draftProfileModel;
let versionModel;
let profileModel;
let publishedVersionModel;
let profileDocument;
let organization;
let user;
let existingConcept;
let newConcept;

describe('ProfileLayer#ScanProfileLayer', () => {
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
                generatedAtTime: Date.now(),
            }],
            author: {
                type: 'Organization',
                name: 'an_org',
            },
        };

        organization = new OraganizationModel({ name: 'an_org' });
        await organization.save();

        user = new UserModel({ email: 'an@email.com' });
        await user.save();
    });

    afterEach(async () => {
        await organization.remove();
        await user.remove();
    });

    describe('when there is a draftProfile and a draftVersion', () => {
        beforeEach(async () => {
            draftProfileModel = new ProfileModel({
                iri: PROFILE1_ID,
                organization: organization,
                createdBy: user,
                updatedBy: user,
            });

            draftVersionModel = new ProfileVersionModel({
                iri: VERSION1_ID,
                name: 'profile1',
                description: 'profile 1',
                organization: organization,
                parentProfile: draftProfileModel,
                state: 'draft',
                createdBy: user,
                updatedBy: user,
            });
            await draftVersionModel.save();

            draftProfileModel.currentDraftVersion = draftVersionModel._id;
            await draftProfileModel.save();
        });

        afterEach(async () => {
            await draftVersionModel.remove();
            await draftProfileModel.remove();
        });

        describe('and the profile has not been published', () => {
            describe('and published is true', () => {
                describe('and there are NO changes', () => {
                    beforeEach(async () => {
                        profileModel = await testPublishedSuccess(
                            organization, user, profileDocument, draftProfileModel, draftVersionModel,
                        );
                    });

                    test('it should return the same draft profile model.', () => {
                        expect(profileModel._id.toString()).toEqual(draftProfileModel._id.toString());
                    });

                    test('it should make the draft version the profile models currentPublishedVersion.', () => {
                        expect(profileModel.currentPublishedVersion._id.toString()).toEqual(draftVersionModel._id.toString());
                    });

                    test('it should make the profile models currentDraftVersion falsy.', () => {
                        expect(profileModel.currentDraftVersion).toBeFalsy();
                    });
                });
            });

            describe('and published is false', () => {
                describe('and there NO changes', () => {
                    test('it should return the same draft profile model with draft version model as its currentDraftVersion.', async () => {
                        profileModel = await testDraftSuccess(
                            organization, user, profileDocument, draftProfileModel, draftVersionModel,
                        );

                        expect(profileModel._id.toString()).toEqual(draftProfileModel._id.toString());
                        expect(profileModel.currentDraftVersion._id.toString()).toEqual(draftVersionModel._id.toString());
                    });
                });

                describe('and there are changes', () => {
                    describe('and the changes are valid', () => {
                        describe('- update iri', () => {
                            test('it return the same draft profile model with expected changes.', async () => {
                                profileDocument.id = 'new_profile_id';

                                profileModel = await testDraftSuccess(
                                    organization, user, profileDocument, draftProfileModel, draftVersionModel,
                                );

                                expect(profileModel._id.toString()).toEqual(draftProfileModel._id.toString());
                                expect(profileModel.currentDraftVersion._id.toString()).toEqual(draftVersionModel._id.toString());
                                expect(profileModel.iri).toEqual('new_profile_id');
                            });
                        });
                    });

                    describe('and the changes are NOT valid', () => {

                    });
                });
            });
        });

        describe('and the profile has been published', () => {
            beforeEach(async () => {
                profileDocument.versions[0].wasRevisionOf = [VERSION2_ID];
                profileDocument.versions.push({
                    id: VERSION2_ID,
                    generatedAtTime: Date.now(),
                });

                publishedVersionModel = new ProfileVersionModel({
                    iri: VERSION2_ID,
                    name: 'profile1',
                    description: 'profile 1',
                    organization: organization,
                    parentProfile: draftProfileModel,
                    state: 'published',
                    createdBy: user,
                    updatedBy: user,
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
            describe('and there NO changes', () => {
                test('it should return the same profile model with no changes.', async () => {
                    profileModel = await testDraftSuccess(
                        organization, user, profileDocument, draftProfileModel, draftVersionModel,
                    );

                    expect(profileModel._id.toString()).toEqual(draftProfileModel._id.toString());
                    expect(profileModel.currentDraftVersion._id.toString()).toEqual(draftVersionModel._id.toString());
                    expect(profileModel.currentPublishedVersion._id.toString()).toEqual(publishedVersionModel._id.toString());
                });
            });

            describe('and there changes', () => {
                describe('and the changes are valid', () => {
                    test('it should return the same profile model with the expextced changes.', async () => {
                        profileDocument.prefLabel.new_lang = 'new_profile1';
                        profileModel = await testDraftSuccess(
                            organization, user, profileDocument, draftProfileModel, draftVersionModel,
                        );

                        versionModel = (await profileModel.populate('currentDraftVersion').execPopulate()).currentDraftVersion;

                        expect(profileModel._id.toString()).toEqual(draftProfileModel._id.toString());
                        expect(profileModel.currentDraftVersion._id.toString()).toEqual(draftVersionModel._id.toString());
                        expect(profileModel.currentPublishedVersion._id.toString()).toEqual(publishedVersionModel._id.toString());
                        expect(versionModel.translations.length).toEqual(1);
                        expect(versionModel.translations[0].translationName).toEqual('new_profile1');
                    });
                });

                describe('and the changes are NOT valid', () => {
                    test('it should throw a conflict error.', async () => {
                        profileDocument.prefLabel.en = 'changed_profile_1';
                        const error = await testError(
                            organization, user, profileDocument, draftProfileModel, draftVersionModel,
                        );

                        expect(error).toMatch(/prefLabel.en cannot be updated on published profile profile1_id/);
                    });
                });
            });
        });
    });
});

