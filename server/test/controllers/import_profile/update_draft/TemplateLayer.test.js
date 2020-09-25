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

const TemplateModel = require('../../../../ODM/models').template;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const UserModel = require('../../../../ODM/models').user;
const TemplateLayer = require('../../../../controllers/importProfile/TemplateLayer')
    .TemplateLayer;

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


const testSuccess = async (templateDocument, parentProfile) => {
    const templateLayer = new TemplateLayer({
        templateDocument: templateDocument,
        parentProfile: parentProfile,
        versionStatus: 'draft',
    });
    const templateModel = await templateLayer.scanProfileComponentLayer();
    return templateModel;
};

const testError = async (templateDocument, parentProfile) => {
    const templateLayer = new TemplateLayer({
        templateDocument: templateDocument,
        parentProfile: parentProfile,
        versionStatus: 'draft',
    });

    let error;
    let templateModel;
    try {
        templateModel = await templateLayer.scanProfileComponentLayer();
    } catch (err) {
        error = err.message;
    }

    return error;
};

describe('TemplateLayer#scanProfileComponentLayer', () => {
    const SOME_CONCEPT_ID = 'some_concept_id';
    const SOME_OTHER_CONCEPT_ID = 'some_other_concept_id';
    const SOME_TEMPLATE_ID = 'some_template_id';
    const SOME_OTHER_TEMPLATE_ID = 'some_other_template_id';

    let templateDocument;
    let templateModel;
    let user;
    let otherUser;
    let parentProfile;
    beforeEach(async () => {
        user = new UserModel({ email: 'an@email.com' });
        await user.save();

        otherUser = new UserModel({ email: 'another@email.com' });
        await otherUser.save();

        templateDocument = {
            id: 'template1_id',
            type: 'StatementTemplate',
            inScheme: 'parent_profile_id',
            prefLabel: { en: 'template1' },
            definition: { en: 'template description' },
        };
        parentProfile = new ProfileVersionModel({
            iri: 'parent_profile_id',
            name: 'profile_name',
            description: 'profile_description',
            state: 'draft',
            createdBy: user,
            updatedBy: otherUser,
        });
        await parentProfile.save();
    });

    afterEach(async () => {
        await parentProfile.remove();
        await user.remove();
        await otherUser.remove();
    });

    describe('when versionLayer#versionStatus is `draft`', () => {
        describe('when the template exists on the server', () => {
            let existingTemplate;
            beforeEach(async () => {
                existingTemplate = new TemplateModel({
                    iri: 'template1_id',
                    name: 'template1',
                    description: 'template description',
                    parentProfile: parentProfile,
                    createdBy: user,
                    updatedBy: user,
                });
                await existingTemplate.save();
            });

            afterEach(async () => {
                await existingTemplate.remove();
            });

            describe('and nothing in different on the template', () => {
                test('it should return the same model with no changes.', async () => {
                    templateModel = await testSuccess(templateDocument, parentProfile);

                    expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                    expect(templateModel.iri).toEqual(existingTemplate.iri);
                    expect(templateModel.name).toEqual(existingTemplate.name);
                    expect(templateModel.description).toEqual(existingTemplate.description);
                    expect(templateModel.parentProfile._id.toString()).toEqual(existingTemplate.parentProfile._id.toString());
                    expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                    expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                });
            });

            describe('and there are some differences in the templates', () => {
                describe('- adding a property', () => {
                    test('it should return the same model with the expected changes.', async () => {
                        templateDocument.prefLabel.new_lang = 'added_prelabel';

                        templateModel = await testSuccess(templateDocument, parentProfile);

                        expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                        expect(templateModel.translations[0].language).toEqual('new_lang');
                        expect(templateModel.translations[0].translationName).toEqual(templateDocument.prefLabel.new_lang);
                        expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                        expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                    });
                });

                describe('- updating a property', () => {
                    test('it should return the same model with the expected changes.', async () => {
                        templateDocument.prefLabel.en = 'updated_prelabel';

                        templateModel = await testSuccess(templateDocument, parentProfile);

                        expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                        expect(templateModel.name).toEqual(templateDocument.prefLabel.en);
                        expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                        expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                    });
                });

                describe('- removing a property', () => {
                    test('it should return the same model with the expected changes.', async () => {
                        existingTemplate.translations = {
                            language: 'new_lang',
                            translationName: 'to_be_removed',
                        };
                        await existingTemplate.save();

                        templateModel = await testSuccess(templateDocument, parentProfile);

                        expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                        expect(templateModel.translations[0]).toBeFalsy();
                        expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                        expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                    });
                });
            });
        });

        describe('when the template does not exist on the server', () => {
            test('it should return a new model with the expect values.', async () => {
                templateModel = await testSuccess(templateDocument, parentProfile);

                expect(templateModel.iri).toEqual(templateDocument.id);
                expect(templateModel.name).toEqual(templateDocument.prefLabel.en);
                expect(templateModel.description).toEqual(templateDocument.definition.en);
                expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                expect(templateModel.createdBy._id.toString()).toEqual(otherUser._id.toString());
            });
        });
    });
});
