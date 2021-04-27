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
const { definition } = require('../../../../utils/langmaps');
const profile = require('../../../../ODM/profile');
const { expectCt } = require('helmet');
const { profileVersion } = require('../../../../ODM/models');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const VersionLayer = require('../../../../controllers/importProfile/VersionLayer')
    .VersionLayer;
const ProfileModel = require('../../../../ODM/models').profile;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const OrganizationModel = require('../../../../ODM/models').organization;
const UserModel = require('../../../../ODM/models').user;

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

let user;
beforeEach(async () => {
    user = new UserModel({ email: 'an@email.com' });
    await user.save();
});

afterEach(async () => {
    await user.remove();
});

describe('VersionLayer#Constructor', () => {
    let otherProfileVersion;

    test('it should return a profileVersion model with the correct values.', async () => {
        const versionDocument = {
            versions: [{ id: 'version1_id' }],
            prefLabel: { en: 'profile1' },
            definition: { en: 'test_description.' },
            seeAlso: 'stuff.com',
            concepts: [{
                id: 'concept1_id',
                prefLabel: { en: 'concept1' },
                definition: { en: 'concept1_desc' },
                type: 'Verb',
            }, {
                id: 'concept2_id',
                prefLabel: { en: 'concept2' },
                definition: { en: 'concept2_desc' },
                type: 'Verb',
                related: [
                    'concept1_id',
                ],
            }, {
                id: 'concept3_id',
                prefLabel: { en: 'concept3' },
                definition: { en: 'concept3_desc' },
                type: 'ActivityType',
            }],
            templates: [{
                id: 'template1_id',
                prefLabel: { en: 'template1' },
                definition: { en: 'template1_desc' },
                contextGroupingActivityType: ['concept3_id'],
            }],
            patterns: [{
                id: 'pattern1_id',
                prefLabel: { en: 'pattern1' },
                definition: { en: 'pattern1_desc' },
                optional: 'template1_id',
            }],
        };
        const versionLayer = new VersionLayer({
            profileModel: new ProfileModel({
                iri: 'profile1_id',
                organization: new OrganizationModel({ name: 'workGroup1' }),
                createdBy: user,
                updatedBy: user,
            }),
            versionDocument: versionDocument,
            previousVersionModels: [],
            save: async function (versionModel) {
                await versionModel.save();
                return versionModel;
            },
        });

        const versionModel = await (await (await versionLayer
            .scanVersionLayer())
            .scanProfileComponentLayer())
            .save();
        expect(versionModel.iri).toEqual('version1_id');

        const foundProfileVersion = await ProfileVersionModel
            .findOne({ iri: versionModel.iri })
            .populate('wasRevisionOf');
        expect(foundProfileVersion.id).toEqual(versionModel.id);
        await foundProfileVersion.remove();
    });
});

describe('VersionLayer#scanVersionLayer', () => {
    let profileLayer;
    let profileModel;
    let versionDocument;
    let save;
    beforeEach(() => {
        profileModel = new ProfileModel({
            iri: 'profile1_id',
            organization: new OrganizationModel({ name: 'workGroup1' }),
            createdBy: user,
            updatedBy: user,
        });

        versionDocument = {
            versions: [
                { id: 'version1_id' },
            ],
            prefLabel: { en: 'profile1' },
            definition: { en: 'test_description.' },
            seeAlso: 'stuff.com',
        };

        save = function (versionModel) {
            return versionModel;
        };

        // profileLayer = {
        //     profileModel: new ProfileModel({
        //         iri: 'profile1_id',
        //         organization: new OrganizationModel({ name: 'workGroup1' }),
        //     }),
        //     versionDocument: {
        //         versions: [
        //             { id: 'version1_id' },
        //         ],
        //         prefLabel: { en: 'profile1' },
        //         definition: { en: 'test_description.' },
        //         seeAlso: 'stuff.com',
        //     },
        //     save: function (versionModel) {
        //         return versionModel;
        //     },
        // };
    });

    describe('if the profileVersion does not exist on the server', () => {
        let versionLayer;
        let versionModel;
        describe('ProfileVersionModel#wasRevisionOf', () => {
            beforeEach(() => {
                versionDocument.versions[0].wasRevisionOf = ['other_profile_version'];
                versionDocument.versions[0].generatedAtTime = new Date();

                profileLayer = {
                    profileModel: profileModel,
                    versionDocument: versionDocument,
                    previousVersionModels: [],
                    save: save,
                };
            });

            describe('when the wasRevisionOf value is not in the previousVersion array', () => {
                describe('and the wasRevisionOf value is not found on the server', () => {
                    let foundParentlessVersion;
                    beforeEach(async () => {
                        versionLayer = new VersionLayer(profileLayer);
                        versionModel = await (await (await versionLayer
                            .scanVersionLayer())
                            .scanProfileComponentLayer())
                            .save();

                        foundParentlessVersion = await ProfileVersionModel
                            .findOne({ iri: versionDocument.versions[0].wasRevisionOf });
                    });

                    afterEach(async () => {
                        await foundParentlessVersion.remove();
                        await versionModel.remove();
                    });

                    test('it should save that value on the server as a parentless version.', () => {
                        expect(foundParentlessVersion).toBeTruthy();
                        expect(foundParentlessVersion.iri).toEqual(versionDocument.versions[0].wasRevisionOf[0]);
                        expect(foundParentlessVersion.parentProfile).toBeFalsy();
                    });

                    test('it should create a version model with that wasRevisionOf value as the models wasRevisionOf property.', () => {
                        expect(versionModel.wasRevisionOf[0]._id.toString()).toEqual(foundParentlessVersion._id.toString());
                    });
                });

                describe('and the wasRevisionOf value is found on the server', () => {
                    let existingVersion;
                    beforeEach(async () => {
                        existingVersion = new ProfileVersionModel({
                            iri: 'other_profile_version',
                            name: 'other_profile_version',
                            description: 'other_profile_version',
                        });
                        await existingVersion.save();

                        versionLayer = new VersionLayer(profileLayer);
                        versionModel = await (await (await versionLayer
                            .scanVersionLayer())
                            .scanProfileComponentLayer())
                            .save();
                    });

                    afterEach(async () => {
                        await existingVersion.remove();
                        await versionModel.remove();
                    });

                    test('it should create a version model with that wasRevisionOf value as the models wasRevisionOf property.', () => {
                        expect(versionModel.wasRevisionOf[0]._id.toString()).toEqual(existingVersion._id.toString());
                    });
                });
            });

            describe('when the wasRevisionOf value is in the previousVersion array', () => {
                let previousVersion;
                beforeEach(async () => {
                    previousVersion = new ProfileVersionModel({
                        iri: 'other_profile_version',
                        name: 'other_profile_version',
                        description: 'other_profile_version',
                    });

                    profileLayer.previousVersionModels.push(previousVersion);

                    versionLayer = new VersionLayer(profileLayer);
                    versionModel = await (await (await versionLayer
                        .scanVersionLayer())
                        .scanProfileComponentLayer())
                        .save();
                });

                afterEach(async () => {
                    await versionModel.remove();
                });

                test('it should create version model with the model found in the previousVersions array as a member of its wasRevisionOf property.', () => {
                    expect(versionModel.wasRevisionOf[0]._id.toString()).toEqual(previousVersion._id.toString());
                });
            });
        });
    });

    describe('if the profile version exists on the server', () => {
        let existingVersion;
        beforeEach(async () => {
            profileLayer = {
                profileModel: profileModel,
                versionDocument: versionDocument,
                previousVersionModels: [],
                save: save,
            };

            existingVersion = new ProfileVersionModel({
                iri: 'version1_id',
                name: 'profile1',
                description: 'profile1_desc',
            });
            await existingVersion.save();
        });

        afterEach(async () => {
            await existingVersion.remove();
        });

        test('it should throw an error.', async () => {
            const versionLayer = new VersionLayer(profileLayer);

            let error;
            try {
                const versionModel = await versionLayer.scanVersionLayer();
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Profile version version1_id already exists/);
        });
    });

    describe('if the profile has duplicate concept ids', () => {
        test('it should throw an error.', async () => {
            versionDocument.concepts = ['concept1_id', 'concept1_id'];
            profileLayer = {
                profileModel: profileModel,
                versionDocument: versionDocument,
                previousVersionModels: [],
                save: save,
            };
            const versionLayer = new VersionLayer(profileLayer);

            let error;
            try {
                const versionModel = await versionLayer.scanVersionLayer();
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Profile version version1_id has duplicate concepts/);
        });
    });

    describe('if the profile has duplicate template ids', () => {
        test('it should throw an error.', async () => {
            versionDocument.templates = ['template1_id', 'template1_id'];
            profileLayer = {
                profileModel: profileModel,
                versionDocument: versionDocument,
                previousVersionModels: [],
                save: save,
            };
            const versionLayer = new VersionLayer(profileLayer);

            let error;
            try {
                const versionModel = await versionLayer.scanVersionLayer();
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Profile version version1_id has duplicate templates/);
        });
    });

    describe('if the profile has duplicate pattern ids', () => {
        test('it should throw an error.', async () => {
            versionDocument.patterns = ['pattern1_id', 'pattern1_id'];
            profileLayer = {
                profileModel: profileModel,
                versionDocument: versionDocument,
                previousVersionModels: [],
                save: save,
            };
            const versionLayer = new VersionLayer(profileLayer);

            let error;
            try {
                const versionModel = await versionLayer.scanVersionLayer();
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Profile version version1_id has duplicate patterns/);
        });
    });
});
