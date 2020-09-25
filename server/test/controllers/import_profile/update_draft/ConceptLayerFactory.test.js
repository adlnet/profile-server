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
const UserModel = require('../../../../ODM/models').user;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
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
    let conceptDocument;
    let parentProfile;
    let conceptLayer;
    let conceptModel;
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
            type: 'ContextExtension',
            context: 'context_iri',
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
        describe('when the concept exists on the server', () => {
            let existingConcept;
            beforeEach(async () => {
                existingConcept = new ConceptModel({
                    iri: 'concept1_id',
                    name: 'concept1',
                    description: 'concept1 description.',
                    type: 'ContextExtension',
                    conceptType: 'Extension',
                    contextIri: 'context_iri',
                    parentProfile: parentProfile,
                    createdBy: user,
                    updatedBy: user,
                });
                await existingConcept.save();
            });

            afterEach(async () => {
                await existingConcept.remove();
            });

            describe('and nothing is different in the concept', () => {
                test('it should return a model that is exactly like the existing concept', async () => {
                    conceptLayer = new ConceptLayerFactory({
                        conceptDocument: conceptDocument,
                        parentProfile: parentProfile,
                        versionStatus: 'draft',
                    });

                    conceptModel = await conceptLayer.scanProfileComponentLayer();

                    expect(conceptModel._id.toString()).toEqual(existingConcept._id.toString());
                    expect(conceptModel.iri).toEqual(existingConcept.iri);
                    expect(conceptModel.name).toEqual(existingConcept.name);
                    expect(conceptModel.description).toEqual(existingConcept.description);
                    expect(conceptModel.type).toEqual(existingConcept.type);
                    expect(conceptModel.conceptType).toEqual(existingConcept.conceptType);
                    expect(conceptModel.contextIri).toEqual(existingConcept.contextIri);
                    expect(conceptModel.parentProfile._id.toString()).toEqual(existingConcept.parentProfile._id.toString());
                    expect(conceptModel.updatedBy._id.toString()).toEqual(otherUser._id.toString());
                    expect(conceptModel.createdBy._id.toString()).toEqual(user._id.toString());
                });
            });

            describe('and properties have been changed from the existing', () => {
                describe('- adding a property', () => {
                    test('it should return the existing model with the expected changes.', async () => {
                        conceptDocument.inlineSchema = 'an_inlineSchema';

                        conceptLayer = new ConceptLayerFactory({
                            conceptDocument: conceptDocument,
                            parentProfile: parentProfile,
                            versionStatus: 'draft',
                        });

                        conceptModel = await conceptLayer.scanProfileComponentLayer();

                        expect(conceptModel._id.toString()).toEqual(existingConcept._id.toString());
                        expect(conceptModel.inlineSchema).toEqual(conceptDocument.inlineSchema);
                        expect(conceptModel.iri).toEqual(existingConcept.iri);
                        expect(conceptModel.name).toEqual(existingConcept.name);
                        expect(conceptModel.description).toEqual(existingConcept.description);
                        expect(conceptModel.type).toEqual(existingConcept.type);
                        expect(conceptModel.conceptType).toEqual(existingConcept.conceptType);
                        expect(conceptModel.contextIri).toEqual(existingConcept.contextIri);
                        expect(conceptModel.parentProfile._id.toString()).toEqual(existingConcept.parentProfile._id.toString());
                    });
                });

                describe('- update a property', () => {
                    test('it should return the existing model with the expected changes.', async () => {
                        conceptDocument.prefLabel.en = 'changed_concept1';

                        conceptLayer = new ConceptLayerFactory({
                            conceptDocument: conceptDocument,
                            parentProfile: parentProfile,
                            versionStatus: 'draft',
                        });

                        conceptModel = await conceptLayer.scanProfileComponentLayer();

                        expect(conceptModel._id.toString()).toEqual(existingConcept._id.toString());
                        expect(conceptModel.name).toEqual(conceptDocument.prefLabel.en);
                        expect(conceptModel.iri).toEqual(existingConcept.iri);
                        expect(conceptModel.name).not.toEqual(existingConcept.name);
                        expect(conceptModel.description).toEqual(existingConcept.description);
                        expect(conceptModel.type).toEqual(existingConcept.type);
                        expect(conceptModel.conceptType).toEqual(existingConcept.conceptType);
                        expect(conceptModel.contextIri).toEqual(existingConcept.contextIri);
                        expect(conceptModel.parentProfile._id.toString()).toEqual(existingConcept.parentProfile._id.toString());
                    });
                });

                describe('- removing a property', () => {
                    test('it should return the existing model with the expected changes.', async () => {
                        delete conceptDocument.context;

                        conceptLayer = new ConceptLayerFactory({
                            conceptDocument: conceptDocument,
                            parentProfile: parentProfile,
                            versionStatus: 'draft',
                        });

                        conceptModel = await conceptLayer.scanProfileComponentLayer();

                        expect(conceptModel._id.toString()).toEqual(existingConcept._id.toString());
                        expect(conceptModel.context).toBeFalsy();
                        expect(conceptModel.iri).toEqual(existingConcept.iri);
                        expect(conceptModel.name).toEqual(existingConcept.name);
                        expect(conceptModel.description).toEqual(existingConcept.description);
                        expect(conceptModel.type).toEqual(existingConcept.type);
                        expect(conceptModel.conceptType).toEqual(existingConcept.conceptType);
                        expect(conceptModel.parentProfile._id.toString()).toEqual(existingConcept.parentProfile._id.toString());
                    });
                });
            });
        });

        describe('the concept does not exist on the server', () => {
            test('it should return a new model with the expected values.', async () => {
                conceptDocument.id = 'some_new_concept_id';

                conceptLayer = new ConceptLayerFactory({
                    conceptDocument: conceptDocument,
                    parentProfile: parentProfile,
                    versionStatus: 'draft',
                });

                conceptModel = await conceptLayer.scanProfileComponentLayer();

                expect(conceptModel.contextIri).toEqual(conceptDocument.context);
                expect(conceptModel.iri).toEqual(conceptDocument.id);
                expect(conceptModel.name).toEqual(conceptDocument.prefLabel.en);
                expect(conceptModel.description).toEqual(conceptDocument.definition.en);
                expect(conceptModel.type).toEqual(conceptDocument.type);
                expect(conceptModel.parentProfile._id.toString()).toEqual(parentProfile._id.toString());
            });
        });
    });
});
