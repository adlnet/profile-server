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
const pattern = require('../../../../profileValidator/schemas/pattern');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const TemplateModel = require('../../../../ODM/models').template;
const PatternModel = require('../../../../ODM/models').pattern;
const PatternComponentModel = require('../../../../ODM/models').patternComponent;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const UserModel = require('../../../../ODM/models').user;
const PatternLayer = require('../../../../controllers/importProfile/PatternLayer')
    .PatternLayer;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

const testSuccess = async (patternDocument, parentProfile) => {
    const patternLayer = new PatternLayer({
        patternDocument: patternDocument,
        parentProfile: parentProfile,
        versionStatus: 'draft',
    });
    const patternModel = await patternLayer.scanProfileComponentLayer();
    return patternModel;
};

beforeAll(async () => {
    const cnnStr = await mongoServer.getUri();
    await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('PatternLayer#scanProfileComponentLayer', () => {
    const SOME_PATTERN_ID = 'some_pattern_id';
    const SOME_OTHER_PATTERN_ID = 'some_other_pattern_id';
    const SOME_TEMPLATE_ID = 'some_template_id';
    const SOME_OTHER_TEMPLATE_ID = 'some_other_template_id';

    let patternDocument;
    let patternModel;
    let patternLayer;
    let parentProfile;
    let user;
    let otherUser;
    beforeEach(async () => {
        user = new UserModel({ email: 'an@email.com' });
        await user.save();

        otherUser = new UserModel({ email: 'another@email.com' });
        await otherUser.save();

        patternDocument = {
            id: 'pattern1_id',
            type: 'Pattern',
            inScheme: 'parent_profile_id',
            prefLabel: { en: 'pattern1' },
            definition: { en: 'pattern description' },
            oneOrMore: SOME_TEMPLATE_ID,
        };
        parentProfile = new ProfileVersionModel({
            iri: 'parent_profile_id',
            name: 'profile_name',
            description: 'profile_description',
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
        describe('and the pattern exists on the server', () => {
            let existingPattern;
            let someTemplate;
            let patternComp;
            beforeEach(async () => {
                someTemplate = new TemplateModel({
                    iri: SOME_TEMPLATE_ID,
                    name: 'some_template',
                    description: 'some template description',
                    parentProfile: parentProfile,
                });
                await someTemplate.save();

                patternComp = new PatternComponentModel({
                    componentType: 'template',
                    component: someTemplate,
                });
                await patternComp.save();

                existingPattern = new PatternModel({
                    iri: 'pattern1_id',
                    name: 'pattern1',
                    description: 'pattern description',
                    type: 'oneOrMore',
                    oneOrMore: patternComp,
                    parentProfile: parentProfile,
                    createdBy: user,
                    updatedBy: user,
                });
                await existingPattern.save();
            });

            afterEach(async () => {
                if (patternComp) await patternComp.remove();
                if (someTemplate) await someTemplate.remove();
                await existingPattern.remove();
            });

            describe('and nothing is different', () => {
                test('it should return the model with no changes', async () => {
                    patternModel = await testSuccess(patternDocument, parentProfile);

                    expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                    expect(patternModel.iri).toEqual(existingPattern.iri);
                    expect(patternModel.name).toEqual(existingPattern.name);
                    expect(patternModel.description).toEqual(existingPattern.description);
                    expect(patternModel.type).toEqual(existingPattern.type);
                    expect(patternModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                    expect(patternModel.createdBy._id.toString()).toEqual(user._id.toString());
                });
            });

            describe('and there are differences', () => {
                describe('- adding a property', () => {
                    test('it should return the model with the expected changes.', async () => {
                        patternDocument.prefLabel.new_lang = 'added_prelabel';

                        patternModel = await testSuccess(patternDocument, parentProfile);

                        expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                        expect(patternModel.translations[0].language).toEqual('new_lang');
                        expect(patternModel.translations[0].translationName).toEqual(patternDocument.prefLabel.new_lang);
                    });
                });

                describe('- updating a property', () => {
                    test('it should return the model with the expected changes.', async () => {
                        patternDocument.prefLabel.en = 'updated_prelabel';

                        patternModel = await testSuccess(patternDocument, parentProfile);

                        expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                        expect(patternModel.name).toEqual(patternDocument.prefLabel.en);
                    });
                });

                describe('- removing a property', () => {
                    test('it should return the model with the expected changes.', async () => {
                        existingPattern.translations = {
                            language: 'new_lang',
                            translationName: 'to_be_removed',
                        };
                        await existingPattern.save();

                        patternModel = await testSuccess(patternDocument, parentProfile);

                        expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                        expect(patternModel.translations[0]).toBeFalsy();
                    });
                });
            });
        });

        describe('and the pattern does exist on the server', () => {
            test('it should return a nde model with the correct values.', async () => {
                patternModel = await testSuccess(patternDocument, parentProfile);

                expect(patternModel.iri).toEqual(patternDocument.id);
                expect(patternModel.name).toEqual(patternDocument.prefLabel.en);
                expect(patternModel.description).toEqual(patternDocument.definition.en);
            });
        });
    });
});
