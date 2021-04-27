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
const { template } = require('lodash');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const UserModel = require('../../../../ODM/models').user;
const TemplateModel = require('../../../../ODM/models').template;
const ConceptModel = require('../../../../ODM/models').concept;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const TemplateLayer = require('../../../../controllers/importProfile/TemplateLayer')
    .TemplateLayer;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

const testSuccess = async (templateDocument, parentProfile) => {
    const templateLayer = new TemplateLayer({
        templateDocument: templateDocument,
        parentProfile: parentProfile,
        versionStatus: 'new',
    });
    const templateModel = await templateLayer.scanProfileComponentLayer();
    return templateModel;
};

const testError = async (templateDocument, parentProfile) => {
    const templateLayer = new TemplateLayer({
        templateDocument: templateDocument,
        parentProfile: parentProfile,
        versionStatus: 'new',
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

beforeAll(async () => {
    const cnnStr = await mongoServer.getUri();
    await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('TemplateLayer#scanProfileComponentLayer', () => {
    const SOME_CONCEPT_ID = 'some_concept_id';
    const SOME_OTHER_CONCEPT_ID = 'some_other_concept_id';
    const SOME_TEMPLATE_ID = 'some_template_id';
    const SOME_OTHER_TEMPLATE_ID = 'some_other_template_id';
    const TEMPLATE1_ID = 'template1_id';
    const PROFILE_VERSION1_ID = 'parent_profile_id';
    const PROFILE_VERSION2_ID = 'creating_profile_id';


    let templateDocument;
    let templateModel;
    let parentProfile;
    let creatingVersion;
    let user;
    let otherUser;
    beforeEach(async () => {
        user = new UserModel({ email: 'an@email.com' });
        await user.save();

        otherUser = new UserModel({ email: 'another@email.com' });
        await otherUser.save();

        templateDocument = {
            id: TEMPLATE1_ID,
            type: 'StatementTemplate',
            inScheme: PROFILE_VERSION2_ID,
            prefLabel: { en: 'template1' },
            definition: { en: 'template description' },
        };
        parentProfile = new ProfileVersionModel({
            iri: PROFILE_VERSION1_ID,
            name: 'profile_name',
            description: 'profile_description',
            state: 'published',
            createdBy: user,
            updatedBy: user,
        });
        await parentProfile.save();

        creatingVersion = new ProfileVersionModel({
            iri: PROFILE_VERSION2_ID,
            name: 'profile_name',
            description: 'profile_description',
            state: 'draft',
            createdBy: otherUser,
            updatedBy: otherUser,
        });
    });

    afterEach(async () => {
        await parentProfile.remove();
        await creatingVersion.remove();
        await user.remove();
        await otherUser.remove();
    });

    describe('when versionLayer#versionStatus is `new`', () => {
        describe('and the template exists on the server', () => {
            let existingTemplate;
            beforeEach(async () => {
                existingTemplate = new TemplateModel({
                    iri: TEMPLATE1_ID,
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

            describe('and the template is not different from the existing model', () => {
                test('it should return a the existing model with the correct unchanged properties.', async () => {
                    templateModel = await testSuccess(templateDocument, creatingVersion);

                    expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                    expect(templateModel.iri).toEqual(existingTemplate.iri);
                    expect(templateModel.name).toEqual(existingTemplate.name);
                    expect(templateModel.description).toEqual(existingTemplate.description);
                    expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                    expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                });
            });

            describe('and the template is different from the the existing model', () => {
                describe('and the changes are valid', () => {
                    describe('- adding new prefLabel entry', () => {
                        test('it should return the model found on the server with the correct values.', async () => {
                            templateDocument.prefLabel.new_lang = 'new_name';

                            templateModel = await testSuccess(templateDocument, creatingVersion);

                            expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                            expect(templateModel.translations.length).toEqual(1);
                            expect(templateModel.translations[0].language).toEqual('new_lang');
                            expect(templateModel.translations[0].translationName).toEqual('new_name');
                            expect(templateModel.iri).toEqual(existingTemplate.iri);
                            expect(templateModel.name).toEqual(existingTemplate.name);
                            expect(templateModel.description).toEqual(existingTemplate.description);
                            expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                            expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                        });
                    });

                    describe('- adding new definition entry', () => {
                        test('it should return the model found on the server with the correct values.', async () => {
                            templateDocument.definition.new_lang = 'new_description';

                            templateModel = await testSuccess(templateDocument, creatingVersion);

                            expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                            expect(templateModel.translations.length).toEqual(1);
                            expect(templateModel.translations[0].language).toEqual('new_lang');
                            expect(templateModel.translations[0].translationDesc).toEqual('new_description');
                            expect(templateModel.iri).toEqual(existingTemplate.iri);
                            expect(templateModel.name).toEqual(existingTemplate.name);
                            expect(templateModel.description).toEqual(existingTemplate.description);
                            expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                            expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                        });
                    });

                    describe('template#deprecated', () => {
                        describe('- adding', () => {
                            test('it should return the model found on the server with the correct values.', async () => {
                                templateDocument.deprecated = 'true';

                                templateModel = await testSuccess(templateDocument, creatingVersion);

                                expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                                expect(templateModel.isDeprecated).toEqual(true);
                                expect(templateModel.iri).toEqual(existingTemplate.iri);
                                expect(templateModel.name).toEqual(existingTemplate.name);
                                expect(templateModel.description).toEqual(existingTemplate.description);
                                expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                                expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                            });
                        });

                        describe('- updating', () => {
                            test('it should return the model found on the server with the correct values.', async () => {
                                existingTemplate.isDeprecated = true;
                                await existingTemplate.save();

                                templateDocument.deprecated = false;

                                templateModel = await testSuccess(templateDocument, creatingVersion);

                                expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                                expect(templateModel.isDeprecated).toEqual(false);
                                expect(templateModel.iri).toEqual(existingTemplate.iri);
                                expect(templateModel.name).toEqual(existingTemplate.name);
                                expect(templateModel.description).toEqual(existingTemplate.description);
                                expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                                expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                            });
                        });

                        describe('- removing', () => {
                            test('it should return the model found on the server with the correct values.', async () => {
                                existingTemplate.isDeprecated = true;
                                await existingTemplate.save();

                                templateModel = await testSuccess(templateDocument, creatingVersion);

                                expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                                expect(templateModel.isDeprecated).toBeFalsy();
                                expect(templateModel.iri).toEqual(existingTemplate.iri);
                                expect(templateModel.name).toEqual(existingTemplate.name);
                                expect(templateModel.description).toEqual(existingTemplate.description);
                                expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                                expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                            });
                        });
                    });

                    describe('template#rules - deleting an empty array', () => {
                        test('it should return the model found on the server with the correct values.', async () => {
                            existingTemplate.rules = [];
                            await existingTemplate.save();

                            templateModel = await testSuccess(templateDocument, creatingVersion);

                            expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                            expect(templateModel.iri).toEqual(existingTemplate.iri);
                            expect(templateModel.name).toEqual(existingTemplate.name);
                            expect(templateModel.description).toEqual(existingTemplate.description);
                            expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                            expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                        });
                    });

                    describe('template#rules - adding an empty array', () => {
                        test('it should return the model found on the server with the correct values.', async () => {
                            templateDocument.rules = [];

                            templateModel = await testSuccess(templateDocument, creatingVersion);

                            expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                            expect(templateModel.iri).toEqual(existingTemplate.iri);
                            expect(templateModel.name).toEqual(existingTemplate.name);
                            expect(templateModel.description).toEqual(existingTemplate.description);
                            expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                            expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                        });
                    });

                    describe('template#rules.scopeNote', () => {
                        beforeEach(async () => {
                            existingTemplate.rules = [{ location: 'this.is.some.scope.location' }];
                            await existingTemplate.save();

                            templateDocument.rules = [{ location: 'this.is.some.scope.location' }];
                        });

                        describe('- adding', () => {
                            test('it should return the model found on the server with the correct values.', async () => {
                                templateDocument.rules[0].scopeNote = 'this is a adding note.';

                                templateModel = await testSuccess(templateDocument, creatingVersion);

                                expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                                expect(templateModel.rules[0].scopeNote).toEqual(templateDocument.rules[0].scopeNote);
                                expect(templateModel.iri).toEqual(existingTemplate.iri);
                                expect(templateModel.name).toEqual(existingTemplate.name);
                                expect(templateModel.description).toEqual(existingTemplate.description);
                                expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                                expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                            });
                        });

                        describe('- updating', () => {
                            test('it should return the model found on the server with the correct values.', async () => {
                                existingTemplate.rules[0].scopeNote = 'this is a this will be updated note';
                                await existingTemplate.save();

                                templateDocument.rules[0].scopeNote = 'this is a this was updated another note.';

                                templateModel = await testSuccess(templateDocument, creatingVersion);

                                expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                                expect(templateModel.rules[0].scopeNote).toEqual(templateDocument.rules[0].scopeNote);
                                expect(templateModel.iri).toEqual(existingTemplate.iri);
                                expect(templateModel.name).toEqual(existingTemplate.name);
                                expect(templateModel.description).toEqual(existingTemplate.description);
                                expect(templateModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                                expect(templateModel.createdBy._id.toString()).toEqual(user._id.toString());
                            });
                        });

                        describe('- removing', () => {
                            test('it should return the model found on the server with the correct values.', async () => {
                                existingTemplate.rules[0].scopeNote = 'this is a will be deleted note';
                                await existingTemplate.save();

                                templateModel = await testSuccess(templateDocument, creatingVersion);

                                expect(templateModel._id.toString()).toEqual(existingTemplate._id.toString());
                                expect(templateModel.rules[0].scopeNote).toBeFalsy();
                                expect(templateModel.iri).toEqual(existingTemplate.iri);
                                expect(templateModel.name).toEqual(existingTemplate.name);
                                expect(templateModel.description).toEqual(existingTemplate.description);
                            });
                        });
                    });
                });

                describe('and the changes are not valid', () => {
                    let error;
                    describe('template#prefLabel', () => {
                        describe('- updating', () => {
                            test('it should throw an error.', async () => {
                                templateDocument.prefLabel.en = 'new_template_name';

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/prefLabel.en cannot be updated on published template template1_id/);
                            });
                        });

                        // describe('- remove', () => {
                        //     test('it should throw an error.', async () => {
                        //         delete templateDocument.prefLabel.en;

                        //         error = await testError(templateDocument, creatingVersion);

                        //         expect(error).toMatch(/prefLabel.en cannot be deleted from published template template1_id/);
                        //     });
                        // });
                    });

                    describe('template#definition', () => {
                        describe('- updating', () => {
                            test('it should throw an error.', async () => {
                                templateDocument.definition.en = 'changed definition';

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/definition.en cannot be updated on published template template1_id/);
                            });
                        });

                        // describe('- remove', () => {
                        //     test('it should throw an error.', async () => {
                        //         delete templateDocument.definition.en;

                        //         error = await testError(templateDocument, creatingVersion);

                        //         expect(error).toMatch(/definition.en cannot be deleted from published template template1_id/);
                        //     });
                        // });
                    });

                    describe('template#verb (scalar-valued Determining Properties)', () => {
                        let detProp;
                        afterEach(async () => {
                            detProp = await ConceptModel.findOne({ iri: SOME_CONCEPT_ID });
                            if (detProp) await detProp.remove();
                        });

                        describe('- adding', () => {
                            test('it should throw an error.', async () => {
                                templateDocument.verb = SOME_CONCEPT_ID;

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/verb cannot be added to published template template1_id/);
                            });
                        });

                        describe('- updating', () => {
                            test('it should throw an error.', async () => {
                                const detPropModel = new ConceptModel({
                                    iri: SOME_CONCEPT_ID,
                                    name: 'some_concept',
                                    description: 'some concept',
                                    type: 'Verb',
                                    conceptType: 'Verb',
                                });
                                await detPropModel.save();
                                existingTemplate.verb = detPropModel;
                                await existingTemplate.save();

                                templateDocument.verb = SOME_OTHER_CONCEPT_ID;

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/verb cannot be updated on published template template1_id/);
                            });
                        });

                        describe('- removing', () => {
                            test('it should throw an error.', async () => {
                                const detPropModel = new ConceptModel({
                                    iri: SOME_CONCEPT_ID,
                                    name: 'some_concept',
                                    description: 'some concept',
                                    type: 'Verb',
                                    conceptType: 'Verb',
                                });
                                await detPropModel.save();
                                existingTemplate.verb = detPropModel;
                                await existingTemplate.save();

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/verb cannot be deleted from published template template1_id/);
                            });
                        });
                    });

                    describe('template#contextGroupingActivityType (array-valued Determining Properties)', () => {
                        let detProp;
                        let otherDetProp;
                        afterEach(async () => {
                            detProp = await ConceptModel.findOne({ iri: SOME_CONCEPT_ID });
                            if (detProp) await detProp.remove();

                            otherDetProp = await ConceptModel.findOne({ iri: SOME_OTHER_CONCEPT_ID });
                            if (otherDetProp) await otherDetProp.remove();
                        });

                        describe('- adding', () => {
                            test('it should throw an error.', async () => {
                                templateDocument.contextGroupingActivityType = [SOME_CONCEPT_ID];

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/contextGroupingActivityType cannot be added to published template template1_id/);
                            });
                        });

                        describe('- updating', () => {
                            beforeEach(async () => {
                                const detPropModel = new ConceptModel({
                                    iri: SOME_CONCEPT_ID,
                                    name: 'some_concept',
                                    description: 'some concept',
                                    type: 'ActivityType',
                                    conceptType: 'ActivityType',
                                });
                                await detPropModel.save();
                                existingTemplate.contextGroupingActivityType = [detPropModel];
                                await existingTemplate.save();
                            });

                            describe('- adding item', () => {
                                test('it should throw an error.', async () => {
                                    templateDocument.contextGroupingActivityType = [SOME_CONCEPT_ID, SOME_OTHER_CONCEPT_ID];

                                    error = await testError(templateDocument, creatingVersion);

                                    expect(error).toMatch(/contextGroupingActivityType cannot be added to published template template1_id/);
                                });
                            });

                            describe('- removing item', () => {
                                test('it should throw an error.', async () => {
                                    const otherDetPropModel = new ConceptModel({
                                        iri: SOME_OTHER_CONCEPT_ID,
                                        name: 'some_concept',
                                        description: 'some concept',
                                        type: 'ActivityType',
                                        conceptType: 'ActivityType',
                                    });
                                    await otherDetPropModel.save();
                                    existingTemplate.contextGroupingActivityType.push(otherDetPropModel);
                                    await existingTemplate.save();

                                    templateDocument.contextGroupingActivityType = [SOME_CONCEPT_ID];

                                    error = await testError(templateDocument, creatingVersion);

                                    expect(error).toMatch(/contextGroupingActivityType cannot be deleted from published template template1_id/);
                                });
                            });
                        });

                        describe('- removing', () => {
                            test('it should throw an error.', async () => {
                                const detPropModel = new ConceptModel({
                                    iri: SOME_CONCEPT_ID,
                                    name: 'some_concept',
                                    description: 'some concept',
                                    type: 'ActivityType',
                                    conceptType: 'ActivityType',
                                });
                                await detPropModel.save();
                                existingTemplate.contextGroupingActivityType = [detPropModel];
                                await existingTemplate.save();

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/contextGroupingActivityType cannot be deleted from published template template1_id/);
                            });
                        });
                    });

                    describe('template#objectStatementRefTemplate (array-valued template properties)', () => {
                        let templateProp;
                        let otherTemplateProp;
                        afterEach(async () => {
                            templateProp = await TemplateModel.findOne({ iri: SOME_TEMPLATE_ID });
                            if (templateProp) await templateProp.remove();

                            otherTemplateProp = await TemplateModel.findOne({ iri: SOME_OTHER_TEMPLATE_ID });
                            if (otherTemplateProp) await otherTemplateProp.remove();
                        });

                        describe('- adding', () => {
                            test('it should throw an error.', async () => {
                                templateDocument.objectStatementRefTemplate = [SOME_TEMPLATE_ID];

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/objectStatementRefTemplate cannot be added to published template template1_id/);
                            });
                        });

                        describe('- updating', () => {
                            beforeEach(async () => {
                                const templatePropModel = new TemplateModel({
                                    iri: SOME_TEMPLATE_ID,
                                    name: 'some_template',
                                    description: 'some template',
                                });
                                await templatePropModel.save();
                                existingTemplate.objectStatementRefTemplate = [templatePropModel];
                                await existingTemplate.save();
                            });

                            describe('- adding item', () => {
                                test('it should throw an error.', async () => {
                                    templateDocument.objectStatementRefTemplate = [SOME_TEMPLATE_ID, SOME_OTHER_TEMPLATE_ID];

                                    error = await testError(templateDocument, creatingVersion);

                                    expect(error).toMatch(/objectStatementRefTemplate cannot be added to published template template1_id/);
                                });
                            });

                            describe('- removing item', () => {
                                test('it should throw an error.', async () => {
                                    const otherTemplatePropModel = new TemplateModel({
                                        iri: SOME_OTHER_TEMPLATE_ID,
                                        name: 'some_template',
                                        description: 'some template',
                                    });
                                    await otherTemplatePropModel.save();
                                    existingTemplate.objectStatementRefTemplate.push(otherTemplatePropModel);
                                    await existingTemplate.save();

                                    templateDocument.objectStatementRefTemplate = [SOME_TEMPLATE_ID];

                                    error = await testError(templateDocument, creatingVersion);

                                    expect(error).toMatch(/objectStatementRefTemplate cannot be deleted from published template template1_id/);
                                });
                            });
                        });

                        describe('- removing', () => {
                            test('it should throw an error.', async () => {
                                const templatePropModel = new TemplateModel({
                                    iri: SOME_TEMPLATE_ID,
                                    name: 'some_template',
                                    description: 'some template',
                                });
                                await templatePropModel.save();
                                existingTemplate.objectStatementRefTemplate = [templatePropModel];
                                await existingTemplate.save();

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/objectStatementRefTemplate cannot be deleted from published template template1_id/);
                            });
                        });
                    });

                    describe('template#rules', () => {
                        describe('- adding', () => {
                            test('it should throw an error.', async () => {
                                templateDocument.rules = [{ location: 'some.location' }];

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/rules cannot be added to published template template1_id/);
                            });
                        });

                        describe('- updating', () => {
                            beforeAll(async () => {
                                existingTemplate.rules = [{ location: 'some.location' }];
                                await existingTemplate.update();
                            });

                            describe('- adding item', () => {
                                test('it should throw an error.', async () => {
                                    templateDocument.rules = [
                                        { location: 'some.location' },
                                        { location: 'some.other.location' },
                                    ];

                                    error = await testError(templateDocument, creatingVersion);

                                    expect(error).toMatch(/rules cannot be added to published template template1_id/);
                                });
                            });

                            describe('- removing item', () => {
                                test('it should throw an error.', async () => {
                                    existingTemplate.rules.push({ location: 'some.other.location' });
                                    await existingTemplate.save();

                                    templateDocument.rules = [{ location: 'some.location' }];

                                    error = await testError(templateDocument, creatingVersion);

                                    expect(error).toMatch(/rules cannot be deleted from published template template1_id/);
                                });
                            });
                        });

                        describe('- removing', () => {
                            test('it should throw an error.', async () => {
                                existingTemplate.rules = { location: 'some.location' };
                                await existingTemplate.save();

                                error = await testError(templateDocument, creatingVersion);

                                expect(error).toMatch(/rules cannot be deleted from published template template1_id/);
                            });
                        });
                    });
                });
            });
        });

        describe('and the template does not exist on the server', () => {
            test('it should return a new model with the correct values.', async () => {
                templateModel = await testSuccess(templateDocument, creatingVersion);

                expect(templateModel.iri).toEqual(templateDocument.id);
                expect(templateModel.name).toEqual(templateDocument.prefLabel.en);
                expect(templateModel.description).toEqual(templateDocument.definition.en);
            });
        });
    });
});
