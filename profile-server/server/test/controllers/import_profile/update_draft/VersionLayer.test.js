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
const VersionLayer = require('../../../../controllers/importProfile/VersionLayer')
    .VersionLayer;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

const testPublishedSuccess = async (versionDocument, previousVersionModels, draftVersionModel, parentProfile, hasBeenPublished) => {
    const versionLayer = new VersionLayer({
        profileModel: parentProfile,
        draftVersionModel: draftVersionModel,
        versionDocument: versionDocument,
        previousVersionModels: previousVersionModels,
        versionStatus: 'draft',
        hasBeenPublished: hasBeenPublished,
        published: true,
        save: async (profileVersion) => profileVersion,
    });
    const versionModel = await (await (await
    versionLayer
        .scanVersionLayer())
        .scanProfileComponentLayer())
        .save();
    return versionModel;
};

const testDraftSuccess = async (versionDocument, previousVersionModels, draftVersionModel, parentProfile, hasBeenPublished) => {
    const versionLayer = new VersionLayer({
        profileModel: parentProfile,
        versionDocument: versionDocument,
        draftVersionModel: draftVersionModel,
        previousVersionModels: previousVersionModels,
        versionStatus: 'draft',
        hasBeenPublished: hasBeenPublished,
        published: false,
        save: async (profileVersion) => profileVersion,
    });

    const versionModel = await (await (await
    versionLayer
        .scanVersionLayer())
        .scanProfileComponentLayer())
        .save();
    return versionModel;
};

const testError = async (versionDocument, previousVersionModels, draftVersionModel, parentProfile, hasBeenPublished) => {
    const versionLayer = new VersionLayer({
        versionDocument: versionDocument,
        profileModel: parentProfile,
        draftVersionModel: draftVersionModel,
        previousVersionModels: previousVersionModels,
        versionStatus: 'draft',
        hasBeenPublished: hasBeenPublished,
        save: async (profileVersion) => profileVersion,
    });

    let error;
    try {
        const versionModel = await (await (await
        versionLayer
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
let publishedVersionModel;
let versionDocument;
let organization;
let existingConcept;
let newConcept;
let user;
let otherUser;
describe('VersionLayer#scanVersionLayer', () => {
    beforeEach(async () => {
        versionDocument = {
            prefLabel: { en: 'profile1' },
            definition: { en: 'profile 1' },
            versions: [{
                id: VERSION1_ID,
                generatedAtTime: Date.now(),
            }],
        };

        organization = new OraganizationModel({ name: 'an_org' });
        await organization.save();

        user = new UserModel({ email: 'an@email.com' });
        await user.save();

        otherUser = new UserModel({ email: 'another@email.com' });
        await otherUser.save();
    });

    afterEach(async () => {
        await organization.remove();
        await user.remove();
        await otherUser.remove();
    });

    describe('if there is a draftVersion and a draftProfile and profile#versionStatus is `draft`', () => {
        beforeEach(async () => {
            draftProfileModel = new ProfileModel({
                iri: PROFILE1_ID,
                organization: organization,
                createdBy: user,
                updatedBy: otherUser,
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

        describe('and this profile has not been published', () => {
            // if this has not been published then any components that exist need
            //  not be validated for illegal changes.
            describe('and there were no changes', () => {
                test('it should return the draft version model with no changes.', async () => {
                    versionModel = await testDraftSuccess(
                        versionDocument, [], draftVersionModel, draftProfileModel, false,
                    );

                    expect(versionModel._id.toString()).toEqual(draftVersionModel._id.toString());
                    expect(versionModel.createdBy._id.toString()).toEqual(user._id.toString());
                    expect(versionModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                });
            });

            describe('changing versions.id of the draft version', () => {
                test('it should return the same draft version model with the iri changed to the new id.', async () => {
                    versionDocument.versions[0].id = 'changed_version_id';
                    versionModel = await testDraftSuccess(
                        versionDocument, [], draftVersionModel, draftProfileModel, false,
                    );

                    expect(versionModel._id.toString()).toEqual(draftVersionModel._id.toString());
                    expect(versionModel.iri).toEqual('changed_version_id');
                });
            });

            describe('components', () => {
                beforeEach(async () => {
                    versionDocument.concepts = [{
                        id: CONCEPT1_ID,
                        inScheme: 'version1_id',
                        type: 'Verb',
                        prefLabel: { en: 'concept1' },
                        definition: { en: 'concept description' },
                    }];
                });

                afterEach(async () => {
                    await ConceptModel.findOneAndDelete({ iri: CONCEPT1_ID });
                });

                describe('and there are new components added', () => {
                    beforeEach(async () => {
                        versionModel = await testDraftSuccess(
                            versionDocument, [], draftVersionModel, draftProfileModel, false,
                        );
                    });

                    test('it should return the same draft version model with the new components.', () => {
                        expect(versionModel._id.toString()).toEqual(draftVersionModel._id.toString());
                        expect(versionModel.concepts.length).toEqual(1);
                    });

                    test('it should save the components to the server.', async () => {
                        newConcept = await ConceptModel.findOne({ iri: CONCEPT1_ID });

                        expect(newConcept.parentProfile._id.toString()).toEqual(versionModel._id.toString());
                    });
                });

                describe('and the components exist', () => {
                    beforeEach(async () => {
                        existingConcept = new ConceptModel({
                            iri: CONCEPT1_ID,
                            name: 'concept1',
                            description: 'concept description',
                            type: 'Verb',
                            conceptType: 'Verb',
                            parentProfile: draftVersionModel,
                        });
                        await existingConcept.save();

                        draftVersionModel.concepts = [existingConcept];
                        await draftVersionModel.save();
                    });

                    afterEach(async () => {
                        await existingConcept.remove();
                    });

                    describe('and there were NO changes to the component', () => {
                        test('it should return the same draft version with the correct values.', async () => {
                            versionModel = await testDraftSuccess(
                                versionDocument, [], draftVersionModel, draftProfileModel, false,
                            );

                            expect(versionModel._id.toString()).toEqual(draftVersionModel._id.toString());
                            expect(versionModel.concepts.length).toEqual(1);
                        });
                    });

                    describe('and there are changes to the component', () => {
                        beforeEach(async () => {
                            versionDocument.concepts[0].prefLabel.en = 'new_concept1';

                            versionModel = await testDraftSuccess(
                                versionDocument, [], draftVersionModel, draftProfileModel, false,
                            );
                        });

                        test('it should return the same draft version with the correct values.', async () => {
                            expect(versionModel._id.toString()).toEqual(draftVersionModel._id.toString());
                            expect(versionModel.concepts.length).toEqual(1);
                        });

                        test('it should save the component with the changes to the server.', async () => {
                            newConcept = await ConceptModel.findOne({ iri: CONCEPT1_ID });

                            expect(newConcept.parentProfile._id.toString()).toEqual(versionModel._id.toString());
                            expect(newConcept.name).toEqual('new_concept1');
                        });
                    });

                    // describe('and there are invalid changes to the version.', () => {
                    //     test('it should throw a validation error.', () => {

                    //     });
                    // });
                });
            });
        });

        describe('and this profile has been published', () => {
            // if this has been published then the components may be children of the
            //  published version.  Those will need to be validated for illegal changes in the
            //  draft version.
            beforeEach(async () => {
                versionDocument.versions[0].wasRevisionOf = [VERSION2_ID];
                versionDocument.versions.push({
                    id: VERSION2_ID,
                    generatedAtTime: Date.now(),
                });

                publishedVersionModel = new ProfileVersionModel({
                    iri: VERSION2_ID,
                    name: 'profile1',
                    description: ' profile 1',
                    organization: organization,
                    parentProfile: draftProfileModel,
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

            describe('and there were no changes', () => {
                test('it should return the draft version with no changes.', async () => {
                    versionModel = await testDraftSuccess(
                        versionDocument, [], draftVersionModel, draftProfileModel, false,
                    );

                    expect(versionModel._id.toString()).toEqual(draftVersionModel._id.toString());
                });
            });

            describe('and there were changes', () => {
                beforeEach(async () => {
                    versionDocument.concepts = [{
                        id: CONCEPT1_ID,
                        inScheme: 'version1_id',
                        type: 'Verb',
                        prefLabel: { en: 'concept1' },
                        definition: { en: 'concept 1' },
                    }];

                    newConcept = new ConceptModel({
                        iri: CONCEPT1_ID,
                        type: 'Verb',
                        conceptType: 'Verb',
                        name: 'concept1',
                        description: 'concept 1',
                        parentProfile: publishedVersionModel._id,
                    });
                    await newConcept.save();

                    publishedVersionModel.concepts = [newConcept];
                    draftVersionModel.concepts = [newConcept];
                });

                afterEach(async () => {
                    await newConcept.remove();
                });

                describe('and the changes ares valid', () => {
                    describe('changing versions.id of the draft version', () => {
                        test('it should return the same draft version model with the iri changed to the new id.', async () => {
                            versionDocument.versions[0].id = 'changed_version_id';
                            versionDocument.concepts[0].inScheme = 'changed_version_id';
                            versionModel = await testDraftSuccess(
                                versionDocument, [publishedVersionModel], draftVersionModel, draftProfileModel, false,
                            );

                            expect(versionModel._id.toString()).toEqual(draftVersionModel._id.toString());
                            expect(versionModel.iri).toEqual('changed_version_id');
                        });
                    });

                    describe('components', () => {
                        test('it should return the same draft version model with the changes to the component.', async () => {
                            versionDocument.concepts[0].prefLabel.new_lang = 'new_prefLabel';

                            versionModel = await testDraftSuccess(
                                versionDocument, [publishedVersionModel], draftVersionModel, draftProfileModel, false,
                            );

                            existingConcept = await ConceptModel.findOne({ iri: CONCEPT1_ID });

                            expect(versionModel._id.toString()).toEqual(draftVersionModel._id.toString());
                            expect(existingConcept.translations.length).toEqual(1);
                            expect(existingConcept.translations[0].language).toEqual('new_lang');
                            expect(existingConcept.translations[0].translationName).toEqual('new_prefLabel');
                        });
                    });
                });

                describe('and the changes are invalid', () => {
                    describe('components', () => {
                        test('it should throw a validation error.', async () => {
                            versionDocument.concepts[0].prefLabel.en = 'new_concept1';

                            const error = await testError(
                                versionDocument, [publishedVersionModel], draftVersionModel, draftProfileModel, false,
                            );

                            expect(error).toMatch(/prefLabel.en cannot be updated on published concept concept1_id/);
                        });
                    });
                });
            });
        });
    });
});
