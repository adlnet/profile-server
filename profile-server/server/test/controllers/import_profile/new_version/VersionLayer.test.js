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
const { user } = require('../../../../ODM/models');
const pattern = require('../../../../profileValidator/schemas/pattern');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const ConceptModel = require('../../../../ODM/models').concept;
const TemplateModel = require('../../../../ODM/models').template;
const PatternModel = require('../../../../ODM/models').pattern;
const PatternComponentModel = require('../../../../ODM/models').patternComponent;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const ProfileModel = require('../../../../ODM/models').profile;
const OraganizationModel = require('../../../../ODM/models').organization;
const UserModel = require('../../../../ODM/models').user;
const VersionLayer = require('../../../../controllers/importProfile/VersionLayer')
    .VersionLayer;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

const testPublishedSuccess = async (versionDocument, parentProfile) => {
    const versionLayer = new VersionLayer({
        versionDocument: versionDocument,
        profileModel: parentProfile,
        previousVersionModels: [],
        versionStatus: 'new',
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

const testDraftSuccess = async (versionDocument, parentProfile) => {
    const versionLayer = new VersionLayer({
        versionDocument: versionDocument,
        profileModel: parentProfile,
        previousVersionModels: [],
        versionStatus: 'new',
        save: async (profileVersion) => profileVersion,
    });

    const versionModel = await (await (await
    versionLayer
        .scanVersionLayer())
        .scanProfileComponentLayer())
        .save();
    return versionModel;
};

const testError = async (versionDocument, parentProfile) => {
    const versionLayer = new VersionLayer({
        versionDocument: versionDocument,
        profileModel: parentProfile,
        previousVersionModels: [],
        versionStatus: 'new',
        save: async (profileVersion) => profileVersion,
    });

    let error;
    let VersionModel;
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

describe('VersionLayer#scanVersionLayer', () => {
    let versionDocument;
    let versionModel;
    let parentProfile;
    let parentProfileVersion;
    let orgModel;
    let user;
    beforeEach(async () => {
        versionDocument = {
            prefLabel: { en: 'profile1' },
            definition: { en: 'profile description' },
            versions: [
                {
                    id: 'version2_id',
                    generatedAtTime: Date.now(),
                    wasRevisionOf: ['version1_id'],
                },
                {
                    id: 'version1_id',
                    generatedAtTime: Date.now(),
                },
            ],
        };

        orgModel = new OraganizationModel({ name: 'org_1' });
        await orgModel.save();

        user = new UserModel({ email: 'an@email.com' });
        await user.save();

        parentProfile = new ProfileModel({
            iri: 'profile1_id',
            organization: orgModel,
            createdBy: user,
            updatedBy: user,
        });

        parentProfileVersion = new ProfileVersionModel({
            iri: 'version1_id',
            name: 'profile_name',
            description: 'profile_description',
            organization: orgModel,
            parentProfile: parentProfile,
        });
        await parentProfileVersion.save();

        parentProfile.currentPublishedVersion = parentProfileVersion;
        await parentProfile.save();
    });

    afterEach(async () => {
        await parentProfile.remove();
        await parentProfileVersion.remove();
        await orgModel.remove();
        await user.remove();
        if (versionModel) await versionModel.remove();
    });

    describe('when profileLayer#versionStatus is `new`', () => {
        describe('and the new version does not exist', () => {
            describe('and the components exists', () => {
                let existingConcept;
                let existingTemplate;
                let existingPattern;
                let patternComp;
                beforeEach(async () => {
                    existingConcept = new ConceptModel({
                        iri: 'concept1_id',
                        name: 'concept1',
                        description: 'concept description',
                        type: 'Verb',
                        conceptType: 'Verb',
                        parentProfile: parentProfileVersion,
                    });
                    await existingConcept.save();

                    existingTemplate = new TemplateModel({
                        iri: 'template1_id',
                        name: 'template1',
                        description: 'template description',
                        parentProfile: parentProfileVersion,
                    });
                    await existingTemplate.save();

                    patternComp = new PatternComponentModel({
                        componentType: 'template',
                        component: existingTemplate,
                    });
                    await patternComp.save();

                    existingPattern = new PatternModel({
                        iri: 'pattern1_id',
                        name: 'pattern1',
                        description: 'pattern description',
                        type: 'oneOrMore',
                        oneOrMore: patternComp,
                        parentProfile: parentProfileVersion,
                    });
                    await existingPattern.save();

                    versionDocument.concepts = [{
                        id: 'concept1_id',
                        inScheme: 'version2_id',
                        type: 'Verb',
                        prefLabel: { en: 'concept1' },
                        definition: { en: 'concept description' },
                    }];
                    versionDocument.templates = [{
                        id: 'template1_id',
                        inScheme: 'version2_id',
                        type: 'StatementTemplate',
                        prefLabel: { en: 'template1' },
                        definition: { en: 'template description' },
                    }];
                    versionDocument.patterns = [{
                        id: 'pattern1_id',
                        inScheme: 'version2_id',
                        type: 'Pattern',
                        prefLabel: { en: 'pattern1' },
                        definition: { en: 'pattern description' },
                        oneOrMore: 'template1_id',
                    }];
                });

                afterEach(async () => {
                    await existingConcept.remove();
                    await existingPattern.remove();
                    await patternComp.remove();
                    await existingTemplate.remove();
                });

                describe('and published? is true', () => {
                    test('it should return testing the profile version model with the expected values', async () => {
                        versionModel = await testPublishedSuccess(versionDocument, parentProfile);

                        expect(versionModel.iri).toEqual(versionDocument.versions[0].id);
                        expect(versionModel.name).toEqual(versionDocument.prefLabel.en);
                        expect(versionModel.description).toEqual(versionDocument.definition.en);
                        // expect(versionModel.wasRevisionOf[1]._id.toString()).toEqual(versionDocument.versions[1].id);
                        expect(versionModel.concepts[0]._id.toString()).toEqual(existingConcept._id.toString());
                        expect(versionModel.templates[0]._id.toString()).toEqual(existingTemplate._id.toString());
                        expect(versionModel.patterns[0]._id.toString()).toEqual(existingPattern._id.toString());
                        expect(versionModel.state).toEqual('published');
                    });
                });

                describe('and published? is falsy', () => {
                    test('it should return1 the profile version model with the expected values', async () => {
                        versionModel = await testDraftSuccess(versionDocument, parentProfile);

                        expect(versionModel.iri).toEqual(versionDocument.versions[0].id);
                        expect(versionModel.name).toEqual(versionDocument.prefLabel.en);
                        expect(versionModel.description).toEqual(versionDocument.definition.en);
                        // expect(versionModel.wasRevisionOf[1]._id.toString()).toEqual(versionDocument.versions[1].id);
                        expect(versionModel.concepts[0]._id.toString()).toEqual(existingConcept._id.toString());
                        expect(versionModel.templates[0]._id.toString()).toEqual(existingTemplate._id.toString());
                        expect(versionModel.patterns[0]._id.toString()).toEqual(existingPattern._id.toString());
                        expect(versionModel.state).toEqual('draft');
                    });
                });
            });
        });

        describe('and the new version exists', () => {
            let existingVersion;
            beforeEach(async () => {
                existingVersion = new ProfileVersionModel({
                    iri: 'version2_id',
                    name: 'profile1',
                    description: 'profile description',
                    parentProfile: parentProfile,
                });
                await existingVersion.save();
            });

            afterEach(async () => {
                await existingVersion.remove();
            });

            test('it should throw an error.', async () => {
                const error = await testError(versionDocument, parentProfile);

                expect(error).toMatch(/Profile version version2_id already exists/);
            });
        });
    });
});
