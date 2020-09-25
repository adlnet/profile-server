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

const UserModel = require('../../../../ODM/models').user;
const TemplateModel = require('../../../../ODM/models').template;
const ConceptModel = require('../../../../ODM/models').concept;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const TemplateLayer = require('../../../../controllers/importProfile/TemplateLayer')
    .TemplateLayer;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

let user;
beforeAll(async () => {
    const cnnStr = await mongoServer.getUri();
    await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });

    user = new UserModel({ email: 'an@email.com' });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});


describe('for prefLabel and definition tests, see ConceptLayerFactory.test', () => {});
describe('TemplateLayer#scanProfileComponentLayer', () => {
    describe('when all values are valid', () => {
        test('it should return a templateModel with the correct values,', async () => {
            const templateDocument = {
                id: 'template1_id',
                prefLabel: { en: 'test_name' },
                definition: { en: 'test_description' },
                deprecated: 'true',
            };
            const templateLayer = new TemplateLayer({
                templateDocument: templateDocument,
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                    createdBy: user,
                    updatedBy: user,
                }),
            });
            const templateModel = await templateLayer.scanProfileComponentLayer();

            expect(templateModel.iri).toEqual(templateDocument.id);
            expect(templateModel.name).toEqual(templateDocument.prefLabel.en);
            expect(templateModel.description).toEqual(templateDocument.definition.en);
            expect(templateModel.isDeprecated).toBeTruthy();
            expect(templateModel.parentProfile.iri).toEqual('parent_profile_id');
            expect(templateModel.parentProfile.name).toEqual('profile_name');
            expect(templateModel.parentProfile.description).toEqual('profile_description');
        });
    });

    describe('when the template exists on the server', () => {
        let existingTemplate;

        afterEach(async () => {
            await existingTemplate.remove();
        });

        describe('and that that existing template is a not a parentless template', () => {
            beforeEach(async () => {
                existingTemplate = new TemplateModel({
                    iri: 'existing_template_id',
                    name: 'test_name',
                    description: 'test_description',
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                        createdBy: user,
                        updatedBy: user,
                    }),
                });
                await existingTemplate.save();
            });

            test('it should throw an error.,', async () => {
                const templateDocument = {
                    id: 'existing_template_id',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                    deprecated: 'true',
                };
                const templateLayer = new TemplateLayer({
                    templateDocument: templateDocument,
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                        createdBy: user,
                        updatedBy: user,
                    }),
                });

                let templateModel;
                let error;
                try {
                    templateModel = await templateLayer.scanProfileComponentLayer();
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/Template existing_template_id already exists/);
            });
        });

        describe('and that existing concept is a parentless template', () => {
            beforeEach(async () => {
                existingTemplate = new TemplateModel({ iri: 'existing_template_id' });
                await existingTemplate.save();
            });

            test('it should return a template model with the correct values and an id equal to the parentless component.', async () => {
                const templateDocument = {
                    id: 'existing_template_id',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                    deprecated: 'true',
                };
                const templateLayer = new TemplateLayer({
                    templateDocument: templateDocument,
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                        createdBy: user,
                        updatedBy: user,
                    }),
                });

                const templateModel = await templateLayer.scanProfileComponentLayer();

                expect(templateModel.equals(existingTemplate)).toBeTruthy();
                expect(templateModel.name).toEqual('test_name');
                expect(templateModel.description).toEqual('test_description');
                expect(templateModel.isDeprecated).toBeTruthy();
            });
        });
    });
});

describe('TemplateLayer#scanSubcomponentLayer', () => {
    describe('Determining Properties', () => {
        let templateDocument;
        let profileConcepts;
        let profileTemplates;
        beforeEach(() => {
            templateDocument = {
                id: 'template1_id',
                prefLabel: { en: 'test_name' },
                definition: { en: 'test_description' },
            };

            profileConcepts = [
                new ConceptModel({
                    iri: 'concept1_id',
                    name: 'concept_1',
                    conceptType: 'Verb',
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                    }),
                }),
                new ConceptModel({
                    iri: 'concept2_id',
                    name: 'concept_2',
                    conceptType: 'ActivityType',
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                    }),
                }),
                new ConceptModel({
                    iri: 'concept25_id',
                    name: 'concept_25',
                    conceptType: 'ActivityType',
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                    }),
                }),
                new ConceptModel({
                    iri: 'concept3_id',
                    name: 'concept_3',
                    conceptType: 'AttachmentUsageType',
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                    }),
                }),
                new ConceptModel({
                    iri: 'concept35_id',
                    name: 'concept_35',
                    conceptType: 'AttachmentUsageType',
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                    }),
                }),
            ];

            profileTemplates = [];
        });

        describe('DeterminingProperties#Verb', () => {
            describe('if the concept exists in profile version', () => {
                describe('and the concept is a verb type', () => {
                    test('it should return a templateModel with the correct values.', async () => {
                        templateDocument.verb = 'concept1_id';
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });
                        const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                        expect(templateModel.verb.iri).toEqual('concept1_id');
                        expect(templateModel.verb.name).toEqual('concept_1');
                        expect(templateModel.verb.conceptType).toEqual('Verb');
                    });
                });

                describe('and the concept is not a verb type', () => {
                    test('it should throw an error.', async () => {
                        templateDocument.verb = 'concept2_id';
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        let error;
                        try {
                            const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept concept2_id cannot be the verb for this template because it is type ActivityType/);
                    });
                });
            });

            describe('if the concept exists on the server', () => {
                let existingConcept;

                describe('and the concept is a verb type', () => {
                    beforeEach(async () => {
                        existingConcept = new ConceptModel({
                            iri: 'existing_concept',
                            name: 'test_name',
                            conceptType: 'Verb',
                        });

                        await existingConcept.save();
                    });

                    afterEach(async () => {
                        await existingConcept.remove();
                    });

                    test('it should return a templateModel with the correct values.', async () => {
                        templateDocument.verb = 'existing_concept';
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });
                        const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                        expect(templateModel.verb.iri).toEqual('existing_concept');
                        expect(templateModel.verb.name).toEqual('test_name');
                        expect(templateModel.verb.conceptType).toEqual('Verb');
                    });
                });

                describe('and the concept is not a verb type', () => {
                    beforeEach(async () => {
                        existingConcept = new ConceptModel({
                            iri: 'existing_concept',
                            name: 'test_name',
                            conceptType: 'ActivityType',
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                            }),
                        });

                        await existingConcept.save();
                    });

                    afterEach(async () => {
                        await existingConcept.remove();
                    });

                    test('it should throw an error.', async () => {
                        templateDocument.verb = 'existing_concept';
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        let error;
                        try {
                            const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept existing_concept cannot be the verb for this template because it is type ActivityType/);
                    });
                });
            });

            describe('if the concept does not exist in profile version or on the server', () => {
                test('it should return a template model with the verb as a parentless concept saved on the server.', async () => {
                    templateDocument.verb = 'non-existent_concept';
                    const templateLayer = new TemplateLayer({
                        templateDocument: templateDocument,
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'parent_profile_name',
                            description: 'parent_profile_description',
                            createdBy: user,
                            updatedBy: user,
                        }),
                    });

                    const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                    const parentlessConcept = await ConceptModel.findOne({ iri: 'non-existent_concept' });

                    expect(parentlessConcept.iri).toEqual('non-existent_concept');
                    expect(templateModel.verb.iri).toEqual('non-existent_concept');
                    expect(templateModel.verb.id).toEqual(parentlessConcept.id);

                    await parentlessConcept.remove();
                });

                describe('and it is also the objectActivityType for this template', () => {
                    let templateLayer;
                    let templateModel;
                    let parentlessConcept;
                    beforeEach(async () => {
                        templateDocument.verb = 'non-existent_concept';
                        templateDocument.objectActivityType = 'non-existent_concept';
                        templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                        parentlessConcept = await ConceptModel.findOne({ iri: 'non-existent_concept' });
                    });

                    afterEach(async () => {
                        await parentlessConcept.remove();
                    });

                    test('it should retrun a template model with the verb as a parentless concept saved on the server.', () => {
                        expect(parentlessConcept.iri).toEqual('non-existent_concept');
                        expect(templateModel.verb.iri).toEqual('non-existent_concept');
                        expect(templateModel.verb.id).toEqual(parentlessConcept.id);
                    });

                    test('it should retrun a template model with the objectActivityType as a parentless concept saved on the server.', () => {
                        expect(parentlessConcept.iri).toEqual('non-existent_concept');
                        expect(templateModel.objectActivityType.iri).toEqual('non-existent_concept');
                        expect(templateModel.objectActivityType.id).toEqual(parentlessConcept.id);
                    });

                    test('it should have the exact same concept document as the verb and the objectActivityType.', () => {
                        expect(templateModel.verb._id.toString()).toEqual(templateModel.objectActivityType._id.toString());
                    });
                });

                describe('and it is also in another template in this profile', () => {
                    let templateLayer;
                    let parentlessConcept;
                    let otherTemplateDocument;
                    let otherTemplateLayer;
                    let templateModels;

                    beforeEach(async () => {
                        templateDocument.verb = 'non-existent_concept';
                        templateDocument.objectActivityType = 'non-existent_concept';
                        templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        otherTemplateDocument = {
                            id: 'template2_id',
                            prefLabel: { en: 'test_name_2' },
                            definition: { en: 'test_description_2' },
                            verb: 'non-existent_concept',
                        };
                        otherTemplateLayer = new TemplateLayer({
                            templateDocument: otherTemplateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        // templateModels = await Promise.all([templateLayer, otherTemplateLayer].map(
                        //     async layer => layer.scanSubcomponentLayer(profileConcepts, profileTemplates),
                        // ))
                        templateModels = [];
                        for (const layer of [templateLayer, otherTemplateLayer]) {
                            const model = await layer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                            templateModels.push(model);
                        }
                        parentlessConcept = await ConceptModel.findOne({ iri: 'non-existent_concept' });
                    });

                    test('it should return an array of templateModels where all instances of the concept model are the exact same parentless model.', () => {
                        expect(templateModels[0].verb._id.toString()).toEqual(templateModels[1].verb._id.toString());
                    });
                });
            });
        });

        describe('DeterminingProperties#ObjectActivityType', () => {
            describe('if the concept exists in profile version', () => {
                describe('and the concept is a activityType type', () => {
                    test('it should return a templateModel with the correct values.', async () => {
                        templateDocument.objectActivityType = 'concept2_id';
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });
                        const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                        expect(templateModel.objectActivityType.iri).toEqual('concept2_id');
                        expect(templateModel.objectActivityType.name).toEqual('concept_2');
                        expect(templateModel.objectActivityType.conceptType).toEqual('ActivityType');
                    });
                });

                describe('and the concept is not a activityType type', () => {
                    test('it should throw an error.', async () => {
                        templateDocument.objectActivityType = 'concept1_id';
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        let error;
                        try {
                            const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept concept1_id cannot be the objectActivityType for this template because it is type Verb/);
                    });
                });
            });

            describe('if the concept exists on the server', () => {
                let existingConcept;

                describe('and the concept is an activityType type', () => {
                    beforeEach(async () => {
                        existingConcept = new ConceptModel({
                            iri: 'existing_concept',
                            name: 'test_name',
                            conceptType: 'ActivityType',
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                            }),
                        });

                        await existingConcept.save();
                    });

                    afterEach(async () => {
                        await existingConcept.remove();
                    });

                    test('it should return a templateModel with the correct values.', async () => {
                        templateDocument.objectActivityType = 'existing_concept';
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });
                        const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                        expect(templateModel.objectActivityType.iri).toEqual('existing_concept');
                        expect(templateModel.objectActivityType.name).toEqual('test_name');
                        expect(templateModel.objectActivityType.conceptType).toEqual('ActivityType');
                    });
                });

                describe('and the concept is not an activityType type', () => {
                    beforeEach(async () => {
                        existingConcept = new ConceptModel({
                            iri: 'existing_concept',
                            name: 'test_name',
                            conceptType: 'Verb',
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                            }),
                        });

                        await existingConcept.save();
                    });

                    afterEach(async () => {
                        await existingConcept.remove();
                    });

                    test('it should throw an error.', async () => {
                        templateDocument.objectActivityType = 'existing_concept';
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        let error;
                        try {
                            const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept existing_concept cannot be the objectActivityType for this template because it is type Verb/);
                    });
                });
            });

            describe('if the concept does not exist in profile version or on the server', () => {
                test('it should return a template model with the objectActivityType as a parentless concept saved on the server.', async () => {
                    templateDocument.objectActivityType = 'non-existent_concept';
                    const templateLayer = new TemplateLayer({
                        templateDocument: templateDocument,
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'parent_profile_name',
                            description: 'parent_profile_description',
                            createdBy: user,
                            updatedBy: user,
                        }),
                    });

                    const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                    const parentlessConcept = await ConceptModel.findOne({ iri: 'non-existent_concept' });

                    expect(parentlessConcept.iri).toEqual('non-existent_concept');
                    expect(templateModel.objectActivityType.iri).toEqual('non-existent_concept');
                    expect(templateModel.objectActivityType.id).toEqual(parentlessConcept.id);

                    await parentlessConcept.remove();
                });
            });
        });

        describe('DeterminingProperties#ContextGroupingActivityType', () => {
            describe('if the concepts exist in profile version', () => {
                describe('and the concepts are activityType type', () => {
                    test('it should return a templateModel with the correct values.', async () => {
                        templateDocument.contextGroupingActivityType = ['concept2_id', 'concept25_id'];
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });
                        const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                        expect([...templateModel.contextGroupingActivityType.map(c => c.iri)]).toStrictEqual(['concept2_id', 'concept25_id']);
                        expect([...templateModel.contextGroupingActivityType.map(c => c.name)]).toEqual(['concept_2', 'concept_25']);
                        expect(templateModel.contextGroupingActivityType.map(c => c.conceptType).every(c => c === 'ActivityType')).toBeTruthy();
                    });
                });

                describe('and the concept is not a activityType type', () => {
                    test('it should throw an error.', async () => {
                        templateDocument.contextGroupingActivityType = ['concept1_id'];
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        let error;
                        try {
                            const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept concept1_id cannot be the contextGroupingActivityType for this template because it is type Verb/);
                    });
                });
            });

            describe('if the concepts exist on the server', () => {
                let existingConcept;
                let otherExistingConcept;

                describe('and the concepts are activityType type', () => {
                    beforeEach(async () => {
                        existingConcept = new ConceptModel({
                            iri: 'existing_concept',
                            name: 'test_name',
                            conceptType: 'ActivityType',
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                            }),
                        });

                        otherExistingConcept = new ConceptModel({
                            iri: 'other_existing_concept',
                            name: 'other_test_name',
                            conceptType: 'ActivityType',
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                            }),
                        });

                        await existingConcept.save();
                        await otherExistingConcept.save();
                    });

                    afterEach(async () => {
                        await existingConcept.remove();
                        await otherExistingConcept.remove();
                    });

                    test('it should return a templateModel with the correct values.', async () => {
                        templateDocument.contextGroupingActivityType = ['existing_concept', 'other_existing_concept'];
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });
                        const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                        expect([...templateModel.contextGroupingActivityType.map(c => c.iri)]).toStrictEqual(['existing_concept', 'other_existing_concept']);
                        expect([...templateModel.contextGroupingActivityType.map(c => c.name)]).toEqual(['test_name', 'other_test_name']);
                        expect(templateModel.contextGroupingActivityType.map(c => c.conceptType).every(c => c === 'ActivityType')).toBeTruthy();
                    });
                });

                describe('and the concept is not an activityType type', () => {
                    beforeEach(async () => {
                        existingConcept = new ConceptModel({
                            iri: 'existing_concept',
                            name: 'test_name',
                            conceptType: 'Verb',
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                            }),
                        });

                        await existingConcept.save();
                    });

                    afterEach(async () => {
                        await existingConcept.remove();
                    });

                    test('it should throw an error.', async () => {
                        templateDocument.contextGroupingActivityType = ['existing_concept'];
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        let error;
                        try {
                            const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept existing_concept cannot be the contextGroupingActivityType for this template because it is type Verb/);
                    });
                });
            });

            describe('if the concept does not exist in profile version or on the server', () => {
                test('it should return a template model with the contextGroupingActivityType as a parentless concept saved on the server.', async () => {
                    templateDocument.contextGroupingActivityType = ['non-existent_concept'];
                    const templateLayer = new TemplateLayer({
                        templateDocument: templateDocument,
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'parent_profile_name',
                            description: 'parent_profile_description',
                            createdBy: user,
                            updatedBy: user,
                        }),
                    });

                    const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                    const parentlessConcept = await ConceptModel.findOne({ iri: 'non-existent_concept' });

                    expect(parentlessConcept.iri).toEqual('non-existent_concept');
                    expect(templateModel.contextGroupingActivityType[0].iri).toEqual('non-existent_concept');
                    expect(templateModel.contextGroupingActivityType[0].id).toEqual(parentlessConcept.id);

                    await parentlessConcept.remove();
                });
            });
        });

        describe('DeterminingProperties#AttachmentUsageType (determining properties that are array valued)', () => {
            describe('if there is a duplicate id in the array', () => {
                test('it should throw an error', async () => {
                    templateDocument.attachmentUsageType = ['concept3_id', 'concept3_id', 'concept35_id'];
                    const templateLayer = new TemplateLayer({
                        templateDocument: templateDocument,
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'parent_profile_name',
                            description: 'parent_profile_description',
                            createdBy: user,
                            updatedBy: user,
                        }),
                    });
                    let error;
                    try {
                        const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/Template template1_id has a duplicate concept id in property attachmentUsageType/);
                });
            });

            describe('if the concepts exist in profile version', () => {
                describe('and the concepts are activityType type', () => {
                    test('it should return a templateModel with the correct values.', async () => {
                        templateDocument.attachmentUsageType = ['concept3_id', 'concept35_id'];
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });
                        const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                        expect([...templateModel.attachmentUsageType.map(c => c.iri)]).toStrictEqual(['concept3_id', 'concept35_id']);
                        expect([...templateModel.attachmentUsageType.map(c => c.name)]).toEqual(['concept_3', 'concept_35']);
                        expect(templateModel.attachmentUsageType.map(c => c.conceptType).every(c => c === 'AttachmentUsageType')).toBeTruthy();
                    });
                });

                describe('and the concept is not a activityType type', () => {
                    test('it should throw an error.', async () => {
                        templateDocument.attachmentUsageType = ['concept1_id'];
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        let error;
                        try {
                            const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept concept1_id cannot be the attachmentUsageType for this template because it is type Verb/);
                    });
                });
            });

            describe('if the concepts exist on the server', () => {
                let existingConcept;
                let otherExistingConcept;

                describe('and the concepts are activityType type', () => {
                    beforeEach(async () => {
                        existingConcept = new ConceptModel({
                            iri: 'existing_concept',
                            name: 'test_name',
                            conceptType: 'AttachmentUsageType',
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                            }),
                        });

                        otherExistingConcept = new ConceptModel({
                            iri: 'other_existing_concept',
                            name: 'other_test_name',
                            conceptType: 'AttachmentUsageType',
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                            }),
                        });

                        await existingConcept.save();
                        await otherExistingConcept.save();
                    });

                    afterEach(async () => {
                        await existingConcept.remove();
                        await otherExistingConcept.remove();
                    });

                    test('it should return a templateModel with the correct values.', async () => {
                        templateDocument.attachmentUsageType = ['existing_concept', 'other_existing_concept'];
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });
                        const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                        expect([...templateModel.attachmentUsageType.map(c => c.iri)]).toStrictEqual(['existing_concept', 'other_existing_concept']);
                        expect([...templateModel.attachmentUsageType.map(c => c.name)]).toEqual(['test_name', 'other_test_name']);
                        expect(templateModel.attachmentUsageType.map(c => c.conceptType).every(c => c === 'AttachmentUsageType')).toBeTruthy();
                    });
                });

                describe('and the concept is not an activityType type', () => {
                    beforeEach(async () => {
                        existingConcept = new ConceptModel({
                            iri: 'existing_concept',
                            name: 'test_name',
                            conceptType: 'Verb',
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                            }),
                        });

                        await existingConcept.save();
                    });

                    afterEach(async () => {
                        await existingConcept.remove();
                    });

                    test('it should throw an error.', async () => {
                        templateDocument.attachmentUsageType = ['existing_concept'];
                        const templateLayer = new TemplateLayer({
                            templateDocument: templateDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'parent_profile_name',
                                description: 'parent_profile_description',
                                createdBy: user,
                                updatedBy: user,
                            }),
                        });

                        let error;
                        try {
                            const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept existing_concept cannot be the attachmentUsageType for this template because it is type Verb/);
                    });
                });
            });

            describe('if the concept does not exist in profile version or on the server', () => {
                test('it should return a template model with the attachmentUsageType as a parentless concept saved on the server.', async () => {
                    templateDocument.attachmentUsageType = ['non-existent_concept'];
                    const templateLayer = new TemplateLayer({
                        templateDocument: templateDocument,
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'parent_profile_name',
                            description: 'parent_profile_description',
                            createdBy: user,
                            updatedBy: user,
                        }),
                    });

                    const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                    const parentlessConcept = await ConceptModel.findOne({ iri: 'non-existent_concept' });

                    expect(parentlessConcept.iri).toEqual('non-existent_concept');
                    expect(templateModel.attachmentUsageType[0].iri).toEqual('non-existent_concept');
                    expect(templateModel.attachmentUsageType[0].id).toEqual(parentlessConcept.id);

                    await parentlessConcept.remove();
                });
            });
        });
    });

    describe('ObjectRefStatementTemplate', () => {
        let templateDocument;
        let profileConcepts;
        let profileTemplates;
        beforeEach(() => {
            templateDocument = {
                id: 'template1_id',
                prefLabel: { en: 'test_name' },
                definition: { en: 'test_description' },
            };

            profileConcepts = [
                new ConceptModel({ iri: 'concept2_id', name: 'concept_2', conceptType: 'ActivityType' }),
            ];

            profileTemplates = [
                new TemplateModel({ iri: 'template2_id', name: 'template_2' }),
            ];
        });

        describe('if there is a value for objectActivityType', () => {
            test('it should throw an error.', async () => {
                templateDocument.objectActivityType = 'concept2_id';
                templateDocument.objectStatementRefTemplate = ['template2_id'];
                const templateLayer = new TemplateLayer({
                    templateDocument: templateDocument,
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                        createdBy: user,
                        updatedBy: user,
                    }),
                });

                let error;
                try {
                    const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/template1_id cannot have both an objectStatementRefTemplate and an objectActivityType/);
            });
        });

        describe('if the templates are not from this profile version', () => {
            test('it should throw an error.', async () => {
                templateDocument.objectStatementRefTemplate = ['template3_id'];
                const templateLayer = new TemplateLayer({
                    templateDocument: templateDocument,
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                        createdBy: user,
                        updatedBy: user,
                    }),
                });

                let error;
                try {
                    const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/template3_id cannot be the objectStatementRefTemplate for template template1_id because it is not a template from this profile version/);
            });
        });

        describe('if the templates are from this profile version', () => {
            test('it should return a template model with the correcct values', async () => {
                templateDocument.objectStatementRefTemplate = ['template2_id'];
                const templateLayer = new TemplateLayer({
                    templateDocument: templateDocument,
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                        createdBy: user,
                        updatedBy: user,
                    }),
                });
                const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                expect(templateModel.objectStatementRefTemplate.length).toEqual(1);
                expect([...templateModel.objectStatementRefTemplate.map(t => t.iri)]).toStrictEqual(['template2_id']);
                expect([...templateModel.objectStatementRefTemplate.map(t => t.name)]).toEqual(['template_2']);
            });
        });
    });

    describe('ContextStatementRefTemplate', () => {
        let templateDocument;
        let profileConcepts;
        let profileTemplates;
        beforeEach(() => {
            templateDocument = {
                id: 'template1_id',
                prefLabel: { en: 'test_name' },
                definition: { en: 'test_description' },
            };

            profileConcepts = [];

            profileTemplates = [
                new TemplateModel({ iri: 'template2_id', name: 'template_2' }),
            ];
        });

        describe('if the templates are not from this profile version', () => {
            test('it should throw an error.', async () => {
                templateDocument.contextStatementRefTemplate = ['template3_id'];
                const templateLayer = new TemplateLayer({
                    templateDocument: templateDocument,
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                        createdBy: user,
                        updatedBy: user,
                    }),
                });

                let error;
                try {
                    const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/template3_id cannot be the contextStatementRefTemplate for template template1_id because it is not a template from this profile version/);
            });
        });

        describe('if the templates are from this profile version', () => {
            test('it should return a template model with the correcct values', async () => {
                templateDocument.contextStatementRefTemplate = ['template2_id'];
                const templateLayer = new TemplateLayer({
                    templateDocument: templateDocument,
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                        createdBy: user,
                        updatedBy: user,
                    }),
                });
                const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                expect(templateModel.contextStatementRefTemplate.length).toEqual(1);
                expect([...templateModel.contextStatementRefTemplate.map(t => t.iri)]).toStrictEqual(['template2_id']);
                expect([...templateModel.contextStatementRefTemplate.map(t => t.name)]).toEqual(['template_2']);
            });
        });
    });

    describe('Rules', () => {
        describe('when given a value for rules', () => {
            test('it should return a template model with the correct values in rules.', async () => {
                const templateLayer = new TemplateLayer({
                    templateDocument: {
                        id: 'template1_id',
                        prefLabel: { en: 'test_name' },
                        definition: { en: 'test_description' },
                        rules: [
                            {
                                location: '$.result.extensions["http://example.org/profiles/sports/extensions/place"]',
                                selector: 'some_selector',
                                presence: 'included',
                                any: ['some_any_match'],
                                all: ['some_all_match'],
                                none: ['some_none_match'],
                                scopeNote: { en: 'some scope note.' },
                            },
                        ],
                    },
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'parent_profile_name',
                        description: 'parent_profile_description',
                        createdBy: user,
                        updatedBy: user,
                    }),
                });
                const profileConcepts = [];
                const profileTemplates = [];

                const templateModel = await templateLayer.scanSubcomponentLayer(profileConcepts, profileTemplates);

                expect(templateModel.rules.length).toEqual(1);
                expect(templateModel.rules[0].location).toEqual('$.result.extensions["http://example.org/profiles/sports/extensions/place"]');
                expect(templateModel.rules[0].selector).toEqual('some_selector');
                expect(templateModel.rules[0].presence).toEqual('included');
                expect([...templateModel.rules[0].any]).toStrictEqual(['some_any_match']);
                expect([...templateModel.rules[0].all]).toStrictEqual(['some_all_match']);
                expect([...templateModel.rules[0].none]).toStrictEqual(['some_none_match']);
                expect(templateModel.rules[0].scopeNote).toStrictEqual({ en: 'some scope note.' });
            });
        });
    });
});
