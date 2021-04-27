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
const PatternLayer = require('../../../../controllers/importProfile/PatternLayer')
    .PatternLayer;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

const testSuccess = async (patternDocument, parentProfile) => {
    const patternLayer = new PatternLayer({
        patternDocument: patternDocument,
        parentProfile: parentProfile,
        versionStatus: 'new',
    });
    const patternModel = await patternLayer.scanProfileComponentLayer();
    return patternModel;
};

const testError = async (patternDocument, parentProfile) => {
    const patternLayer = new PatternLayer({
        patternDocument: patternDocument,
        parentProfile: parentProfile,
        versionStatus: 'new',
    });

    let error;
    let PatternModel;
    try {
        PatternModel = await patternLayer.scanProfileComponentLayer();
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

describe('PatternLayer#scanProfileComponentLayer', () => {
    const SOME_PATTERN_ID = 'some_pattern_id';
    const SOME_OTHER_PATTERN_ID = 'some_other_pattern_id';
    const SOME_TEMPLATE_ID = 'some_template_id';
    const SOME_OTHER_TEMPLATE_ID = 'some_other_template_id';

    let patternDocument;
    let patternModel;
    let patternLayer;
    let parentProfile;
    beforeEach(async () => {
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
        });
        await parentProfile.save();
    });

    afterEach(async () => {
        await parentProfile.remove();
    });

    describe('when versionLayer#versionStatus is equal to `new`', () => {
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
                });
                await existingPattern.save();
            });

            afterEach(async () => {
                if (patternComp) await patternComp.remove();
                if (someTemplate) await someTemplate.remove();
                await existingPattern.remove();
            });

            describe('and there are no changes to the pattern', () => {
                test('it should return the same pattern as found on the server with no changes.', async () => {
                    patternModel = await testSuccess(patternDocument, parentProfile);

                    expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                    expect(patternModel.iri).toEqual(existingPattern.iri);
                    expect(patternModel.name).toEqual(existingPattern.name);
                    expect(patternModel.description).toEqual(existingPattern.description);
                    expect(patternModel.type).toEqual(existingPattern.type);
                    expect(patternModel.oneOrMore.component._id.toString()).toEqual(existingPattern.oneOrMore.component._id.toString());
                });
            });

            describe('and there are changes to the pattern', () => {
                describe('and the changes are valid', () => {
                    describe('- adding prefLabel', () => {
                        test('it should return the same moadel as found on the server with the expected changes.', async () => {
                            patternDocument.prefLabel.new_lang = 'new_preflabel';

                            patternModel = await testSuccess(patternDocument, parentProfile);

                            expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                            expect(patternModel.translations[0].language).toEqual('new_lang');
                            expect(patternModel.translations[0].translationName).toEqual(patternDocument.prefLabel.new_lang);
                        });
                    });

                    describe('- adding definition', () => {
                        test('it should return the same moadel as found on the server with the expected changes.', async () => {
                            patternDocument.definition.new_lang = 'new_preflabel';

                            patternModel = await testSuccess(patternDocument, parentProfile);

                            expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                            expect(patternModel.translations[0].language).toEqual('new_lang');
                            expect(patternModel.translations[0].translationDesc).toEqual(patternDocument.definition.new_lang);
                        });
                    });

                    describe('pattern#deprecated', () => {
                        describe('- adding', () => {
                            test('it should return the same moadel as found on the server with the expected changes.', async () => {
                                patternDocument.deprecated = true;

                                patternModel = await testSuccess(patternDocument, parentProfile);

                                expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                                expect(patternModel.isDeprecated).toBeTruthy();
                            });
                        });

                        describe('- updating', () => {
                            test('it should return the same moadel as found on the server with the expected changes.', async () => {
                                existingPattern.isDeprecated = true;
                                await existingPattern.save();

                                patternDocument.deprecated = false;

                                patternModel = await testSuccess(patternDocument, parentProfile);

                                expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                                expect(patternModel.isDeprecated).toBeFalsy();
                            });
                        });

                        describe('- removing', () => {
                            test('it should return the same moadel as found on the server with the expected changes.', async () => {
                                existingPattern.isDeprecated = true;
                                await existingPattern.save();

                                patternModel = await testSuccess(patternDocument, parentProfile);

                                expect(patternModel._id.toString()).toEqual(existingPattern._id.toString());
                                expect(patternModel.isDeprecated).toBeFalsy();
                            });
                        });
                    });
                });

                describe('and changes are not valid', () => {
                    let error;
                    describe('- updating prefLabel', () => {
                        test('it should throw an error.', async () => {
                            patternDocument.prefLabel.en = 'changed_preflabel';

                            error = await testError(patternDocument, parentProfile);

                            expect(error).toMatch(/prefLabel.en cannot be updated on published pattern pattern1_id/);
                        });
                    });

                    describe('- updating definition', () => {
                        test('it should throw an error.', async () => {
                            patternDocument.definition.en = 'changed definition';

                            error = await testError(patternDocument, parentProfile);

                            expect(error).toMatch(/definition.en cannot be updated on published pattern pattern1_id/);
                        });
                    });

                    describe('pattern#primary', () => {
                        describe('- adding', () => {
                            test('it should throw an error.', async () => {
                                patternDocument.primary = true;

                                error = await testError(patternDocument, parentProfile);

                                expect(error).toMatch(/primary cannot be added to published pattern pattern1_id/);
                            });
                        });

                        describe('- updating', () => {
                            test('it should throw an error.', async () => {
                                existingPattern.primary = true;
                                await existingPattern.save();

                                patternDocument.primary = false;

                                error = await testError(patternDocument, parentProfile);

                                expect(error).toMatch(/primary cannot be updated on published pattern pattern1_id/);
                            });
                        });

                        describe('- removing', () => {
                            test('it should throw an error.', async () => {
                                existingPattern.primary = true;
                                await existingPattern.save();

                                error = await testError(patternDocument, parentProfile);

                                expect(error).toMatch(/primary cannot be deleted from published pattern pattern1_id/);
                            });
                        });
                    });

                    describe('pattern#optional (scalar-valued pattern types)', () => {
                        describe('- adding', () => {
                            test('it should throw an error.', async () => {
                                existingPattern.oneOrMore = undefined;
                                await existingPattern.save();

                                delete patternDocument.oneOrMore;
                                patternDocument.zeroOrMore = SOME_TEMPLATE_ID;

                                error = await testError(patternDocument, parentProfile);

                                expect(error).toMatch(/zeroOrMore cannot be added to published pattern pattern1_id/);
                            });
                        });

                        describe('- updating', () => {
                            test('it should throw an error.', async () => {
                                patternDocument.oneOrMore = SOME_OTHER_TEMPLATE_ID;

                                error = await testError(patternDocument, parentProfile);

                                expect(error).toMatch(/oneOrMore cannot be updated on published pattern pattern1_id/);
                            });
                        });

                        describe('- removing', () => {
                            // We can't really test this because this will fail on a missing pattern type value.
                            // test('it should throw an error.', async () => {
                            //     delete patternDocument.oneOrMore;

                            //     error = await testError(patternDocument, parentProfile);

                            //     expect(error).toMatch(/oneOrMore cannot be deleted from published pattern pattern1_id/);
                            // });
                        });
                    });

                    describe('pattern#alternates (array-valued pattern types)', () => {
                        let otherPatternComp;
                        let someOtherTemplate;
                        beforeEach(async () => {
                            delete patternDocument.oneOrMore;

                            someOtherTemplate = new TemplateModel({
                                iri: SOME_OTHER_TEMPLATE_ID,
                                name: 'some_other_template',
                                description: 'some other template description',
                                parentProfile: parentProfile,
                            });
                            await someOtherTemplate.save();

                            otherPatternComp = new PatternComponentModel({
                                componentType: 'template',
                                component: someOtherTemplate,
                            });
                            await otherPatternComp.save();

                            existingPattern.oneOrMore = undefined;
                            existingPattern.type = 'alternates';
                            await existingPattern.save();
                        });

                        afterEach(async () => {
                            await someOtherTemplate.remove();
                            await otherPatternComp.remove();
                        });

                        describe('- adding', () => {
                            test('it should throw an error.', async () => {
                                patternDocument.alternates = [SOME_TEMPLATE_ID];

                                error = await testError(patternDocument, parentProfile);

                                expect(error).toMatch(/alternates cannot be added to published pattern pattern1_id/);
                            });
                        });

                        describe('- updating', () => {
                            describe('- adding an item', () => {
                                test('it should throw an error.', async () => {
                                    existingPattern.alternates = [patternComp];
                                    await existingPattern.save();

                                    patternDocument.alternates = [SOME_TEMPLATE_ID, SOME_OTHER_TEMPLATE_ID];

                                    error = await testError(patternDocument, parentProfile);

                                    expect(error).toMatch(/alternates cannot be added to published pattern pattern1_id/);
                                });
                            });

                            describe('- removing an item', () => {
                                test('it should throw an error.', async () => {
                                    existingPattern.alternates = [patternComp, otherPatternComp];
                                    await existingPattern.save();

                                    patternDocument.alternates = [SOME_TEMPLATE_ID];

                                    error = await testError(patternDocument, parentProfile);

                                    expect(error).toMatch(/alternates cannot be deleted from published pattern pattern1_id/);
                                });
                            });
                        });

                        describe('- removing', () => {
                            // We can't really test this because this will fail on a missing pattern type value.
                            // test('it should throw an error.', async () => {
                            //     existingPattern.alternates = [patternComp];
                            //     await existingPattern.save();

                            //     error = await testError(patternDocument, parentProfile);

                            //     expect(error).toMatch(/alternates cannot be deleted from published pattern pattern1_id/);
                            // });
                        });
                    });
                });
            });
        });

        describe('and the pattern does not exist on the server', () => {
            test('it should return a new pattern with the expected values.', async () => {
                patternModel = await testSuccess(patternDocument, parentProfile);

                expect(patternModel.iri).toEqual(patternDocument.id);
                expect(patternModel.name).toEqual(patternDocument.prefLabel.en);
                expect(patternModel.description).toEqual(patternDocument.definition.en);
                expect(patternModel.type).toEqual('oneOrMore');
            });
        });
    });
});
