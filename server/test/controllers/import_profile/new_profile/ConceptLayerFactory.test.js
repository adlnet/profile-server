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
const { concept } = require('../../../../ODM/models');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const ConceptModel = require('../../../../ODM/models').concept;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const UserModel = require('../../../../ODM/models').user;
const ConceptLayerFactory = require('../../../../controllers/importProfile/ConceptLayerFactory')
    .ConceptLayerFactory;

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
let otherUser;
beforeEach(async () => {
    user = new UserModel({ email: 'an@email.com' });
    await user.save();

    otherUser = new UserModel({ email: 'another@email.com' });
    await otherUser.save();
});

afterEach(async () => {
    await user.remove();
    await otherUser.remove();
});

describe('ConceptLayer contructor', () => {
    describe('when testing common concept properties for all but Activity concepts', () => {
        describe('parentProfile', () => {
            describe('when given a profileVersion model', () => {
                test('it should return a concept model with a parentProfile that has the correct values.', async () => {
                    const conceptLayer = new ConceptLayerFactory({
                        conceptDocument: {
                            iri: 'new_iri',
                            type: 'Verb',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                            createdBy: user,
                            updatedBy: user,
                        }),
                    });
                    const conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel.parentProfile.iri).toEqual('parent_profile_id');
                    expect(conceptModel.parentProfile.name).toEqual('profile_name');
                    expect(conceptModel.parentProfile.description).toEqual('profile_description');
                    expect(conceptModel.updatedBy._id.toString()).toEqual(user._id.toString());
                    expect(conceptModel.createdBy._id.toString()).toEqual(user._id.toString());
                });
            });
        });
        describe('prefLabel and definition: ', () => {
            describe('if the prefLabel and definition properties have one `en` entry each', () => {
                describe('and no other entry', () => {
                    let conceptLayer;
                    let conceptModel;
                    beforeAll(async () => {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: { en: 'test_name' },
                                definition: { en: 'test_description' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                        conceptModel = await conceptLayer.scanProfileComponentLayer();
                    });

                    test('it should return a concept model with name equal to prefLabel.en.', () => {
                        expect(conceptModel.name).toEqual('test_name');
                    });

                    test('it should return a concept model with description equal to definition.en.', () => {
                        expect(conceptModel.description).toEqual('test_description');
                    });

                    test('it should return a conceptModel with no translations.', () => {
                        expect(conceptModel.translations.length).toEqual(0);
                    });
                });

                describe('and one other matching entry', () => {
                    let conceptLayer;
                    let conceptModel;
                    beforeAll(async () => {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: { en: 'test_name', es: 'spanish_name' },
                                definition: { en: 'test_description', es: 'spanish_description' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                        conceptModel = await conceptLayer.scanProfileComponentLayer();
                    });

                    test('it should return a concept model with name equal to prefLabel.en.', () => {
                        expect(conceptModel.name).toEqual('test_name');
                    });

                    test('it should return a concept model with description equal to definition.en.', () => {
                        expect(conceptModel.description).toEqual('test_description');
                    });

                    test('it should return a concept model with translations for the non-en matching pair.', () => {
                        const translations = conceptModel.translations;

                        expect(translations.length).toEqual(1);
                        expect(translations[0].language).toEqual('es');
                        expect(translations[0].translationName).toEqual('spanish_name');
                        expect(translations[0].translationDesc).toEqual('spanish_description');
                    });
                });

                describe('and one other matching entry with an unmatched entry in preLabel', () => {
                    let conceptLayer;
                    let conceptModel;
                    beforeAll(async () => {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: { en: 'test_name', es: 'spanish_name', fr: 'french_name' },
                                definition: { en: 'test_description', es: 'spanish_description' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                        conceptModel = await conceptLayer.scanProfileComponentLayer();
                    });

                    test('it should return a concept model with name equal to prefLabel.en.', () => {
                        expect(conceptModel.name).toEqual('test_name');
                    });

                    test('it should return a concept model with description equal to definition.en.', () => {
                        expect(conceptModel.description).toEqual('test_description');
                    });

                    test('it should return a conceptModel with a translations that has 2 entries', () => {
                        expect(conceptModel.translations.length).toEqual(2);
                    });

                    test('it should return a concept model with translations for the non-en matching pair.', () => {
                        const translation = conceptModel.translations.find(t => t.language === 'es');

                        expect(translation).toBeTruthy();
                        expect(translation.translationName).toEqual('spanish_name');
                        expect(translation.translationDesc).toEqual('spanish_description');
                    });

                    test('it should return a concept model with translations for the non-en unmatched entry in prefLabel.', () => {
                        const translation = conceptModel.translations.find(t => t.language === 'fr');

                        expect(translation).toBeTruthy();
                        expect(translation.translationName).toEqual('french_name');
                        expect(translation.translationDesc).toBeUndefined();
                    });
                });

                describe('and one entry in prefLabel that is not matched in definition', () => {
                    let conceptLayer;
                    let conceptModel;
                    beforeAll(async () => {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: { en: 'test_name', es: 'spanish_name' },
                                definition: { en: 'test_description' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                        conceptModel = await conceptLayer.scanProfileComponentLayer();
                    });

                    test('it should return a concept model with name equal to prefLabel.en.', () => {
                        expect(conceptModel.name).toEqual('test_name');
                    });

                    test('it should return a concept model with description equal to definition.en.', () => {
                        expect(conceptModel.description).toEqual('test_description');
                    });

                    test('it should return a concept model with a translations for the non-en preLabel entry.', () => {
                        const translations = conceptModel.translations;

                        expect(translations.length).toEqual(1);
                        expect(translations[0].language).toEqual('es');
                        expect(translations[0].translationName).toEqual('spanish_name');
                        expect(translations[0].translationDesc).toBeUndefined();
                    });
                });

                describe('and one entry in definition that is not matched in prefLabel', () => {
                    let conceptLayer;
                    let conceptModel;
                    beforeAll(async () => {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: { en: 'test_name' },
                                definition: { en: 'test_description', es: 'spanish_description' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                        conceptModel = await conceptLayer.scanProfileComponentLayer();
                    });

                    test('it should return a concept model with name equal to prefLabel.en.', () => {
                        expect(conceptModel.name).toEqual('test_name');
                    });

                    test('it should return a concept model with description equal to definition.en.', () => {
                        expect(conceptModel.description).toEqual('test_description');
                    });

                    test('it should return a concept model with a translations for the non-en definition entry.', () => {
                        const translations = conceptModel.translations;

                        expect(translations.length).toEqual(1);
                        expect(translations[0].language).toEqual('es');
                        expect(translations[0].translationName).toBeUndefined();
                        expect(translations[0].translationDesc).toEqual('spanish_description');
                    });
                });
            });

            describe('if prefLabel has an `en` entry', () => {
                describe('and definition has one non-en entry', () => {
                    let conceptLayer;
                    let conceptModel;
                    beforeAll(async () => {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: { en: 'test_name' },
                                definition: { es: 'spanish_description' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                        conceptModel = await conceptLayer.scanProfileComponentLayer();
                    });

                    test('it should return a concept model with name equal to the value of the `en` entry.', () => {
                        expect(conceptModel.name).toEqual('test_name');
                    });

                    test('it should return a concept model with description equal to the value of the non-en entry.', () => {
                        expect(conceptModel.description).toEqual('spanish_description');
                    });

                    test('it should return a conceptModel with no translations.', () => {
                        expect(conceptModel.translations.length).toEqual(0);
                    });
                });

                describe('and prefLabel and definition has one matching non-en entry', () => {
                    let conceptLayer;
                    let conceptModel;
                    beforeAll(async () => {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: { en: 'test_name', es: 'spanish_name' },
                                definition: { es: 'spanish_description' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                        conceptModel = await conceptLayer.scanProfileComponentLayer();
                    });

                    test('it should return a concept model with name equal to the value of the `en` entry.', () => {
                        expect(conceptModel.name).toEqual('test_name');
                    });

                    test('it should return a concept model with description equal to the value of the non-en entry.', () => {
                        expect(conceptModel.description).toEqual('spanish_description');
                    });

                    test('it should return a concept model with a translations for the non-en preLabel entry.', () => {
                        const translations = conceptModel.translations;

                        expect(translations.length).toEqual(1);
                        expect(translations[0].language).toEqual('es');
                        expect(translations[0].translationName).toEqual('spanish_name');
                        expect(translations[0].translationDesc).toBeUndefined();
                    });
                });
            });

            describe('if the prefLabel and definition properties do not have `en` entries', () => {
                let conceptLayer;
                let conceptModel;
                beforeAll(async () => {
                    conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            iri: 'new_iri',
                            type: 'Verb',
                            prefLabel: { es: 'spanish_name', fr: 'french_name' },
                            definition: { es: 'spanish_definition', fr: 'french_description' },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });
                    conceptModel = await conceptLayer.scanProfileComponentLayer();
                });

                test('it should return a concept model with the name equal to the first prefLabel entry', () => {
                    expect(conceptModel.name).toEqual('spanish_name');
                });

                test('it should return a concept model with the description equal to the first definition entry', () => {
                    expect(conceptModel.description).toEqual('spanish_definition');
                });

                test('it should return a concept model with translations for each unique pairs and singletons of languages amoung prefLabel and definition minus the first entries.', () => {
                    const translations = conceptModel.translations;

                    expect(translations.length).toEqual(1);
                    expect(translations[0].language).toEqual('fr');
                    expect(translations[0].translationName).toEqual('french_name');
                    expect(translations[0].translationDesc).toEqual('french_description');
                });
            });

            describe('if the prefLabel and definition properties do not exist', () => {
                test('it should throw an error.', async () => {
                    let conceptLayer;
                    let error;
                    try {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/prefLabel cannot be empty or undefined/);

                    try {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: { en: 'test_name' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/definition cannot be empty or undefined/);

                    try {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                definition: { en: 'test_description' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/prefLabel cannot be empty or undefined/);
                });
            });

            describe('if the prefLabel or definition properties are empty', () => {
                test('it should throw an error.', async () => {
                    let conceptLayer;
                    let error;
                    try {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: {},
                                definition: {},
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/prefLabel cannot be empty or undefined/);

                    try {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: { en: 'test_name' },
                                definition: {},
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/definition cannot be empty or undefined/);

                    try {
                        conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                iri: 'new_iri',
                                type: 'Verb',
                                prefLabel: {},
                                definition: { en: 'test_description' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/prefLabel cannot be empty or undefined/);
                });
            });
        });

        describe('deprecated', () => {
            describe('if deprecated is true', () => {
                test('it should return a conceptModel with isDeprecated equal to true', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            iri: 'new_iri',
                            type: 'Verb',
                            prefLabel: { en: 'spanish_name' },
                            definition: { en: 'spanish_definition' },
                            deprecated: true,
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });
                    const conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel.isDeprecated).toBeTruthy();
                });
            });

            describe('if deprecated is false', () => {
                test('it should return a conceptModel with isDeprecated equal to false', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            iri: 'new_iri',
                            type: 'Verb',
                            prefLabel: { en: 'spanish_name' },
                            definition: { en: 'spanish_definition' },
                            deprecated: false,
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });
                    const conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel.isDeprecated).toBeFalsy();
                });
            });

            describe('if deprecated does not exist', () => {
                test('it should return a conceptModel with isDeprecated equal to false', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            iri: 'new_iri',
                            type: 'Verb',
                            prefLabel: { en: 'spanish_name' },
                            definition: { en: 'spanish_definition' },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });
                    const conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel.isDeprecated).toBeFalsy();
                });
            });
        });
    });

    describe('common properties from Document and Extention types', () => {
        describe('if there are both a schema and an inlineSchema property', () => {
            test('it should throw an error.', () => {
                let conceptLayer;
                let error;
                try {
                    conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            iri: 'new_iri',
                            type: 'StateResource',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                            inlineSchema: 'http://path/to/iri',
                            schema: '{ \'type\': \'object\'}',
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/Cannot have both an inlineSchema a schema property in the same concept/);

                try {
                    conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            iri: 'new_iri',
                            type: 'ContextExtension',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                            inlineSchema: 'http://path/to/iri',
                            schema: '{ \'type\': \'object\'}',
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/Cannot have both an inlineSchema a schema property in the same concept/);
            });
        });

        describe('schema', () => {
            test('it should return a concept model with the correct schemaString value.', async () => {
                let conceptLayer;
                let conceptModel;
                conceptLayer = ConceptLayerFactory({
                    conceptDocument: {
                        id: 'new_id',
                        type: 'StateResource',
                        prefLabel: { en: 'test_name' },
                        definition: { en: 'test_description' },
                        schema: '{ \'type\': \'object\'}',
                    },
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'profile_name',
                        description: 'profile_description',
                    }),
                });
                conceptModel = await conceptLayer.scanProfileComponentLayer();

                expect(conceptModel.schemaString).toEqual('{ \'type\': \'object\'}');

                conceptLayer = ConceptLayerFactory({
                    conceptDocument: {
                        id: 'new_id',
                        type: 'ContextExtension',
                        prefLabel: { en: 'test_name' },
                        definition: { en: 'test_description' },
                        schema: '{ \'type\': \'object\'}',
                    },
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'profile_name',
                        description: 'profile_description',
                    }),
                });
                conceptModel = await conceptLayer.scanProfileComponentLayer();

                expect(conceptModel.schemaString).toEqual('{ \'type\': \'object\'}');
            });
        });

        describe('inlineSchema', () => {
            test('it should return a concept model with the correct inlineSchema value.', async () => {
                let conceptLayer;
                let conceptModel;
                conceptLayer = ConceptLayerFactory({
                    conceptDocument: {
                        id: 'new_id',
                        type: 'StateResource',
                        prefLabel: { en: 'test_name' },
                        definition: { en: 'test_description' },
                        inlineSchema: 'http://path/to/iri',
                    },
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'profile_name',
                        description: 'profile_description',
                    }),
                });
                conceptModel = await conceptLayer.scanProfileComponentLayer();

                expect(conceptModel.inlineSchema).toEqual('http://path/to/iri');

                conceptLayer = ConceptLayerFactory({
                    conceptDocument: {
                        id: 'new_id',
                        type: 'ContextExtension',
                        prefLabel: { en: 'test_name' },
                        definition: { en: 'test_description' },
                        inlineSchema: 'http://path/to/iri',
                    },
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'profile_name',
                        description: 'profile_description',
                    }),
                });
                conceptModel = await conceptLayer.scanProfileComponentLayer();

                expect(conceptModel.inlineSchema).toEqual('http://path/to/iri');
            });
        });
    });
});

describe('Using the ConceptLayerFactory to get conceptModels by calling the scanProfileComponentLayer method', () => {
    describe('when the type is Verb, ActivityType, or AttachmentUsageType', () => {
        test('it should return a SemanticallyRelatableConceptLayer', async () => {
            let conceptLayer;
            let conceptModel;
            conceptLayer = ConceptLayerFactory({
                conceptDocument: { id: 'new_id', prefLabel: { en: 'test_name' }, definition: { en: 'test_description' }, type: 'Verb' },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('Verb');

            conceptLayer = ConceptLayerFactory({
                conceptDocument: { id: 'new_id', prefLabel: { en: 'test_name' }, definition: { en: 'test_description' }, type: 'ActivityType' },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('ActivityType');

            conceptLayer = ConceptLayerFactory({
                conceptDocument: { id: 'new_id', prefLabel: { en: 'test_name' }, definition: { en: 'test_description' }, type: 'AttachmentUsageType' },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('AttachmentUsageType');
        });

        // We really need to consider if this is legitimate. Is the iri the same but the parts are different?
        describe('when the concept exist on the server', () => {
            let existingConcept;

            afterEach(async () => {
                await existingConcept.remove();
            });

            describe('and that existing concept is not a parentless component', () => {
                beforeEach(async () => {
                    existingConcept = new ConceptModel({
                        iri: 'existing_id',
                        name: 'existing_concept',
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'parent_profile_name',
                            description: 'parent_profile_description',
                        }),
                    });
                    await existingConcept.save();
                });

                test('it should throw an error.', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            type: 'Verb',
                            id: 'existing_id',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    let error;
                    try {
                        const conceptModel = await conceptLayer.scanProfileComponentLayer();
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/Concept existing_id already exists/);
                });
            });

            describe('and that existing concept is a parentless component', () => {
                beforeEach(async () => {
                    existingConcept = new ConceptModel({ iri: 'existing_id' });
                    await existingConcept.save();
                });

                test('it should return a concept model with the correct values and an id equal to the parentless component.', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            type: 'Verb',
                            id: 'existing_id',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    const conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel.equals(existingConcept)).toBeTruthy();
                    expect(conceptModel.type).toEqual('Verb');
                    expect(conceptModel.conceptType).toEqual('Verb');
                    expect(conceptModel.name).toEqual('test_name');
                    expect(conceptModel.description).toEqual('test_description');
                });
            });
        });
    });

    describe('when the type is ContextExtension, ResultExtension, or ActivityExtension', () => {
        test('it should return an ExtensionConceptLayer', async () => {
            let conceptLayer;
            let conceptModel;
            conceptLayer = ConceptLayerFactory({
                conceptDocument: {
                    id: 'new_id',
                    type: 'ContextExtension',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('Extension');

            conceptLayer = ConceptLayerFactory({
                conceptDocument: {
                    id: 'new_id',
                    type: 'ResultExtension',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('Extension');

            conceptLayer = ConceptLayerFactory({
                conceptDocument: {
                    id: 'new_id',
                    type: 'ActivityExtension',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('Extension');
        });

        describe('when the concept exist on the server', () => {
            let existingConcept;

            afterEach(async () => {
                await existingConcept.remove();
            });

            describe('and that existing concept is not a parentless component', () => {
                beforeEach(async () => {
                    existingConcept = new ConceptModel({
                        iri: 'existing_id',
                        name: 'existing_concept',
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'parent_profile_name',
                            description: 'parent_profile_description',
                        }),
                    });
                    await existingConcept.save();
                });

                test('it should throw an error.', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            type: 'ContextExtension',
                            id: 'existing_id',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    let error;
                    try {
                        const conceptModel = await conceptLayer.scanProfileComponentLayer();
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/Concept existing_id already exists/);
                });
            });

            describe('and that existing concept is a parentless component', () => {
                beforeEach(async () => {
                    existingConcept = new ConceptModel({ iri: 'existing_id' });
                    await existingConcept.save();
                });

                test('it should return a concept model with the correct values and an id equal to the parentless component.', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            type: 'ContextExtension',
                            id: 'existing_id',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    const conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel.equals(existingConcept)).toBeTruthy();
                    expect(conceptModel.type).toEqual('ContextExtension');
                    expect(conceptModel.conceptType).toEqual('Extension');
                    expect(conceptModel.name).toEqual('test_name');
                    expect(conceptModel.description).toEqual('test_description');
                });
            });
        });
    });

    describe('when the type is StateResource, AgentProfileResource, or ActivityProfileResource', () => {
        test('it should return an DocumentConceptLayer', async () => {
            let conceptLayer;
            let conceptModel;
            conceptLayer = ConceptLayerFactory({
                conceptDocument: {
                    id: 'new_id',
                    type: 'StateResource',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('Document');

            conceptLayer = ConceptLayerFactory({
                conceptDocument: {
                    id: 'new_id',
                    type: 'AgentProfileResource',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('Document');

            conceptLayer = ConceptLayerFactory({
                conceptDocument: {
                    id: 'new_id',
                    type: 'ActivityProfileResource',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('Document');
        });

        // We really need to consider if this is legitimate. Is the iri the same but the parts are different?
        describe('when the concept exist on the server', () => {
            let existingConcept;

            afterEach(async () => {
                await existingConcept.remove();
            });

            describe('and that existing concept is not a parentless component', () => {
                beforeEach(async () => {
                    existingConcept = new ConceptModel({
                        iri: 'existing_id',
                        name: 'existing_concept',
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'parent_profile_name',
                            description: 'parent_profile_description',
                        }),
                    });
                    await existingConcept.save();
                });

                test('it should throw an error.', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            type: 'StateResource',
                            id: 'existing_id',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    let error;
                    try {
                        const conceptModel = await conceptLayer.scanProfileComponentLayer();
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/Concept existing_id already exists/);
                });
            });

            describe('and that existing concept is a parentless component', () => {
                beforeEach(async () => {
                    existingConcept = new ConceptModel({ iri: 'existing_id' });
                    await existingConcept.save();
                });

                test('it should return a concept model with the correct values and an id equal to the parentless component.', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            type: 'StateResource',
                            id: 'existing_id',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    const conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel.equals(existingConcept)).toBeTruthy();
                    expect(conceptModel.type).toEqual('StateResource');
                    expect(conceptModel.conceptType).toEqual('Document');
                    expect(conceptModel.name).toEqual('test_name');
                    expect(conceptModel.description).toEqual('test_description');
                });
            });
        });

        describe('Document type specific properties', () => {
            test('it should return a Docment type concept model with the correct property values.', async () => {
                const conceptLayer = ConceptLayerFactory({
                    conceptDocument: {
                        id: 'new_id',
                        type: 'StateResource',
                        prefLabel: { en: 'test_name' },
                        definition: { en: 'test_description' },
                        contentType: 'application/json',
                    },
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'profile_name',
                        description: 'profile_description',
                    }),
                });
                const conceptModel = await conceptLayer.scanProfileComponentLayer();

                expect(conceptModel.mediaType).toEqual('application/json');
            });
        });
    });

    describe('when the type is Activity', () => {
        test('it should return an ActivityConceptLayer', async () => {
            const conceptLayer = ConceptLayerFactory({
                conceptDocument: {
                    id: 'new_id',
                    type: 'Activity',
                    activityDefinition: {
                        '@context': 'some_context',
                        name: 'activity_1',
                    },
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            const conceptModel = await conceptLayer.scanProfileComponentLayer();
            expect(conceptModel.conceptType).toEqual('Activity');
        });

        describe('when the concept exist on the server', () => {
            let existingConcept;

            afterEach(async () => {
                await existingConcept.remove();
            });

            describe('and that existing concept is not a parentless component', () => {
                beforeEach(async () => {
                    existingConcept = new ConceptModel({
                        iri: 'existing_id',
                        name: 'existing_concept',
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'parent_profile_name',
                            description: 'parent_profile_description',
                        }),
                    });
                    await existingConcept.save();
                });

                test('it should throw an error.', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            type: 'Activity',
                            id: 'existing_id',
                            activityDefinition: {
                                '@context': 'some_context',
                                name: { en: 'activity1_name' },
                                description: { en: 'activity1_description' },
                                type: 'some_activity_type',
                                moreInfo: 'some_more_info',
                                extensions: { extension1: 'some_extension_iri' },
                            },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    let error;
                    let conceptModel;
                    try {
                        conceptModel = await conceptLayer.scanProfileComponentLayer();
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/Concept existing_id already exists/);
                });
            });

            describe('and that existing concept is a parentless component', () => {
                beforeEach(async () => {
                    existingConcept = new ConceptModel({ iri: 'existing_id' });
                    await existingConcept.save();
                });

                test('it should return a concept model with the correct values and an id equal to the parentless component.', async () => {
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            type: 'Activity',
                            id: 'existing_id',
                            activityDefinition: {
                                '@context': 'some_context',
                                name: { en: 'activity1_name' },
                                description: { en: 'activity1_description' },
                                type: 'some_activity_type',
                                moreInfo: 'some_more_info',
                                extensions: { extension1: 'some_extension_iri' },
                            },
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    const conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel.equals(existingConcept)).toBeTruthy();
                    expect(conceptModel.type).toEqual('Activity');
                    expect(conceptModel.conceptType).toEqual('Activity');
                    expect(conceptModel.name).toEqual('activity1_name');
                    expect(conceptModel.description).toEqual('activity1_description');
                });
            });
        });

        describe('ActivityConcept#ActivityDefinition', () => {
            describe('and it is missing a activityDefinition property', () => {
                test('it should throw an error.', async () => {
                    let error;
                    try {
                        const conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                type: 'Activity',
                                id: 'concept_1',
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/Concept is missing an activityDefinition property/);
                });
            });

            describe('and it has an activityDefinition', () => {
                describe('and the type is not http://adlnet.gov/expapi/activities/cmi.interaction', () => {
                    let conceptDocument;
                    beforeEach(() => {
                        conceptDocument = {
                            type: 'Activity',
                            id: 'activity1_id',
                            activityDefinition: {
                                '@context': 'some_context',
                                name: { en: 'activity1_name' },
                                description: { en: 'activity1_description' },
                                type: 'some_activity_type',
                                moreInfo: 'some_more_info',
                                extensions: { extension1: 'some_extension_iri' },
                            },
                        };
                    });

                    describe('and there are not interaction activities', () => {
                        test('it should return a concept model with the correct values.', async () => {
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: conceptDocument,
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });
                            const conceptModel = await conceptLayer.scanProfileComponentLayer();

                            expect(conceptModel.type).toEqual('Activity');
                            expect(conceptModel.conceptType).toEqual('Activity');
                            expect(conceptModel.iri).toEqual('activity1_id');
                            expect(conceptModel.contextIri).toEqual('some_context');
                            expect(conceptModel.name).toEqual('activity1_name');
                            expect(conceptModel.description).toEqual('activity1_description');
                            expect(conceptModel.activityType).toEqual('some_activity_type');
                            expect(conceptModel.extensions.extension1).toEqual('some_extension_iri');
                            expect(conceptModel.moreInformation).toEqual('some_more_info');
                        });
                    });

                    describe('and there are interaction activities', () => {
                        test('it should throw an error.', () => {
                            conceptDocument.activityDefinition.interactionType = 'true-false';
                            let error;
                            try {
                                const conceptLayer = ConceptLayerFactory({
                                    conceptDocument: conceptDocument,
                                    parentProfile: new ProfileVersionModel({
                                        iri: 'parent_profile_id',
                                        name: 'profile_name',
                                        description: 'profile_description',
                                    }),
                                });
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/Interaction Activity properties are populated but the activity type of this concept is not cmi.interaction/);
                        });
                    });
                });

                describe('and the type is http://adlnet.gov/expapi/activities/cmi.interaction', () => {
                    let conceptDocument;
                    beforeEach(() => {
                        conceptDocument = {
                            type: 'Activity',
                            id: 'activity1_id',
                            activityDefinition: {
                                '@context': 'some_context',
                                name: { en: 'activity1_name' },
                                description: { en: 'activity1_description' },
                                type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                                moreInfo: 'some_more_info',
                                extensions: { extension1: 'some_extension_iri' },
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        };
                    });

                    describe('and there is no interactionType', () => {
                        test('it should throw an error.', () => {
                            let error;
                            try {
                                const conceptLayer = ConceptLayerFactory({
                                    conceptDocument: conceptDocument,
                                });
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/The activity type is cmi.interaction but there is no interactionType/);
                        });
                    });

                    describe('and there is an invalid interactionType', () => {
                        test('it should throw an error.', () => {
                            conceptDocument.activityDefinition.interactionType = 'invalid_type';
                            let error;
                            try {
                                const conceptLayer = ConceptLayerFactory({
                                    conceptDocument: conceptDocument,
                                    parentProfile: new ProfileVersionModel({
                                        iri: 'parent_profile_id',
                                        name: 'profile_name',
                                        description: 'profile_description',
                                    }),
                                });
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/invalid_type is not a valid interactionType/);
                        });
                    });

                    describe('and interactionType does not support a component list', () => {
                        beforeEach(() => {
                            conceptDocument.activityDefinition.interactionType = 'true-false';
                            conceptDocument.activityDefinition.correctResponsesPattern = ['true'];
                        });

                        describe('and one or more of the supported interaction component properties are populated', () => {
                            test('it should throw an error.', () => {
                                conceptDocument.activityDefinition.scale = [{ id: 'likert_0' }];

                                let error;
                                try {
                                    const conceptLayer = ConceptLayerFactory({
                                        conceptDocument: conceptDocument,
                                        parentProfile: new ProfileVersionModel({
                                            iri: 'parent_profile_id',
                                            name: 'profile_name',
                                            description: 'profile_description',
                                        }),
                                    });
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/There are interaction component lists populated that do not support interactionType true-false/);
                            });
                        });

                        describe('and none of the supported interaction component properties are populated.', () => {
                            test('it should return a concept model with the correct values.', async () => {
                                const conceptLayer = ConceptLayerFactory({
                                    conceptDocument: conceptDocument,
                                    parentProfile: new ProfileVersionModel({
                                        iri: 'parent_profile_id',
                                        name: 'profile_name',
                                        description: 'profile_description',
                                    }),
                                });
                                const conceptModel = await conceptLayer.scanProfileComponentLayer();

                                expect(conceptModel.type).toEqual('Activity');
                                expect(conceptModel.conceptType).toEqual('Activity');
                                expect(conceptModel.iri).toEqual('activity1_id');
                                expect(conceptModel.contextIri).toEqual('some_context');
                                expect(conceptModel.name).toEqual('activity1_name');
                                expect(conceptModel.description).toEqual('activity1_description');
                                expect(conceptModel.activityType).toEqual('http://adlnet.gov/expapi/activities/cmi.interaction');
                                expect(conceptModel.extensions.extension1).toEqual('some_extension_iri');
                                expect(conceptModel.moreInformation).toEqual('some_more_info');
                                expect(conceptModel.interactionType).toEqual('true-false');
                                expect([...conceptModel.correctResponsesPattern]).toStrictEqual(['true']);
                            });
                        });
                    });

                    describe('and interactionType is `choice` or `sequencing`', () => {
                        beforeEach(() => {
                            conceptDocument.activityDefinition.interactionType = 'choice';
                            conceptDocument.activityDefinition.correctResponsesPattern = ['golf[,]tetris'];
                        });

                        describe('and a supported interaction component list other than `choices` is populated', () => {
                            test('it should throw an error.', () => {
                                conceptDocument.activityDefinition.scale = [{ id: 'likert_0' }];

                                let error;
                                try {
                                    const conceptLayer = ConceptLayerFactory({
                                        conceptDocument: conceptDocument,
                                        parentProfile: new ProfileVersionModel({
                                            iri: 'parent_profile_id',
                                            name: 'profile_name',
                                            description: 'profile_description',
                                        }),
                                    });
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/There are interaction component lists populated that do not support interactionType choice/);
                            });
                        });

                        describe('and only the `choices` supported interaction component list is populated.', () => {
                            test('it should return a concept model with the correct values.', async () => {
                                conceptDocument.activityDefinition.choices = [{ id: 'golf' }, { id: 'tetris' }, { id: 'chocolate' }];

                                const conceptLayer = ConceptLayerFactory({
                                    conceptDocument: conceptDocument,
                                    parentProfile: new ProfileVersionModel({
                                        iri: 'parent_profile_id',
                                        name: 'profile_name',
                                        description: 'profile_description',
                                    }),
                                });
                                const conceptModel = await conceptLayer.scanProfileComponentLayer();

                                expect(conceptModel.type).toEqual('Activity');
                                expect(conceptModel.conceptType).toEqual('Activity');
                                expect(conceptModel.iri).toEqual('activity1_id');
                                expect(conceptModel.contextIri).toEqual('some_context');
                                expect(conceptModel.name).toEqual('activity1_name');
                                expect(conceptModel.description).toEqual('activity1_description');
                                expect(conceptModel.activityType).toEqual('http://adlnet.gov/expapi/activities/cmi.interaction');
                                expect(conceptModel.extensions.extension1).toEqual('some_extension_iri');
                                expect(conceptModel.moreInformation).toEqual('some_more_info');
                                expect(conceptModel.interactionType).toEqual('choice');
                                expect([...conceptModel.correctResponsesPattern]).toStrictEqual(['golf[,]tetris']);
                                expect([...conceptModel.choices]).toStrictEqual([{ id: 'golf' }, { id: 'tetris' }, { id: 'chocolate' }]);
                            });
                        });
                    });

                    describe('and interactionType is `matching`', () => {
                        beforeEach(() => {
                            conceptDocument.activityDefinition.interactionType = 'matching';
                            conceptDocument.activityDefinition.correctResponsesPattern = ['ben[.]3[,]chris[.]2[,]troy[.]4'];
                        });

                        describe('and a supported interaction component list other than `source` or `target` is populated', () => {
                            test('it should throw an error.', () => {
                                conceptDocument.activityDefinition.scale = [{ id: 'likert_0' }];

                                let error;
                                try {
                                    const conceptLayer = ConceptLayerFactory({
                                        conceptDocument: conceptDocument,
                                        parentProfile: new ProfileVersionModel({
                                            iri: 'parent_profile_id',
                                            name: 'profile_name',
                                            description: 'profile_description',
                                        }),
                                    });
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/There are interaction component lists populated that do not support interactionType matching/);
                            });
                        });

                        describe('and only the `source` or `target` supported interaction component lists are populated.', () => {
                            test('it should return a concept model with the correct values.', async () => {
                                conceptDocument.activityDefinition.source = [{ id: 'ben' }, { id: 'chris' }, { id: 'troy' }];
                                conceptDocument.activityDefinition.target = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];

                                const conceptLayer = ConceptLayerFactory({
                                    conceptDocument: conceptDocument,
                                    parentProfile: new ProfileVersionModel({
                                        iri: 'parent_profile_id',
                                        name: 'profile_name',
                                        description: 'profile_description',
                                    }),
                                });
                                const conceptModel = await conceptLayer.scanProfileComponentLayer();

                                expect(conceptModel.type).toEqual('Activity');
                                expect(conceptModel.conceptType).toEqual('Activity');
                                expect(conceptModel.iri).toEqual('activity1_id');
                                expect(conceptModel.contextIri).toEqual('some_context');
                                expect(conceptModel.name).toEqual('activity1_name');
                                expect(conceptModel.description).toEqual('activity1_description');
                                expect(conceptModel.activityType).toEqual('http://adlnet.gov/expapi/activities/cmi.interaction');
                                expect(conceptModel.extensions.extension1).toEqual('some_extension_iri');
                                expect(conceptModel.moreInformation).toEqual('some_more_info');
                                expect(conceptModel.interactionType).toEqual('matching');
                                expect([...conceptModel.correctResponsesPattern]).toStrictEqual(['ben[.]3[,]chris[.]2[,]troy[.]4']);
                                expect([...conceptModel.source]).toStrictEqual([{ id: 'ben' }, { id: 'chris' }, { id: 'troy' }]);
                                expect([...conceptModel.target]).toStrictEqual([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
                            });
                        });
                    });

                    describe('and interactionType is `performance`', () => {
                        beforeEach(() => {
                            conceptDocument.activityDefinition.interactionType = 'performance';
                            conceptDocument.activityDefinition.correctResponsesPattern = ['pong[.]1:[,]dg[.]:10[,]lunch[.]'];
                        });

                        describe('and a supported interaction component list other than `steps` is populated', () => {
                            test('it should throw an error.', () => {
                                conceptDocument.activityDefinition.scale = [{ id: 'likert_0' }];

                                let error;
                                try {
                                    const conceptLayer = ConceptLayerFactory({
                                        conceptDocument: conceptDocument,
                                        parentProfile: new ProfileVersionModel({
                                            iri: 'parent_profile_id',
                                            name: 'profile_name',
                                            description: 'profile_description',
                                        }),
                                    });
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/There are interaction component lists populated that do not support interactionType performance/);
                            });
                        });

                        describe('and only the `steps` supported interaction component list is populated.', () => {
                            test('it should return a concept model with the correct values.', async () => {
                                conceptDocument.activityDefinition.steps = [{ id: 'pong' }, { id: 'dg' }, { id: 'lunch' }];

                                const conceptLayer = ConceptLayerFactory({
                                    conceptDocument: conceptDocument,
                                    parentProfile: new ProfileVersionModel({
                                        iri: 'parent_profile_id',
                                        name: 'profile_name',
                                        description: 'profile_description',
                                    }),
                                });
                                const conceptModel = await conceptLayer.scanProfileComponentLayer();

                                expect(conceptModel.type).toEqual('Activity');
                                expect(conceptModel.conceptType).toEqual('Activity');
                                expect(conceptModel.iri).toEqual('activity1_id');
                                expect(conceptModel.contextIri).toEqual('some_context');
                                expect(conceptModel.name).toEqual('activity1_name');
                                expect(conceptModel.description).toEqual('activity1_description');
                                expect(conceptModel.activityType).toEqual('http://adlnet.gov/expapi/activities/cmi.interaction');
                                expect(conceptModel.extensions.extension1).toEqual('some_extension_iri');
                                expect(conceptModel.moreInformation).toEqual('some_more_info');
                                expect(conceptModel.interactionType).toEqual('performance');
                                expect([...conceptModel.correctResponsesPattern]).toStrictEqual(['pong[.]1:[,]dg[.]:10[,]lunch[.]']);
                                expect([...conceptModel.steps]).toStrictEqual([{ id: 'pong' }, { id: 'dg' }, { id: 'lunch' }]);
                            });
                        });
                    });

                    describe('and interactionType is `likert`', () => {
                        beforeEach(() => {
                            conceptDocument.activityDefinition.interactionType = 'likert';
                            conceptDocument.activityDefinition.correctResponsesPattern = ['likert_3'];
                        });

                        describe('and a supported interaction component list other than `scale` is populated', () => {
                            test('it should throw an error.', () => {
                                conceptDocument.activityDefinition.steps = [{ id: 'pong' }, { id: 'dg' }, { id: 'lunch' }];

                                let error;
                                try {
                                    const conceptLayer = ConceptLayerFactory({
                                        conceptDocument: conceptDocument,
                                        parentProfile: new ProfileVersionModel({
                                            iri: 'parent_profile_id',
                                            name: 'profile_name',
                                            description: 'profile_description',
                                        }),
                                    });
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/There are interaction component lists populated that do not support interactionType likert/);
                            });
                        });

                        describe('and only the `scale` supported interaction component list is populated.', () => {
                            test('it should return a concept model with the correct values.', async () => {
                                conceptDocument.activityDefinition.scale = [{ id: 'likert_1' }, { id: 'likert_2' }, { id: 'likert_3' }];

                                const conceptLayer = ConceptLayerFactory({
                                    conceptDocument: conceptDocument,
                                    parentProfile: new ProfileVersionModel({
                                        iri: 'parent_profile_id',
                                        name: 'profile_name',
                                        description: 'profile_description',
                                    }),
                                });
                                const conceptModel = await conceptLayer.scanProfileComponentLayer();

                                expect(conceptModel.type).toEqual('Activity');
                                expect(conceptModel.conceptType).toEqual('Activity');
                                expect(conceptModel.iri).toEqual('activity1_id');
                                expect(conceptModel.contextIri).toEqual('some_context');
                                expect(conceptModel.name).toEqual('activity1_name');
                                expect(conceptModel.description).toEqual('activity1_description');
                                expect(conceptModel.activityType).toEqual('http://adlnet.gov/expapi/activities/cmi.interaction');
                                expect(conceptModel.extensions.extension1).toEqual('some_extension_iri');
                                expect(conceptModel.moreInformation).toEqual('some_more_info');
                                expect(conceptModel.interactionType).toEqual('likert');
                                expect([...conceptModel.correctResponsesPattern]).toStrictEqual(['likert_3']);
                                expect([...conceptModel.scale]).toStrictEqual([{ id: 'likert_1' }, { id: 'likert_2' }, { id: 'likert_3' }]);
                            });
                        });
                    });
                });

                describe('if it does not have at least a one property that is not @context', () => {
                    test('it should throw an error.', () => {
                        let error;
                        try {
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    type: 'Activity',
                                    id: 'concept_1',
                                    activityDefinition: {},
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept activityDefinition property is missing the @context property/);

                        try {
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    type: 'Activity',
                                    id: 'concept_1',
                                    activityDefinition: {
                                        '@context': 'some_context',
                                    },
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept has an empty activityDefinition property/);
                    });
                });
            });
        });
    });
});

describe('ConceptLayer#ScanSubcomponentLayer', () => {
    describe('when the concept type has no subcomponent', () => {
        test('it should just return the unmodified model.', async () => {
            const profileConcepts = [
                new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
            ];
            let conceptLayer = ConceptLayerFactory({
                conceptDocument: {
                    id: 'concept1_id',
                    type: 'StateResource',
                    prefLabel: { en: 'test_name' },
                    definition: { en: 'test_description' },
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            let profileCompModel = await conceptLayer.scanProfileComponentLayer();
            let conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);

            expect(conceptModel).toStrictEqual(profileCompModel);

            conceptLayer = ConceptLayerFactory({
                conceptDocument: {
                    id: 'concept1_id',
                    type: 'Activity',
                    activityDefinition: {
                        '@context': 'some_context',
                        name: 'activity_1',
                    },
                },
                parentProfile: new ProfileVersionModel({
                    iri: 'parent_profile_id',
                    name: 'profile_name',
                    description: 'profile_description',
                }),
            });
            profileCompModel = await conceptLayer.scanProfileComponentLayer();
            conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);

            expect(conceptModel).toStrictEqual(profileCompModel);
        });
    });

    describe('Concept#SimilarTerms', () => {
        describe('if there are duplicate concept ids in the terms', () => {
            test('it should throw an error.', async () => {
                const profileConcepts = [
                    new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                    new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                    new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
                ];
                const broaderDoc = ['concept2_id', 'concept4_id', 'concept2_id'];
                const conceptLayer = ConceptLayerFactory({
                    conceptDocument: {
                        id: 'concept1_id',
                        type: 'Verb',
                        prefLabel: { en: 'test_name' },
                        definition: { en: 'test_description' },
                        broader: broaderDoc,
                    },
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'profile_name',
                        description: 'profile_description',
                    }),
                });

                let error;
                try {
                    const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/Concept concept1_id has duplicate concepts in property broader/);
            });
        });

        describe('if the terms are to be in this profile version', () => {
            describe('and all the concepts are in this profile version', () => {
                test('it should return a conceptModel with a the correct similar term entries.', async () => {
                    const profileConcepts = [
                        new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                        new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                        new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
                    ];
                    const broaderDoc = ['concept2_id', 'concept3_id'];
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            id: 'concept1_id',
                            type: 'Verb',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                            broader: broaderDoc,
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });
                    const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);

                    expect(conceptModel.similarTerms.map(t => t.relationType).every(t => t === 'broader'))
                        .toBeTruthy();
                    expect(conceptModel.similarTerms.length).toEqual(2);
                    expect([...conceptModel.similarTerms.map(t => t.concept.iri).sort()])
                        .toEqual(broaderDoc.sort());
                });
            });

            describe('and there are concepts not in this profile', () => {
                test('it should throw an error.', async () => {
                    const profileConcepts = [
                        new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                        new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                        new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
                    ];
                    const broaderDoc = ['concept2_id', 'concept4_id'];
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            id: 'concept1_id',
                            type: 'Verb',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                            broader: broaderDoc,
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    let error;
                    try {
                        const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/Concept concept4_id cannot have a broader relation because it is not part of this profile version/);
                });
            });
        });

        describe('if the terms are to be outside of this profile version', () => {
            describe('and the terms can be found on the server', () => {
                let existingConcept;
                beforeEach(async () => {
                    existingConcept = new ConceptModel({ iri: 'concept5_id', name: 'concept_5' });
                    await existingConcept.save();
                });

                afterEach(async () => {
                    await existingConcept.remove();
                });

                test('it should return a conceptModel with a the correct similar term entries.', async () => {
                    const profileConcepts = [
                        new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                        new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                        new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
                    ];

                    const broadMatchDoc = ['concept5_id'];
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            id: 'concept1_id',
                            type: 'Verb',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                            broadMatch: broadMatchDoc,
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });
                    const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);

                    expect(conceptModel.similarTerms.map(t => t.relationType).every(t => t === 'broadMatch'))
                        .toBeTruthy();
                    expect(conceptModel.similarTerms.length).toEqual(1);
                    expect([...conceptModel.similarTerms.map(t => t.concept.iri).sort()])
                        .toEqual(broadMatchDoc.sort());
                });
            });

            describe('and there are concepts not found on the server', () => {
                let profileConcepts;
                let conceptDocument;
                beforeEach(() => {
                    profileConcepts = [
                        new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                        new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                        new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
                    ];

                    conceptDocument = {
                        id: 'concept1_id',
                        type: 'Verb',
                        prefLabel: { en: 'test_name' },
                        definition: { en: 'test_description' },
                        broadMatch: ['concept5_id'],
                    };
                });

                test('it should create and save a parentless version of that concept on the server and add it.', async () => {
                    const broadMatchDoc = ['concept5_id'];
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: conceptDocument,
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                    const parentlessConcept = await ConceptModel.findOne({ iri: 'concept5_id' });

                    expect(parentlessConcept).toBeTruthy();
                    expect(parentlessConcept.iri).toEqual('concept5_id');
                    expect(parentlessConcept.parentProfile).toBeFalsy();

                    expect(conceptModel.similarTerms.map(t => t.relationType).every(t => t === 'broadMatch'))
                        .toBeTruthy();
                    expect(conceptModel.similarTerms.length).toEqual(1);
                    expect([...conceptModel.similarTerms.map(t => t.concept.iri).sort()])
                        .toEqual(broadMatchDoc.sort());

                    await parentlessConcept.remove();
                });

                describe('and the same concept is also another similar term', () => {
                    let parentlessConcept;
                    let conceptModel;
                    beforeEach(async () => {
                        conceptDocument.narrowMatch = ['concept5_id'];

                        const conceptLayer = new ConceptLayerFactory({
                            conceptDocument: conceptDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });

                        conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                        parentlessConcept = await ConceptModel.findOne({ iri: 'concept5_id' });
                    });

                    afterEach(async () => {
                        await parentlessConcept.remove();
                    });

                    test('it should return a a concept model with the the similar terms concepts as parentless concepts.', () => {
                        expect(conceptModel.similarTerms.length).toEqual(2);
                        expect(conceptModel.similarTerms.find(s => s.relationType === 'narrowMatch').concept.iri).toEqual('concept5_id');
                        expect(conceptModel.similarTerms.find(s => s.relationType === 'broadMatch').concept.iri).toEqual('concept5_id');
                        expect(parentlessConcept.iri).toEqual('concept5_id');
                    });

                    test('it should have the exact parentless concept as both similar terms.', () => {
                        expect(conceptModel.similarTerms.find(s => s.relationType === 'narrowMatch').concept._id.toString())
                            .toEqual(conceptModel.similarTerms.find(s => s.relationType === 'broadMatch').concept._id.toString());
                    });
                });

                describe('and the concept is also a similar term in another concept', () => {
                    let conceptLayer;
                    let parentlessConcept;
                    let otherConceptDocument;
                    let otherConceptLayer;
                    let conceptModels;
                    beforeEach(async () => {
                        const conceptLayer = new ConceptLayerFactory({
                            conceptDocument: conceptDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });

                        otherConceptDocument = {
                            id: 'concept2_id',
                            type: 'Verb',
                            prefLabel: { en: 'concept_2' },
                            definition: { en: 'test_description_2' },
                            broadMatch: ['concept5_id'],
                        };
                        otherConceptLayer = new ConceptLayerFactory({
                            conceptDocument: otherConceptDocument,
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });

                        // conceptModels = await Promise.all([conceptLayer, otherConceptLayer].map(
                        //     async c => c.scanSubcomponentLayer(profileConcepts),
                        // ));
                        conceptModels = [];
                        for (const layer of [conceptLayer, otherConceptLayer]) {
                            const model = await layer.scanSubcomponentLayer(profileConcepts);
                            conceptModels.push(model);
                        }

                        parentlessConcept = await ConceptModel.findOne({ iri: 'concept5_id' });
                    });

                    afterEach(async () => {
                        await parentlessConcept.remove();
                    });

                    test('it should return an array of concept models where all instances of the shared similar term are the exact same parentless concept.', () => {
                        expect(conceptModels[0].similarTerms[0].concept._id.toString())
                            .toEqual(conceptModels[1].similarTerms[0].concept._id.toString());
                    });
                });
            });
        });
    });

    describe('Concept#RecommendedTerms', () => {
        describe('when the concept document has no recommended terms properties', () => {
            test('it should return a model an with an empty recommendedTerms property.', async () => {
                const profileConcepts = [
                    new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                    new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Activity' }),
                    new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Activity' }),
                ];
                const conceptLayer = ConceptLayerFactory({
                    conceptDocument: {
                        id: 'concept1_id',
                        type: 'ContextExtension',
                        prefLabel: { en: 'test_name' },
                        definition: { en: 'test_description' },
                    },
                    parentProfile: new ProfileVersionModel({
                        iri: 'parent_profile_id',
                        name: 'profile_name',
                        description: 'profile_description',
                    }),
                });
                const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);

                expect(conceptModel.recommendedTerms.length).toEqual(0);
            });
        });

        describe('when the concept document has a recommendedVerbs property', () => {
            describe('and the concept is a ContextExtension or a ResultExtension type', () => {
                describe('if there are duplicate concept ids in the recommendedVerbs property', () => {
                    test('it should throw an error.', async () => {
                        const profileConcepts = [
                            new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                            new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                            new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
                        ];
                        const conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                id: 'concept1_id',
                                type: 'ContextExtension',
                                prefLabel: { en: 'test_name' },
                                definition: { en: 'test_description' },
                                recommendedVerbs: ['concept2_id', 'concept3_id', 'concept2_id'],
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });

                        let error;
                        let conceptModel;
                        try {
                            conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept concept1_id has duplicate concepts in property recommendedVerbs/);
                    });
                });

                describe('and the concepts in the recommendedVerbs array are in this profile version', () => {
                    describe('and the concepts in the recommendedVerbs property are are not verbs', () => {
                        test('it should throw an error.', async () => {
                            const profileConcepts = [
                                new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Activity' }),
                            ];
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    id: 'concept1_id',
                                    type: 'ContextExtension',
                                    prefLabel: { en: 'test_name' },
                                    definition: { en: 'test_description' },
                                    recommendedVerbs: ['concept2_id', 'concept3_id'],
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });

                            let error;
                            try {
                                const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/Concept concept.+ is not a Verb and therefore cannot be a recommended verb/);
                        });
                    });

                    describe('and the concepts in the recommendedVerbs property are verbs', () => {
                        test('it should return a concept model with thoses recommendedVerbs in the recommendedTerms property.', async () => {
                            const profileConcepts = [
                                new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Verb' }),
                                new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Verb' }),
                            ];
                            const recommendedVerbs = ['concept2_id', 'concept3_id'];
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    id: 'concept1_id',
                                    type: 'ContextExtension',
                                    prefLabel: { en: 'test_name' },
                                    definition: { en: 'test_description' },
                                    recommendedVerbs: recommendedVerbs,
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });
                            const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);

                            expect(conceptModel.recommendedTerms.length).toEqual(2);
                            expect([...conceptModel.recommendedTerms.map(r => r.iri)]).toStrictEqual(recommendedVerbs);
                        });
                    });
                });

                describe('and the concepts in the recommendedVerbs array are on the server', () => {
                    let existingConcept;
                    afterEach(async () => {
                        await existingConcept.remove();
                    });

                    describe('and the concepts in the recommendedVerbs property are are not verbs', () => {
                        test('it should throw an error.', async () => {
                            existingConcept = new ConceptModel({ iri: 'existing_concept', name: 'existing_concept', type: 'Activity' });
                            await existingConcept.save();
                            const profileConcepts = [
                                new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Activity' }),
                            ];
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    id: 'concept1_id',
                                    type: 'ContextExtension',
                                    prefLabel: { en: 'test_name' },
                                    definition: { en: 'test_description' },
                                    recommendedVerbs: ['existing_concept'],
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });

                            let error;
                            try {
                                const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/Concept existing_concept is not a Verb and therefore cannot be a recommended verb/);
                        });
                    });

                    describe('and the concepts in the recommendedVerbs property are are verbs', () => {
                        test('it should return a concept model with thoses recommendedVerbs in the recommendedTerms property.', async () => {
                            existingConcept = new ConceptModel({ iri: 'existing_concept', name: 'existing_concept', type: 'Verb' });
                            await existingConcept.save();
                            const profileConcepts = [
                                new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Activity' }),
                            ];
                            const recommendedVerbs = ['existing_concept'];
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    id: 'concept1_id',
                                    type: 'ContextExtension',
                                    prefLabel: { en: 'test_name' },
                                    definition: { en: 'test_description' },
                                    recommendedVerbs: recommendedVerbs,
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });
                            const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);

                            expect(conceptModel.recommendedTerms.length).toEqual(1);
                            expect([...conceptModel.recommendedTerms.map(r => r.iri)]).toStrictEqual(recommendedVerbs);
                        });
                    });
                });

                describe('and the concepts in the recommendedVerbs array are not in this profile version or on the server', () => {
                    test('it should return the model with parentless concepts that are now on the server.', async () => {
                        const profileConcepts = [
                            new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                            new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Activity' }),
                            new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Activity' }),
                        ];
                        const conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                id: 'concept1_id',
                                type: 'ContextExtension',
                                prefLabel: { en: 'test_name' },
                                definition: { en: 'test_description' },
                                recommendedVerbs: ['concept5_id', 'concept6_id'],
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });

                        const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                        const parentlessConcept1 = await ConceptModel.findOne({ iri: 'concept5_id' });
                        const parentlessConcept2 = await ConceptModel.findOne({ iri: 'concept6_id' });

                        expect(conceptModel.iri).toEqual('concept1_id');
                        expect(conceptModel.recommendedTerms.length).toEqual(2);
                        expect(conceptModel.recommendedTerms.map(t => t._id).includes(parentlessConcept1._id)).toBeTruthy();
                        expect(conceptModel.recommendedTerms.map(t => t._id).includes(parentlessConcept2._id)).toBeTruthy();
                        expect(parentlessConcept1).toBeTruthy();
                        expect(parentlessConcept1.iri).toEqual('concept5_id');
                        expect(parentlessConcept2).toBeTruthy();
                        expect(parentlessConcept2.iri).toEqual('concept6_id');

                        await parentlessConcept1.remove();
                        await parentlessConcept2.remove();
                    });
                });
            });

            describe('and the concept is not a ContextExtension or a ResultExtension type', () => {
                test('it should throw an error.', async () => {
                    const profileConcepts = [
                        new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                        new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                        new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
                    ];
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            id: 'concept1_id',
                            type: 'ActivityExtension',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                            recommendedVerbs: ['rec_verb_1'],
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    let error;
                    try {
                        const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/Concept concept1_id has a recommendedVerbs property but is not a ContextExtension or a ResultExtension type/);
                });
            });
        });

        describe('when the concept document has a recommendedActivityTypes property', () => {
            describe('and the concept is a ActivityExtension type', () => {
                describe('if there are duplicate concept ids in the recommendedActivityTypes property', () => {
                    test('it should throw an error.', async () => {
                        const profileConcepts = [
                            new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                            new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                            new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
                        ];
                        const conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                id: 'concept1_id',
                                type: 'ActivityExtension',
                                prefLabel: { en: 'test_name' },
                                definition: { en: 'test_description' },
                                recommendedActivityTypes: ['concept2_id', 'concept3_id', 'concept2_id'],
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });

                        let error;
                        try {
                            const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                        } catch (err) {
                            error = err.message;
                        }

                        expect(error).toMatch(/Concept concept1_id has duplicate concepts in property recommendedActivityTypes/);
                    });
                });

                describe('and the concepts in the recommendedActivityTypes array are in this profile version', () => {
                    describe('and the concepts in the recommendedActivityTypes property are are not activity types', () => {
                        test('it should throw an error.', async () => {
                            const profileConcepts = [
                                new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Verb' }),
                                new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Verb' }),
                                new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Verb' }),
                            ];
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    id: 'concept1_id',
                                    type: 'ActivityExtension',
                                    prefLabel: { en: 'test_name' },
                                    definition: { en: 'test_description' },
                                    recommendedActivityTypes: ['concept2_id', 'concept3_id'],
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });

                            let error;
                            try {
                                const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/Concept concept.+ is not an ActivityType and therefore cannot be a recommended activity type/);
                        });
                    });

                    describe('and the concepts in the recommendedActivityTypes property are activity types', () => {
                        test('it should return a concept model with thoses recommendedActivityTypes in the recommendedTerms property.', async () => {
                            const profileConcepts = [
                                new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'ActivityType' }),
                                new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'ActivityType' }),
                            ];
                            const recommendedActivityTypes = ['concept2_id', 'concept3_id'];
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    id: 'concept1_id',
                                    type: 'ActivityExtension',
                                    prefLabel: { en: 'test_name' },
                                    definition: { en: 'test_description' },
                                    recommendedActivityTypes: recommendedActivityTypes,
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });
                            const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);

                            expect(conceptModel.recommendedTerms.length).toEqual(2);
                            expect([...conceptModel.recommendedTerms.map(r => r.iri)]).toStrictEqual(recommendedActivityTypes);
                        });
                    });
                });

                describe('and the concepts in the recommendedActivityTypes array are on the server', () => {
                    let existingConcept;
                    afterEach(async () => {
                        await existingConcept.remove();
                    });

                    describe('and the concepts in the recommendedActivityTypes property are are not activity types', () => {
                        test('it should throw an error.', async () => {
                            existingConcept = new ConceptModel({ iri: 'existing_concept', name: 'existing_concept', type: 'Activity' });
                            await existingConcept.save();
                            const profileConcepts = [
                                new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Activity' }),
                            ];
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    id: 'concept1_id',
                                    type: 'ActivityExtension',
                                    prefLabel: { en: 'test_name' },
                                    definition: { en: 'test_description' },
                                    recommendedActivityTypes: ['existing_concept'],
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });

                            let error;
                            try {
                                const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/Concept existing_concept is not an ActivityType and therefore cannot be a recommended activity type/);
                        });
                    });

                    describe('and the concepts in the recommendedActivityTypes property are are activity types', () => {
                        test('it should return a concept model with thoses recommendedActivityTypes in the recommendedTerms property.', async () => {
                            existingConcept = new ConceptModel({ iri: 'existing_concept', name: 'existing_concept', type: 'ActivityType' });
                            await existingConcept.save();
                            const profileConcepts = [
                                new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Activity' }),
                                new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Activity' }),
                            ];
                            const recommendedActivityTypes = ['existing_concept'];
                            const conceptLayer = ConceptLayerFactory({
                                conceptDocument: {
                                    id: 'concept1_id',
                                    type: 'ActivityExtension',
                                    prefLabel: { en: 'test_name' },
                                    definition: { en: 'test_description' },
                                    recommendedActivityTypes: recommendedActivityTypes,
                                },
                                parentProfile: new ProfileVersionModel({
                                    iri: 'parent_profile_id',
                                    name: 'profile_name',
                                    description: 'profile_description',
                                }),
                            });
                            const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);

                            expect(conceptModel.recommendedTerms.length).toEqual(1);
                            expect([...conceptModel.recommendedTerms.map(r => r.iri)]).toStrictEqual(recommendedActivityTypes);
                        });
                    });
                });

                describe('and the concepts in the recommendedActivityTypes array are not in this profile version or on the server', () => {
                    test('it should return a concept model with the recommended concepts as parentless concepts.', async () => {
                        const profileConcepts = [
                            new ConceptModel({ iri: 'concept1_id', name: 'concept_1', type: 'Activity' }),
                            new ConceptModel({ iri: 'concept2_id', name: 'concept_2', type: 'Activity' }),
                            new ConceptModel({ iri: 'concept3_id', name: 'concept_3', type: 'Activity' }),
                        ];
                        const conceptLayer = ConceptLayerFactory({
                            conceptDocument: {
                                id: 'concept1_id',
                                type: 'ActivityExtension',
                                prefLabel: { en: 'test_name' },
                                definition: { en: 'test_description' },
                                recommendedActivityTypes: ['concept5_id', 'concept6_id'],
                            },
                            parentProfile: new ProfileVersionModel({
                                iri: 'parent_profile_id',
                                name: 'profile_name',
                                description: 'profile_description',
                            }),
                        });

                        const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                        const parentlessConcept1 = await ConceptModel.findOne({ iri: 'concept5_id' });
                        const parentlessConcept2 = await ConceptModel.findOne({ iri: 'concept6_id' });

                        expect(conceptModel.iri).toEqual('concept1_id');
                        expect(conceptModel.recommendedTerms.length).toEqual(2);
                        expect(conceptModel.recommendedTerms.map(t => t._id).includes(parentlessConcept1._id)).toBeTruthy();
                        expect(conceptModel.recommendedTerms.map(t => t._id).includes(parentlessConcept2._id)).toBeTruthy();
                        expect(parentlessConcept1).toBeTruthy();
                        expect(parentlessConcept1.iri).toEqual('concept5_id');
                        expect(parentlessConcept2).toBeTruthy();
                        expect(parentlessConcept2.iri).toEqual('concept6_id');

                        await parentlessConcept1.remove();
                        await parentlessConcept2.remove();
                    });
                });
            });

            describe('and the concept is not a ActivityExtension type', () => {
                test('it should throw an error.', async () => {
                    const profileConcepts = [
                        new ConceptModel({ iri: 'concept1_id', name: 'concept_1' }),
                        new ConceptModel({ iri: 'concept2_id', name: 'concept_2' }),
                        new ConceptModel({ iri: 'concept3_id', name: 'concept_3' }),
                    ];
                    const conceptLayer = ConceptLayerFactory({
                        conceptDocument: {
                            id: 'concept1_id',
                            type: 'ContextExtension',
                            prefLabel: { en: 'test_name' },
                            definition: { en: 'test_description' },
                            recommendedActivityTypes: ['rec_verb_1'],
                        },
                        parentProfile: new ProfileVersionModel({
                            iri: 'parent_profile_id',
                            name: 'profile_name',
                            description: 'profile_description',
                        }),
                    });

                    let error;
                    try {
                        const conceptModel = await conceptLayer.scanSubcomponentLayer(profileConcepts);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/Concept concept1_id has a recommendedActivityTypes property but is not an ActivityExtension type/);
                });
            });
        });
    });
});
