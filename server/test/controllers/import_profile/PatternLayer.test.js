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
const { fakeServerWithClock } = require('sinon');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const TemplateModel = require('../../../ODM/models').template;
const PatternModel = require('../../../ODM/models').pattern;
const ProfileVersionModel = require('../../../ODM/models').profileVersion;
const PatternLayer = require('../../../controllers/importProfile/PatternLayer')
    .PatternLayer;

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

// So for some reason, pattern models that are assigned to patterns are becoming just ObjectIDs on assignment.
// We haven't figured out why yet so for now will just test pattern components by model id.

describe('for prefLabel and definition tests, see ConceptLayerFactory.test', () => {});
describe('PatternLayer#scanscanProfileComponentLayer', () => {
    describe('Pattern type', () => {
        let patternDocument;
        beforeEach(() => {
            patternDocument = {
                id: 'pattern1_id',
                prefLabel: { en: 'test_name' },
                definition: { en: 'test_description' },
            };
        });

        describe('if there are not at least one of `alternates`, `optional`, `oneOrMore`, `sequence`, and `zeroOrMore`', () => {
            test('it should throw an error.', async () => {
                let error;
                try {
                    const patternLayer = new PatternLayer({
                        patternDocument: patternDocument,
                    });
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/Pattern pattern1_id must have at least one of alternates, optional, oneOrMore, sequence, and zeroOrMore/);
            });
        });

        describe('if there are more than one of `alternates`, `optional`, `oneOrMore`, `sequence`, and `zeroOrMore`', () => {
            test('it should throw an error.', async () => {
                patternDocument.zeroOrMore = 'pattern2_id';
                patternDocument.alternates = ['pattern3_id'];

                let error;
                try {
                    const patternLayer = new PatternLayer({
                        patternDocument: patternDocument,
                    });
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/Pattern pattern1_id must not have more than one of alternates, optional, oneOrMore, sequence, and zeroOrMore/);
            });
        });

        describe('if there is exactly one of `alternates`, `optional`, `oneOrMore`, `sequence`, and `zeroOrMore`', () => {
            test('it should return that type.', async () => {
                patternDocument.zeroOrMore = 'pattern2_id';

                const patternLayer = new PatternLayer({
                    patternDocument: patternDocument,
                });
                const patternModel = await patternLayer.scanProfileComponentLayer();

                expect(patternModel.type).toEqual('zeroOrMore');
            });
        });
    });

    describe('when the pattern exists on the server', () => {
        let existingPattern;
        beforeEach(async () => {
            existingPattern = new PatternModel({
                iri: 'existing_pattern_id',
                name: 'existing_pattern_name',
                description: 'existing_pattern_description',
            });
            await existingPattern.save();
        });

        afterEach(async () => {
            await existingPattern.remove();
        });

        test('it should throw an error.', async () => {
            const patternLayer = new PatternLayer({
                patternDocument: {
                    id: 'existing_pattern_id',
                    prefLabel: { en: 'existing_pattern_name' },
                    definition: { en: 'existing_pattern_description' },
                    zeroOrMore: 'pattern2_id',
                },
            });

            let error;
            try {
                const patternModel = await patternLayer.scanProfileComponentLayer();
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Pattern existing_pattern_id already exists/);
        });
    });

    describe('when the pattern does not exist on the server', () => {
        test('it should return a pattern model with the correct values', async () => {
            const patternLayer = new PatternLayer({
                patternDocument: {
                    id: 'pattern_id',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                    deprecated: 'true',
                    primary: 'true',
                    zeroOrMore: 'pattern2_id',
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'parent_profile_name',
                    description: 'parent_profile_description',
                }),
            });
            const patternModel = await patternLayer.scanProfileComponentLayer();

            expect(patternModel.iri).toEqual('pattern_id');
            expect(patternModel.name).toEqual('test_name');
            expect(patternModel.description).toEqual('test_description');
            expect(patternModel.isDeprecated).toBeTruthy();
            expect(patternModel.primary).toBeTruthy();
            expect(patternModel.parentProfile.iri).toEqual('parent_profile_id');
            expect(patternModel.parentProfile.name).toEqual('parent_profile_name');
            expect(patternModel.parentProfile.description).toEqual('parent_profile_description');
        });
    });
});

describe('PatternLayer#scanSubcomponentLayer', () => {
    let patternDocument;
    let profilePatterns;
    let profileTemplates;
    beforeEach(() => {
        patternDocument = {
            id: 'pattern1_id',
            prefLabel: { en: 'pattern_1' },
            definition: { en: 'test_description' },
        };

        profileTemplates = [
            new TemplateModel({ iri: 'template1_id', name: 'template_1' }),
            new TemplateModel({ iri: 'template2_id', name: 'template_2' }),
            new TemplateModel({ iri: 'template3_id', name: 'template_3' }),
        ];

        profilePatterns = [
            new PatternModel({ iri: 'pattern1_id', name: 'pattern_1' }),
            new PatternModel({
                iri: 'pattern2_id',
                name: 'pattern_2',
                type: 'zeroOrMore',
            }),
            new PatternModel({
                iri: 'pattern3_id',
                name: 'pattern_3',
                type: 'optional',
            }),
            new PatternModel({
                iri: 'pattern4_id',
                name: 'pattern_4',
                type: 'sequence',
            }),
        ];
    });

    describe('if this pattern is a member of alternates, optional, oneOrMore, sequence, or zeroOrMore', () => {
        test('it should throw an error.', async () => {
            patternDocument.zeroOrMore = 'pattern1_id';
            const patternLayer = new PatternLayer({
                patternDocument: patternDocument,
            });

            let error;
            try {
                const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);
                console.log(patternModel);
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Pattern pattern1_id cannot be a member of its own zeroOrMore property/);
        });
    });

    describe('if the members are not found on the server or in this profile version', () => {
        test('it should throw an error.', async () => {
            patternDocument.sequence = ['non_existant_template_id'];
            const patternLayer = new PatternLayer({ patternDocument: patternDocument });

            let error;
            try {
                const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/non_existant_template_id cannot be a sequence member of pattern1_id because it is not on the server or in this profile version/);
        });
    });

    describe('PatternTypes', () => {
        describe('Sequence', () => {
            describe('if there is only one member', () => {
                describe('and this pattern is not a primary', () => {
                    test('it should throw an error.', async () => {
                        patternDocument.sequence = ['template1_id'];
                        const patternLayer = new PatternLayer({ patternDocument: patternDocument });

                        let error;
                        try {
                            const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/The sequence property in pattern1_id cannot have only one member because it is not a primary pattern/);
                    });
                });

                describe('and this pattern is a primary', () => {
                    beforeEach(() => { patternDocument.primary = 'true'; });

                    describe('and the member is a pattern', () => {
                        test('it should throw an error.', async () => {
                            patternDocument.sequence = ['pattern2_id'];
                            const patternLayer = new PatternLayer({ patternDocument: patternDocument });

                            let error;
                            try {
                                const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/The sequence property in pattern1_id cannot have only one member if that member is not a statement template/);
                        });
                    });

                    describe('and the member is a template', () => {
                        describe('and that member is found on the server', () => {
                            let existingTemplate;
                            beforeEach(async () => {
                                existingTemplate = new TemplateModel({ iri: 'existing_template_id', name: 'existing_template_name' });
                                await existingTemplate.save();
                            });

                            afterEach(async () => {
                                await existingTemplate.remove();
                            });

                            test('it should return a pattern model with correct values.', async () => {
                                patternDocument.sequence = ['existing_template_id'];
                                const patternLayer = new PatternLayer({
                                    patternDocument: patternDocument,
                                });
                                const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);

                                expect(patternModel.sequence[0].componentType).toEqual('template');
                                expect(patternModel.sequence[0].component.iri).toEqual('existing_template_id');
                                expect(patternModel.sequence[0].component.name).toEqual('existing_template_name');
                            });
                        });

                        describe('and that member is found in this profile version', () => {
                            test('it should return a pattern model with correct values.', async () => {
                                patternDocument.sequence = ['template1_id'];
                                const patternLayer = new PatternLayer({
                                    patternDocument: patternDocument,
                                });
                                const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);

                                expect(patternModel.sequence[0].componentType).toEqual('template');
                                expect(patternModel.sequence[0].component.iri).toEqual('template1_id');
                                expect(patternModel.sequence[0].component.name).toEqual('template_1');
                                expect(patternModel.type).toEqual('sequence');
                            });
                        });
                    });
                });
            });

            describe('if there is more than one member', () => {
                describe('and all members are found on the server', () => {
                    let existingTemplate;
                    let existingPattern;
                    beforeEach(async () => {
                        existingTemplate = new TemplateModel({ iri: 'existing_template_id', name: 'existing_template_name' });
                        existingPattern = new PatternModel({ iri: 'existing_pattern_id', name: 'existing_pattern_name' });
                        await existingTemplate.save();
                        await existingPattern.save();
                    });

                    afterEach(async () => {
                        await existingTemplate.remove();
                        await existingPattern.remove();
                    });
                    test('it should return a pattern model with correct values.', async () => {
                        patternDocument.sequence = ['existing_template_id', 'existing_pattern_id'];
                        const patternLayer = new PatternLayer({
                            patternDocument: patternDocument,
                        });
                        const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);
                        await patternModel.execPopulate('sequence.component');

                        expect([...patternModel.sequence.map(s => s.componentType).sort()]).toStrictEqual(['pattern', 'template']);
                        expect([...patternModel.sequence.map(s => s.component._id).sort()]).toStrictEqual([existingTemplate._id, existingPattern._id]);
                        expect(patternModel.type).toEqual('sequence');

                        // expect([...patternModel.sequence.map(s => s.component.name).sort()]).toStrictEqual(['existing_pattern_name', 'existing_template_name']);
                    });
                });

                describe('and all members are found in this profile version', () => {
                    test('it should return a pattern model with correct values.', async () => {
                        patternDocument.sequence = ['pattern3_id', 'pattern2_id'];
                        const patternLayer = new PatternLayer({
                            patternDocument: patternDocument,
                        });
                        const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);

                        expect([...patternModel.sequence.map(s => s.componentType).sort()]).toStrictEqual(['pattern', 'pattern']);
                        expect([...patternModel.sequence.map(s => s.component._id).sort()]).toStrictEqual([profilePatterns[1]._id, profilePatterns[2]._id]);
                        expect(patternModel.type).toEqual('sequence');

                        // expect([...patternModel.sequence.map(s => s.component.name).sort()]).toStrictEqual(['pattern_2', 'pattern_3']);
                    });
                });
            });
        });

        describe('Alternates', () => {
            describe('if there is only one member', () => {
                test('it should throw an error.', async () => {
                    patternDocument.alternates = ['pattern2_id'];
                    const patternLayer = new PatternLayer({ patternDocument: patternDocument });

                    let error;
                    try {
                        const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/The alternates property of pattern1_id cannot have only one member/);
                });
            });

            describe('if there is more than one member', () => {
                describe('if one of the members is an optional pattern', () => {
                    test('it should throw an error.', async () => {
                        patternDocument.alternates = ['pattern3_id', 'template1_id'];
                        const patternLayer = new PatternLayer({ patternDocument: patternDocument });

                        let error;
                        try {
                            const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/The alternates property of pattern1_id cannot have pattern members that are type optional or zeroOrMore/);
                    });
                });

                describe('if one of the members is a zeroOrMore pattern', () => {
                    test('it should throw an error.', async () => {
                        patternDocument.alternates = ['pattern2_id', 'template1_id'];
                        const patternLayer = new PatternLayer({ patternDocument: patternDocument });

                        let error;
                        try {
                            const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/The alternates property of pattern1_id cannot have pattern members that are type optional or zeroOrMore/);
                    });
                });

                describe('if none of the members are optional or zeroOrMore types', () => {
                    describe('and the members are found on the server or in this profile version', () => {
                        test('it should return a pattern model with correct values.', async () => {
                            patternDocument.alternates = ['pattern4_id', 'template1_id'];
                            const patternLayer = new PatternLayer({
                                patternDocument: patternDocument,
                            });
                            const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);

                            expect([...patternModel.alternates.map(s => s.componentType).sort()]).toStrictEqual(['pattern', 'template']);
                            expect([...patternModel.alternates.map(s => s.component._id).sort()]).toStrictEqual([profileTemplates[0]._id, profilePatterns[3]._id]);
                            expect(patternModel.type).toEqual('alternates');

                            // expect([...patternModel.sequence.map(s => s.component.name).sort()]).toStrictEqual(['pattern_2', 'pattern_3']);
                        });
                    });
                });
            });
        });

        describe('Optional, zeroOrMore, and oneOrMore', () => {
            test('it should return a pattern model with the correct values', async () => {
                patternDocument.zeroOrMore = 'pattern4_id';
                const patternLayer = new PatternLayer({
                    patternDocument: patternDocument,
                });
                const patternModel = await patternLayer.scanSubcomponentLayer(profileTemplates, profilePatterns);

                expect(patternModel.zeroOrMore.componentType).toEqual('pattern');
                expect(patternModel.zeroOrMore.component._id).toEqual(profilePatterns[3]._id);
                expect(patternModel.type).toEqual('zeroOrMore');
            });
        });
    });
});
