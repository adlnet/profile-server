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

describe('ConceptLayerFactory#scanProfileComponentLayer', () => {
    let versionLayer;
    let conceptDocument;
    let parentProfile;
    let user;
    let otherUser;
    beforeEach(async () => {
        user = new UserModel({ email: 'an@email.com' });
        await user.save();

        otherUser = new UserModel({ email: 'another@email.com' });
        await otherUser.save();

        conceptDocument = {
            id: 'concept1_id',
            inScheme: 'parent_profile_id',
            prefLabel: {
                en: 'concept1',
            },
            definition: {
                en: 'concept1 description.',
            },
            type: 'Verb',
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

    describe('when versionLayer#versionStatus is `new`', () => {
        describe('when the concept exists on the server', () => {
            let existingConcept;
            beforeEach(async () => {
                existingConcept = new ConceptModel({
                    iri: 'concept1_id',
                    name: 'concept1',
                    description: 'concept1 description.',
                    type: 'Verb',
                    conceptType: 'Verb',
                    parentProfile: parentProfile,
                    createdBy: user,
                    updatedBy: user,
                });
                await existingConcept.save();
            });

            afterEach(async () => {
                await existingConcept.remove();
            });

            describe('and it is not different from the incoming concept', () => {
                test('it should return the concept model found on the server with the correct values.', async () => {
                    versionLayer = {
                        parentProfile: parentProfile,
                        conceptDocument: conceptDocument,
                        versionStatus: 'new',
                    };
                    const conceptLayer = new ConceptLayerFactory(versionLayer);
                    const conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel._id.toString()).toEqual(existingConcept._id.toString());
                    expect(conceptModel.iri).toEqual(conceptDocument.id);
                    expect(conceptModel.name).toEqual(conceptDocument.prefLabel.en);
                    expect(conceptModel.description).toEqual(conceptDocument.definition.en);
                    expect(conceptModel.type).toEqual(conceptDocument.type);
                    expect(conceptModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                    expect(conceptModel.createdBy._id.toString()).toEqual(user._id.toString());
                });
            });

            describe('and it is different from the incoming concept', () => {
                describe('and the changes are valid', () => {
                    describe('- adding a new prefLabel entry', () => {
                        test('it should return the the concept model found on the server with the correctly changed values.', async () => {
                            conceptDocument.prefLabel.new_lang = 'new_lang_name';

                            versionLayer = {
                                parentProfile: parentProfile,
                                conceptDocument: conceptDocument,
                                versionStatus: 'new',
                            };
                            const conceptLayer = new ConceptLayerFactory(versionLayer);
                            const conceptModel = await conceptLayer.scanProfileComponentLayer();

                            expect(conceptModel._id.toString()).toEqual(existingConcept._id.toString());
                            expect(conceptModel.translations.length).toEqual(1);
                            expect(conceptModel.translations[0].language).toEqual('new_lang');
                            expect(conceptModel.translations[0].translationName).toEqual('new_lang_name');
                            expect(conceptModel.translations[0].translationDesc).toBeFalsy();
                        });
                    });

                    describe('- adding a new definition entry', () => {
                        test('it should return the the concept model found on the server with the correctly changed values.', async () => {
                            conceptDocument.definition.new_lang = 'new_lang_desc';

                            versionLayer = {
                                parentProfile: parentProfile,
                                conceptDocument: conceptDocument,
                                versionStatus: 'new',
                            };
                            const conceptLayer = new ConceptLayerFactory(versionLayer);
                            const conceptModel = await conceptLayer.scanProfileComponentLayer();

                            expect(conceptModel._id.toString()).toEqual(existingConcept._id.toString());
                            expect(conceptModel.translations.length).toEqual(1);
                            expect(conceptModel.translations[0].language).toEqual('new_lang');
                            expect(conceptModel.translations[0].translationDesc).toEqual('new_lang_desc');
                            expect(conceptModel.translations[0].translationName).toBeFalsy();
                        });
                    });

                    describe('- adding deprecated', () => {
                        test('it should return the the concept model found on the server with the correctly changed values.', async () => {
                            conceptDocument.deprecated = true;

                            versionLayer = {
                                parentProfile: parentProfile,
                                conceptDocument: conceptDocument,
                                versionStatus: 'new',
                            };
                            const conceptLayer = new ConceptLayerFactory(versionLayer);
                            const conceptModel = await conceptLayer.scanProfileComponentLayer();

                            expect(conceptModel._id.toString()).toEqual(existingConcept._id.toString());
                            expect(conceptModel.isDeprecated).toBeTruthy();
                        });
                    });
                });

                describe('and the changes are not valid', () => {
                    describe('- updating an existing prefLabel entry', () => {
                        test('it should throw an error.', async () => {
                            conceptDocument.prefLabel.en = 'new_concept1_name';

                            versionLayer = {
                                parentProfile: parentProfile,
                                conceptDocument: conceptDocument,
                                versionStatus: 'new',
                            };
                            const conceptLayer = new ConceptLayerFactory(versionLayer);

                            let error;
                            try {
                                const conceptModel = await conceptLayer.scanProfileComponentLayer();
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/prefLabel.en cannot be updated on published concept concept1_id/);
                        });
                    });

                    describe('- updating an existing definition entry', () => {
                        test('it should throw an error.', async () => {
                            conceptDocument.definition.en = 'new_concept1_name';

                            versionLayer = {
                                parentProfile: parentProfile,
                                conceptDocument: conceptDocument,
                                versionStatus: 'new',
                            };
                            const conceptLayer = new ConceptLayerFactory(versionLayer);

                            let error;
                            try {
                                const conceptModel = await conceptLayer.scanProfileComponentLayer();
                            } catch (err) {
                                error = err.message;
                            }

                            expect(error).toMatch(/definition.en cannot be updated on published concept concept1_id/);
                        });
                    });

                    describe('ConceptType: Verb', () => {
                        describe('- adding a similar term array', () => {
                            test('it should throw an error.', async () => {
                                conceptDocument.broader = ['some_other_concept_id'];

                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/broader cannot be added to published concept concept1_id/);
                            });
                        });

                        describe('- removing a similar term', () => {
                            let someOtherConcept;
                            beforeEach(async () => {
                                someOtherConcept = new ConceptModel({
                                    iri: 'some_other_concept_id',
                                    name: 'some_other_concept',
                                    description: 'some other concept',
                                    type: 'Verb',
                                    conceptType: 'Verb',
                                });
                                await someOtherConcept.save();

                                existingConcept.similarTerms = [{
                                    relationType: 'broader',
                                    concept: someOtherConcept,
                                }];
                                await existingConcept.save();
                            });

                            afterEach(async () => {
                                await someOtherConcept.remove();
                            });

                            test('it should throw an error.', async () => {
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/broader cannot be deleted from published concept concept1_id/);
                            });
                        });

                        describe('- updating a similar term array', () => {
                            let someOtherConcept;
                            beforeEach(async () => {
                                someOtherConcept = new ConceptModel({
                                    iri: 'some_other_concept_id',
                                    name: 'some_other_concept',
                                    description: 'some other concept',
                                    type: 'Verb',
                                    conceptType: 'Verb',
                                });
                                await someOtherConcept.save();

                                existingConcept.similarTerms = [{
                                    relationType: 'broader',
                                    concept: someOtherConcept,
                                }];
                                await existingConcept.save();
                            });

                            afterEach(async () => {
                                await someOtherConcept.remove();
                            });

                            test('it should throw an error.', async () => {
                                conceptDocument.broader = ['some_other_concept_id', 'another_concept_id'];

                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/broader cannot be added to published concept concept1_id/);
                            });
                        });
                    });

                    describe('ConceptType: Extention', () => {
                        describe('Concept#recommendedVerbs', () => {
                            beforeEach(async () => {
                                conceptDocument.type = 'ContextExtension';
                                existingConcept.type = 'ContextExtension';
                                existingConcept.conceptType = 'Extension';
                                await existingConcept.save();
                            });

                            describe('- adding a recommenedVerb array', () => {
                                test('it should throw an error.', async () => {
                                    conceptDocument.recommendedVerbs = ['some_other_concept_id'];

                                    versionLayer = {
                                        parentProfile: parentProfile,
                                        conceptDocument: conceptDocument,
                                        versionStatus: 'new',
                                    };
                                    const conceptLayer = new ConceptLayerFactory(versionLayer);

                                    let error;
                                    try {
                                        const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                    } catch (err) {
                                        error = err.message;
                                    }

                                    expect(error).toMatch(/recommendedVerbs cannot be added to published concept concept1_id/);
                                });
                            });

                            describe('- updating a recommendedVerb array', () => {
                                let someOtherConcept;
                                beforeEach(async () => {
                                    someOtherConcept = new ConceptModel({
                                        iri: 'some_other_concept_id',
                                        name: 'some_other_concept',
                                        description: 'some other concept',
                                        type: 'Verb',
                                        conceptType: 'Verb',
                                    });
                                    await someOtherConcept.save();

                                    existingConcept.recommendedTerms = [someOtherConcept];
                                    await existingConcept.save();
                                });

                                afterEach(async () => {
                                    await someOtherConcept.remove();
                                });

                                test('it should throw an error.', async () => {
                                    conceptDocument.recommendedVerbs = ['some_other_concept_id', 'another_concept_id'];

                                    versionLayer = {
                                        parentProfile: parentProfile,
                                        conceptDocument: conceptDocument,
                                        versionStatus: 'new',
                                    };
                                    const conceptLayer = new ConceptLayerFactory(versionLayer);

                                    let error;
                                    try {
                                        const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                    } catch (err) {
                                        error = err.message;
                                    }

                                    expect(error).toMatch(/recommendedVerbs cannot be added to published concept concept1_id/);
                                });
                            });

                            describe('- removing recommendedVerbs', () => {
                                let someOtherConcept;
                                beforeEach(async () => {
                                    someOtherConcept = new ConceptModel({
                                        iri: 'some_other_concept_id',
                                        name: 'some_other_concept',
                                        description: 'some other concept',
                                        type: 'Verb',
                                        conceptType: 'Verb',
                                    });
                                    await someOtherConcept.save();

                                    existingConcept.recommendedTerms = [someOtherConcept];
                                    await existingConcept.save();
                                });

                                afterEach(async () => {
                                    await someOtherConcept.remove();
                                });

                                test('it should throw an error.', async () => {
                                    versionLayer = {
                                        parentProfile: parentProfile,
                                        conceptDocument: conceptDocument,
                                        versionStatus: 'new',
                                    };
                                    const conceptLayer = new ConceptLayerFactory(versionLayer);

                                    let error;
                                    try {
                                        const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                    } catch (err) {
                                        error = err.message;
                                    }

                                    expect(error).toMatch(/recommendedVerbs cannot be deleted from published concept concept1_id/);
                                });
                            });
                        });

                        describe('Concept#recommendedActivityType', () => {
                            beforeEach(async () => {
                                conceptDocument.type = 'ActivityExtension';
                                existingConcept.type = 'ActivityExtension';
                                existingConcept.conceptType = 'Extension';
                                await existingConcept.save();
                            });

                            describe('- adding a recommendedActivityType array', () => {
                                test('it should throw an error.', async () => {
                                    conceptDocument.recommendedActivityTypes = ['some_other_concept_id'];

                                    versionLayer = {
                                        parentProfile: parentProfile,
                                        conceptDocument: conceptDocument,
                                        versionStatus: 'new',
                                    };
                                    const conceptLayer = new ConceptLayerFactory(versionLayer);

                                    let error;
                                    try {
                                        const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                    } catch (err) {
                                        error = err.message;
                                    }

                                    expect(error).toMatch(/recommendedActivityTypes cannot be added to published concept concept1_id/);
                                });
                            });

                            describe('- updating a recommendedAcitivityType array', () => {
                                let someOtherConcept;
                                beforeEach(async () => {
                                    someOtherConcept = new ConceptModel({
                                        iri: 'some_other_concept_id',
                                        name: 'some_other_concept',
                                        description: 'some other concept',
                                        type: 'ActivityType',
                                        conceptType: 'ActivityType',
                                    });
                                    await someOtherConcept.save();

                                    existingConcept.recommendedTerms = [someOtherConcept];
                                    await existingConcept.save();
                                });

                                afterEach(async () => {
                                    await someOtherConcept.remove();
                                });

                                test('it should throw an error.', async () => {
                                    conceptDocument.recommendedActivityTypes = ['some_other_concept_id', 'another_concept_id'];

                                    versionLayer = {
                                        parentProfile: parentProfile,
                                        conceptDocument: conceptDocument,
                                        versionStatus: 'new',
                                    };
                                    const conceptLayer = new ConceptLayerFactory(versionLayer);

                                    let error;
                                    try {
                                        const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                    } catch (err) {
                                        error = err.message;
                                    }

                                    expect(error).toMatch(/recommendedActivityTypes cannot be added to published concept concept1_id/);
                                });
                            });

                            describe('- removing a recommendedActivityType array', () => {
                                let someOtherConcept;
                                beforeEach(async () => {
                                    someOtherConcept = new ConceptModel({
                                        iri: 'some_other_concept_id',
                                        name: 'some_other_concept',
                                        description: 'some other concept',
                                        type: 'ActivityType',
                                        conceptType: 'ActivityType',
                                    });
                                    await someOtherConcept.save();

                                    existingConcept.recommendedTerms = [someOtherConcept];
                                    await existingConcept.save();
                                });

                                afterEach(async () => {
                                    await someOtherConcept.remove();
                                });

                                test('it should throw an error.', async () => {
                                    versionLayer = {
                                        parentProfile: parentProfile,
                                        conceptDocument: conceptDocument,
                                        versionStatus: 'new',
                                    };
                                    const conceptLayer = new ConceptLayerFactory(versionLayer);

                                    let error;
                                    try {
                                        const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                    } catch (err) {
                                        error = err.message;
                                    }

                                    expect(error).toMatch(/recommendedActivityTypes cannot be deleted from published concept concept1_id/);
                                });
                            });
                        });
                    });

                    describe('ConceptType: Document', () => {
                        beforeEach(async () => {
                            conceptDocument.type = 'StateResource';
                            conceptDocument.contentType = 'application/text';
                            existingConcept.type = 'StateResource';
                            existingConcept.conceptType = 'Document';
                            existingConcept.mediaType = 'application/text';
                            await existingConcept.save();
                        });

                        describe('- updating mediaType', () => {
                            test('it should throw an error.', async () => {
                                conceptDocument.contentType = 'json/application';
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/contentType cannot be updated on published concept concept1_id/);
                            });
                        });

                        describe('- adding a schema', () => {
                            test('it should throw an error.', async () => {
                                conceptDocument.schema = 'some schema';
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/schema cannot be added to published concept concept1_id/);
                            });
                        });

                        describe('- updating a schema', () => {
                            beforeEach(async () => {
                                existingConcept.schemaString = 'some schema';
                                await existingConcept.save();
                            });

                            test('it should throw an error.', async () => {
                                conceptDocument.schema = 'some other schema';
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/schema cannot be updated on published concept concept1_id/);
                            });
                        });

                        describe('- removing a schema', () => {
                            beforeEach(async () => {
                                existingConcept.schemaString = 'some schema';
                                await existingConcept.save();
                            });

                            test('it should throw an error.', async () => {
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/schema cannot be deleted from published concept concept1_id/);
                            });
                        });

                        describe('- adding a inlineSchema', () => {
                            test('it should throw an error.', async () => {
                                conceptDocument.inlineSchema = 'some inlineSchema';
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/inlineSchema cannot be added to published concept concept1_id/);
                            });
                        });

                        describe('- updating a inlineSchema', () => {
                            beforeEach(async () => {
                                existingConcept.inlineSchema = 'some inlineSchema';
                                await existingConcept.save();
                            });

                            test('it should throw an error.', async () => {
                                conceptDocument.inlineSchema = 'some other inlineSchema';
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/inlineSchema cannot be updated on published concept concept1_id/);
                            });
                        });

                        describe('- removing a inlineSchema', () => {
                            beforeEach(async () => {
                                existingConcept.inlineSchema = 'some inlineSchema';
                                await existingConcept.save();
                            });

                            test('it should throw an error.', async () => {
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/inlineSchema cannot be deleted from published concept concept1_id/);
                            });
                        });
                    });

                    describe('ConceptType: Activity', () => {
                        beforeEach(async () => {
                            conceptDocument.type = 'Activity';
                            conceptDocument.activityDefinition = {
                                name: { en: 'concept1' },
                                description: { en: 'concept1 description.' },
                                '@context': 'https://w3id.org/xapi/profiles/activity-context',
                                type: 'some_activity_type',
                            };
                            existingConcept.type = 'Activity';
                            existingConcept.conceptType = 'Activity';
                            existingConcept.activityType = 'some_activity_type';
                            await existingConcept.save();
                        });

                        describe('- adding activityDefinition properties', () => {
                            test('it should throw an error.', async () => {
                                conceptDocument.activityDefinition.moreInfo = 'some_more_info';
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/activityDefinition.moreInfo cannot be added to published concept concept1_id/);
                            });
                        });

                        describe('- updating activityDefinition properties', () => {
                            test('it should throw an error.', async () => {
                                conceptDocument.activityDefinition.type = 'some_other_activity_type';
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/activityDefinition.type cannot be updated on published concept concept1_id/);
                            });
                        });

                        describe('- removing activityDefinition properties', () => {
                            test('it should throw an error.', async () => {
                                delete conceptDocument.activityDefinition.type;
                                versionLayer = {
                                    parentProfile: parentProfile,
                                    conceptDocument: conceptDocument,
                                    versionStatus: 'new',
                                };
                                const conceptLayer = new ConceptLayerFactory(versionLayer);

                                let error;
                                try {
                                    const conceptModel = await conceptLayer.scanProfileComponentLayer();
                                } catch (err) {
                                    error = err.message;
                                }

                                expect(error).toMatch(/activityDefinition.type cannot be deleted from published concept concept1_id/);
                            });
                        });
                    });
                });
            });
        });
    });
});
