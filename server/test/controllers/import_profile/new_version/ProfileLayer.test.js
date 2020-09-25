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
const TemplateModel = require('../../../../ODM/models').template;
const PatternModel = require('../../../../ODM/models').pattern;
const PatternComponentModel = require('../../../../ODM/models').patternComponent;
const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const ProfileModel = require('../../../../ODM/models').profile;
const OraganizationModel = require('../../../../ODM/models').organization;
const UserModel = require('../../../../ODM/models').user;
const ProfileLayer = require('../../../../controllers/importProfile/ProfileLayer')
    .ProfileLayer;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

const testPublishedSuccess = async (workGroup, user, profileDocument) => {
    const profileLayer = new ProfileLayer(workGroup, user, profileDocument, true);
    const profileModel = await (await (await (await
    profileLayer
        .scanProfileLayer())
        .scanVersionLayer())
        .scanProfileComponentLayer())
        .save();

    return profileModel;
};

const testDraftSuccess = async (workGroup, user, profileDocument) => {
    const profileLayer = new ProfileLayer(workGroup, user, profileDocument, false);
    const profileModel = await (await (await (await
    profileLayer
        .scanProfileLayer())
        .scanVersionLayer())
        .scanProfileComponentLayer())
        .save();

    return profileModel;
};

const testError = async (workGroup, user, profileDocument) => {
    const profileLayer = new ProfileLayer(workGroup, user, profileDocument, true);

    let error;
    try {
        const profileModel = await profileLayer.scanProfileLayer();
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

describe('ProfileLayer: determining if this is an update to a new version or a brand new profile', () => {
    const VERSION1 = 'version1_id';
    const VERSION2 = 'version2_id';
    let profileDocument;
    let profileModel;
    let orgModel;
    let newVersionModel;
    let currentPublishedVersion;
    let currentDraftVersion;
    let versions;
    let user;
    beforeEach(async () => {
        profileDocument = {
            id: 'profile1_id',
            type: 'Profile',
            '@context': 'https://w3id.org/xapi/profiles/context',
            conformsTo: 'https://w3id.org/xapi/profiles#1.0',
            prefLabel: { en: 'profile1' },
            definition: { en: 'profile description' },
            author: {
                type: 'Organization',
                name: 'org_1',
            },
            versions: [
                {
                    id: VERSION2,
                    generatedAtTime: new Date(),
                    // wasRevisionOf: [VERSION1],
                },
                // {
                //     id: VERSION1,
                //     generatedAtTime: Date.now(),
                // },
            ],
        };

        orgModel = new OraganizationModel({ name: 'org_1' });
        await orgModel.save();

        user = new UserModel({ email: 'an@email.com' });
        await user.save();
    });

    afterEach(async () => {
        await orgModel.remove();
        await user.remove();
        await ProfileVersionModel.findOneAndRemove({ iri: VERSION2 });
        if (currentPublishedVersion) await currentPublishedVersion.remove();
        if (currentDraftVersion) await currentDraftVersion.remove();
    });

    describe('when the profile exists on the server', () => {
        let error;
        let existingProfile;
        let existingDraftVersion;
        let existingPublishedVersion;
        beforeEach(async () => {
            existingProfile = new ProfileModel({
                iri: 'profile1_id',
                organization: orgModel,
                createdBy: user,
                updatedBy: user,
            });
            await existingProfile.save();
        });

        afterEach(async () => {
            await existingProfile.remove();
            if (existingDraftVersion) await existingDraftVersion.remove();
            if (existingPublishedVersion) await existingPublishedVersion.remove();
        });

        describe('and a draft version of the profile does not exists', () => {
            describe('and a published version of the profile exists', () => {
                beforeEach(async () => {
                    existingPublishedVersion = new ProfileVersionModel({
                        iri: VERSION1,
                        name: 'profile1',
                        description: 'profile description',
                        state: 'published',
                        parentProfile: existingProfile,
                        organization: orgModel,
                        createdBy: user,
                        updatedBy: user,
                    });
                    await existingPublishedVersion.save();

                    existingProfile.currentPublishedVersion = existingPublishedVersion;
                    await existingProfile.save();
                });

                describe("and the published version's iri is equal to the profile's versions[1].id", () => {
                    beforeEach(() => {
                        profileDocument.versions.push({
                            id: VERSION1,
                            generatedAtTime: new Date(),
                        });
                    });

                    describe("and the published version's iri is in the profile's versions[0].wasRevisionOf", () => {
                        beforeEach(() => {
                            profileDocument.versions[0].wasRevisionOf = [VERSION1];
                        });

                        describe('and there are no changes between versions except the versions array', () => {
                            describe('and published? is true', () => {
                                beforeEach(async () => {
                                    profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                    await profileModel
                                        .populate('currentPublishedVersion')
                                        .populate('currentDraftVersion')
                                        .populate('versions')
                                        .execPopulate();
                                    currentPublishedVersion = profileModel.currentPublishedVersion;
                                    currentDraftVersion = profileModel.currentDraftVersion;
                                    versions = profileModel.versions;
                                });

                                test('it should return a the existing profile model with the currentPublishedVersion that is equal to the new version', async () => {
                                    expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                    expect(profileModel.iri).toEqual(existingProfile.iri);
                                    expect(profileModel.createdOn).toStrictEqual(existingProfile.createdOn);
                                    // expect(profileModel.updatedOn).not.toStrictEqual(existingProfile.updatedOn);
                                    expect(currentPublishedVersion).toBeTruthy();
                                    expect(currentDraftVersion).toBeFalsy();
                                });

                                test('it should save a new version model on the server with the correct values', async () => {
                                    expect(currentPublishedVersion.iri).toEqual(profileDocument.versions[0].id);
                                    expect(currentPublishedVersion.name).toEqual(profileDocument.prefLabel.en);
                                    expect(currentPublishedVersion.description).toEqual(profileDocument.definition.en);
                                    expect(currentPublishedVersion.state).toEqual('published');
                                    expect(currentPublishedVersion.wasRevisionOf.map(w => w._id.toString())[0]).toEqual(existingPublishedVersion._id.toString());
                                });

                                test('it should maintain the previous currentPublishedVersion in its list of versions', () => {
                                    expect(versions.sort((l, r) => l.iri - r.iri)[0].iri).toEqual(profileDocument.versions[1].id);
                                    expect(versions.sort((l, r) => l.iri - r.iri)[0]._id.toString()).toEqual(existingPublishedVersion._id.toString());
                                });

                                test('it should add the new version to its list of versions', () => {
                                    expect(versions.sort((l, r) => l.iri - r.iri)[1].iri).toEqual(profileDocument.versions[0].id);
                                    expect(versions.sort((l, r) => l.iri - r.iri)[1]._id.toString()).toEqual(currentPublishedVersion._id.toString());
                                });
                            });

                            describe('and published? is false', () => {
                                beforeEach(async () => {
                                    profileModel = await testDraftSuccess(orgModel, user, profileDocument);
                                    await profileModel
                                        .populate('currentPublishedVersion')
                                        .populate('currentDraftVersion')
                                        .populate('versions')
                                        .execPopulate();
                                    currentPublishedVersion = profileModel.currentPublishedVersion;
                                    currentDraftVersion = profileModel.currentDraftVersion;
                                    versions = profileModel.versions;
                                });

                                test('it should return a the existing profile model with the currentDraftVersion that is equal to the new version', async () => {
                                    expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                    expect(profileModel.iri).toEqual(existingProfile.iri);
                                    // expect(profileModel.createdOn).toBe(existingProfile.createdOn);
                                    // expect(profileModel.updatedOn).not.toBe(existingProfile.updatedOn);
                                    expect(currentPublishedVersion).toBeTruthy();
                                    expect(currentDraftVersion).toBeTruthy();
                                });

                                test('it should save a new version model on the server with the correct values', async () => {
                                    expect(currentDraftVersion.iri).toEqual(profileDocument.versions[0].id);
                                    expect(currentDraftVersion.name).toEqual(profileDocument.prefLabel.en);
                                    expect(currentDraftVersion.description).toEqual(profileDocument.definition.en);
                                    expect(currentDraftVersion.state).toEqual('draft');
                                    expect(currentDraftVersion.wasRevisionOf.map(w => w._id.toString())[0]).toEqual(existingPublishedVersion._id.toString());
                                });

                                test('it should maintain the previous currentPublishedVersion in its list of versions', () => {
                                    expect(versions.sort((l, r) => l.iri - r.iri)[0].iri).toEqual(profileDocument.versions[1].id);
                                    expect(versions.sort((l, r) => l.iri - r.iri)[0]._id.toString()).toEqual(existingPublishedVersion._id.toString());
                                });

                                test('it should add the new version to its list of versions', () => {
                                    expect(versions.sort((l, r) => l.iri - r.iri)[1].iri).toEqual(profileDocument.versions[0].id);
                                    expect(versions.sort((l, r) => l.iri - r.iri)[1]._id.toString()).toEqual(currentDraftVersion._id.toString());
                                });
                            });
                        });

                        describe('and there are changes between versions', () => {
                            describe('and the changes are valid', () => {
                                describe('- adding to profile#prefLabel', () => {
                                    test('it should return the existing profile with the correct changes.', async () => {
                                        profileDocument.prefLabel.new_lang = 'new_label';

                                        profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                        await profileModel
                                            .populate('currentPublishedVersion')
                                            .execPopulate();
                                        currentPublishedVersion = profileModel.currentPublishedVersion;

                                        expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                        expect(currentPublishedVersion.translations[0].language).toEqual('new_lang');
                                        expect(currentPublishedVersion.translations[0].translationName).toEqual(profileDocument.prefLabel.new_lang);
                                    });
                                });

                                describe('- adding to profile#definition', () => {
                                    test('it should return the existing profile with the correct changes.', async () => {
                                        profileDocument.definition.new_lang = 'new definition';

                                        profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                        await profileModel
                                            .populate('currentPublishedVersion')
                                            .execPopulate();
                                        currentPublishedVersion = profileModel.currentPublishedVersion;

                                        expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                        expect(currentPublishedVersion.translations[0].language).toEqual('new_lang');
                                        expect(currentPublishedVersion.translations[0].translationDesc).toEqual(profileDocument.definition.new_lang);
                                    });
                                });

                                describe('profile#seeAlso', () => {
                                    describe('- adding', () => {
                                        test('it should return the existing profile with the correct changes.', async () => {
                                            profileDocument.seeAlso = 'this is the see also';

                                            profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                            await profileModel
                                                .populate('currentPublishedVersion')
                                                .execPopulate();
                                            currentPublishedVersion = profileModel.currentPublishedVersion;

                                            expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                            expect(currentPublishedVersion.moreInformation).toEqual(profileDocument.seeAlso);
                                        });
                                    });

                                    describe('- updating', () => {
                                        test('it should return the existing profile with the correct changes.', async () => {
                                            existingPublishedVersion.moreInformation = 'this is the seeAlso';
                                            await existingPublishedVersion.save();

                                            profileDocument.seeAlso = 'this is the changed seeAlso';

                                            profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                            await profileModel
                                                .populate('currentPublishedVersion')
                                                .execPopulate();
                                            currentPublishedVersion = profileModel.currentPublishedVersion;

                                            expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                            expect(currentPublishedVersion.moreInformation).toEqual(profileDocument.seeAlso);
                                        });
                                    });

                                    describe('- removing', () => {
                                        test('it should return the existing profile with the correct changes.', async () => {
                                            existingPublishedVersion.moreInformation = 'this is the seeAlso';
                                            await existingPublishedVersion.save();

                                            profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                            await profileModel
                                                .populate('currentPublishedVersion')
                                                .execPopulate();
                                            currentPublishedVersion = profileModel.currentPublishedVersion;

                                            expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                            expect(currentPublishedVersion.moreInformation).toBeFalsy();
                                        });
                                    });
                                });

                                describe('profile#concepts', () => {
                                    const SOME_CONCEPT = 'concept1_id';
                                    const SOME_OTHER_CONCEPT = 'concept2_id';
                                    let someConcept;
                                    let someOtherConcept;
                                    let someConceptDocument;
                                    let someOtherConceptDocument;
                                    beforeEach(async () => {
                                        someConcept = new ConceptModel({
                                            iri: SOME_CONCEPT,
                                            name: 'concept1',
                                            description: 'concept1 desc',
                                            type: 'Verb',
                                            conceptType: 'Verb',
                                            parentProfile: existingPublishedVersion,
                                            inScheme: VERSION1,
                                            createdBy: user,
                                            updatedBy: user,
                                        });
                                        await someConcept.save();

                                        someConceptDocument = {
                                            id: SOME_CONCEPT,
                                            prefLabel: { en: 'concept1' },
                                            definition: { en: 'concept1 desc' },
                                            type: 'Verb',
                                            inScheme: VERSION2,
                                        };

                                        someOtherConceptDocument = {
                                            id: SOME_OTHER_CONCEPT,
                                            prefLabel: { en: 'concept2' },
                                            definition: { en: 'concept2 desc' },
                                            type: 'Verb',
                                            inScheme: VERSION2,
                                        };

                                        existingPublishedVersion.concepts = [someConcept];
                                        await existingPublishedVersion.save();

                                        profileDocument.concepts = [someConceptDocument];
                                    });

                                    afterEach(async () => {
                                        if (someConcept) await someConcept.remove();
                                        await ConceptModel.findOneAndRemove({ iri: SOME_OTHER_CONCEPT });
                                    });

                                    describe('- adding', () => {
                                        test('it should return the existing concept profile with the correct changes.', async () => {
                                            someConceptDocument.inScheme = VERSION2;
                                            profileDocument.concepts = [someConceptDocument, someOtherConceptDocument];

                                            profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                            await profileModel
                                                .populate({ path: 'currentPublishedVersion', populate: { path: 'concepts' } })
                                                .execPopulate();
                                            currentPublishedVersion = profileModel.currentPublishedVersion;

                                            expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                            expect(currentPublishedVersion.concepts.length).toEqual(2);
                                            expect(currentPublishedVersion.concepts.find(c => c.iri === SOME_OTHER_CONCEPT)).toBeTruthy();
                                            expect(currentPublishedVersion.concepts.find(c => c.iri === SOME_OTHER_CONCEPT).parentProfile._id.toString())
                                                .toEqual(currentPublishedVersion._id.toString());
                                            expect(currentPublishedVersion.concepts.find(c => c.iri === SOME_CONCEPT)).toBeTruthy();
                                            expect(currentPublishedVersion.concepts.find(c => c.iri === SOME_CONCEPT).parentProfile._id.toString())
                                                .toEqual(existingPublishedVersion._id.toString());
                                        });
                                    });

                                    describe('- removing', () => {
                                        test('it should return the existing profile with the correct changes.', async () => {
                                            someOtherConcept = new ConceptModel({
                                                iri: SOME_OTHER_CONCEPT,
                                                name: 'concept2',
                                                description: 'concept2 desc',
                                                type: 'Verb',
                                                conceptType: 'Verb',
                                                parentProfile: existingPublishedVersion,
                                                inScheme: VERSION1,
                                                createdBy: user,
                                                updatedBy: user,
                                            });
                                            await someOtherConcept.save();

                                            existingPublishedVersion.concepts.push(someOtherConcept);
                                            await existingPublishedVersion.save();

                                            profileDocument.concepts = [someConceptDocument];

                                            profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                            await profileModel
                                                .populate({ path: 'currentPublishedVersion', populate: { path: 'concepts' } })
                                                .execPopulate();
                                            currentPublishedVersion = profileModel.currentPublishedVersion;

                                            expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                            expect(currentPublishedVersion.concepts.length).toEqual(1);
                                            expect(currentPublishedVersion.concepts.find(c => c.iri === SOME_OTHER_CONCEPT)).toBeFalsy();
                                        });
                                    });
                                });

                                describe('profile#templates', () => {
                                    const SOME_TEMPLATE = 'template1_id';
                                    const SOME_OTHER_TEMPLATE = 'template2_id';
                                    let someTemplate;
                                    let someOtherTemplate;
                                    let someTemplateDocument;
                                    let someOtherTemplateDocument;
                                    beforeEach(async () => {
                                        someTemplate = new TemplateModel({
                                            iri: SOME_TEMPLATE,
                                            name: 'template1',
                                            description: 'template1 desc',
                                            parentProfile: existingPublishedVersion,
                                            createdBy: user,
                                            updatedBy: user,
                                        });
                                        await someTemplate.save();

                                        someTemplateDocument = {
                                            id: SOME_TEMPLATE,
                                            prefLabel: { en: 'template1' },
                                            definition: { en: 'template1 desc' },
                                            inScheme: VERSION2,
                                            type: 'StatementTemplate',
                                        };

                                        someOtherTemplateDocument = {
                                            id: SOME_OTHER_TEMPLATE,
                                            prefLabel: { en: 'template2' },
                                            definition: { en: 'template2 desc' },
                                            inScheme: VERSION2,
                                            type: 'StatementTemplate',
                                        };

                                        existingPublishedVersion.templates = [someTemplate];
                                        await existingPublishedVersion.save();

                                        profileDocument.templates = [someTemplateDocument];
                                    });

                                    afterEach(async () => {
                                        if (someTemplate) await someTemplate.remove();
                                        await TemplateModel.findOneAndRemove({ iri: SOME_OTHER_TEMPLATE });
                                    });

                                    describe('- adding', () => {
                                        test('it should return the existing profile with the correct changes.', async () => {
                                            someTemplateDocument.inScheme = VERSION2;
                                            profileDocument.templates = [someTemplateDocument, someOtherTemplateDocument];

                                            profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                            await profileModel
                                                .populate({ path: 'currentPublishedVersion', populate: { path: 'templates' } })
                                                .execPopulate();
                                            currentPublishedVersion = profileModel.currentPublishedVersion;

                                            expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                            expect(currentPublishedVersion.templates.length).toEqual(2);
                                            expect(currentPublishedVersion.templates.find(c => c.iri === SOME_OTHER_TEMPLATE)).toBeTruthy();
                                            expect(currentPublishedVersion.templates.find(c => c.iri === SOME_OTHER_TEMPLATE).parentProfile._id.toString())
                                                .toEqual(currentPublishedVersion._id.toString());
                                            expect(currentPublishedVersion.templates.find(c => c.iri === SOME_TEMPLATE)).toBeTruthy();
                                            expect(currentPublishedVersion.templates.find(c => c.iri === SOME_TEMPLATE).parentProfile._id.toString())
                                                .toEqual(existingPublishedVersion._id.toString());
                                        });
                                    });

                                    describe('- removing', () => {
                                        test('it should return the existing profile with the correct changes.', async () => {
                                            someOtherTemplate = new TemplateModel({
                                                iri: SOME_OTHER_TEMPLATE,
                                                name: 'template2',
                                                description: 'template2 desc',
                                                parentProfile: existingPublishedVersion,
                                                createdBy: user,
                                                updatedBy: user,
                                            });
                                            await someOtherTemplate.save();

                                            existingPublishedVersion.templates.push(someOtherTemplate);
                                            await existingPublishedVersion.save();

                                            profileDocument.templates = [someTemplateDocument];

                                            profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                            await profileModel
                                                .populate({ path: 'currentPublishedVersion', populate: { path: 'templates' } })
                                                .execPopulate();
                                            currentPublishedVersion = profileModel.currentPublishedVersion;

                                            expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                            expect(currentPublishedVersion.templates.length).toEqual(1);
                                            expect(currentPublishedVersion.templates.find(c => c.iri === SOME_OTHER_TEMPLATE)).toBeFalsy();
                                        });
                                    });
                                });

                                describe('profile#pattern', () => {
                                    const SOME_PATTERN = 'pattern1_id';
                                    const SOME_OTHER_PATTERN = 'pattern2_id';
                                    const SOME_TEMPLATE = 'template1_id';
                                    let somePattern;
                                    let someOtherPattern;
                                    let somePatternDocument;
                                    let someOtherPatternDocument;
                                    let someTemplate;
                                    let patternComp;
                                    beforeEach(async () => {
                                        someTemplate = new TemplateModel({
                                            iri: SOME_TEMPLATE,
                                            name: 'template1',
                                            description: 'template1 desc',
                                            parentProfile: existingPublishedVersion,
                                            createdBy: user,
                                            updatedBy: user,
                                        });
                                        await someTemplate.save();

                                        patternComp = new PatternComponentModel({
                                            componentType: 'template',
                                            component: someTemplate,
                                        });
                                        await patternComp.save();

                                        somePattern = new PatternModel({
                                            iri: SOME_PATTERN,
                                            name: 'pattern1',
                                            description: 'pattern1 desc',
                                            parentProfile: existingPublishedVersion,
                                            type: 'oneOrMore',
                                            oneOrMore: patternComp,
                                            createdBy: user,
                                            updatedBy: user,
                                        });
                                        await somePattern.save();

                                        somePatternDocument = {
                                            id: SOME_PATTERN,
                                            prefLabel: { en: 'pattern1' },
                                            definition: { en: 'pattern1 desc' },
                                            inScheme: VERSION2,
                                            oneOrMore: SOME_TEMPLATE,
                                            type: 'Pattern',
                                        };

                                        someOtherPatternDocument = {
                                            id: SOME_OTHER_PATTERN,
                                            prefLabel: { en: 'pattern2' },
                                            definition: { en: 'pattern2 desc' },
                                            inScheme: VERSION2,
                                            oneOrMore: SOME_TEMPLATE,
                                            type: 'Pattern',
                                        };

                                        existingPublishedVersion.patterns = [somePattern];
                                        await existingPublishedVersion.save();

                                        profileDocument.patterns = [somePatternDocument];
                                    });

                                    afterEach(async () => {
                                        if (somePattern) await somePattern.remove();
                                        if (someTemplate) await someTemplate.remove();
                                        if (patternComp) await patternComp.remove();
                                        await PatternModel.findOneAndRemove({ iri: SOME_OTHER_PATTERN });
                                    });

                                    describe('- adding', () => {
                                        test('it should return the existing profile with the correct changes.', async () => {
                                            somePatternDocument.inScheme = VERSION2;
                                            profileDocument.patterns = [somePatternDocument, someOtherPatternDocument];

                                            profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                            await profileModel
                                                .populate({ path: 'currentPublishedVersion', populate: { path: 'patterns' } })
                                                .execPopulate();
                                            currentPublishedVersion = profileModel.currentPublishedVersion;

                                            expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                            expect(currentPublishedVersion.patterns.length).toEqual(2);
                                            expect(currentPublishedVersion.patterns.find(c => c.iri === SOME_OTHER_PATTERN)).toBeTruthy();
                                            expect(currentPublishedVersion.patterns.find(c => c.iri === SOME_OTHER_PATTERN).parentProfile._id.toString())
                                                .toEqual(currentPublishedVersion._id.toString());
                                            expect(currentPublishedVersion.patterns.find(c => c.iri === SOME_PATTERN)).toBeTruthy();
                                            expect(currentPublishedVersion.patterns.find(c => c.iri === SOME_PATTERN).parentProfile._id.toString())
                                                .toEqual(existingPublishedVersion._id.toString());
                                        });
                                    });

                                    describe('- removing', () => {
                                        test('it should return the existing profile with the correct changes.', async () => {
                                            someOtherPattern = new PatternModel({
                                                iri: SOME_OTHER_PATTERN,
                                                name: 'pattern2',
                                                description: 'pattern2 desc',
                                                parentProfile: existingPublishedVersion,
                                                type: 'oneOrMore',
                                                oneOrMore: patternComp,
                                                createdBy: user,
                                                updatedBy: user,
                                            });
                                            await someOtherPattern.save();

                                            existingPublishedVersion.patterns.push(someOtherPattern);
                                            await existingPublishedVersion.save();

                                            profileDocument.patterns = [somePatternDocument];

                                            profileModel = await testPublishedSuccess(orgModel, user, profileDocument);
                                            await profileModel
                                                .populate({ path: 'currentPublishedVersion', populate: { path: 'patterns' } })
                                                .execPopulate();
                                            currentPublishedVersion = profileModel.currentPublishedVersion;

                                            expect(profileModel._id.toString()).toEqual(existingProfile._id.toString());
                                            expect(currentPublishedVersion.patterns.length).toEqual(1);
                                            expect(currentPublishedVersion.patterns.find(c => c.iri === SOME_OTHER_PATTERN)).toBeFalsy();
                                        });
                                    });
                                });
                            });

                            describe('and the changes are invalid', () => {
                                describe('- updating profile#prefLabel', () => {
                                    test('it should throw an error', async () => {
                                        profileDocument.prefLabel.en = 'changed_prefLabel';

                                        error = await testError(orgModel, user, profileDocument);

                                        expect(error).toMatch(/prefLabel.en cannot be updated on published profile profile1_id/);
                                    });
                                });

                                describe('- updating profile#definition', () => {
                                    test('it should throw an error', async () => {
                                        profileDocument.definition.en = 'changed definition';

                                        error = await testError(orgModel, user, profileDocument);

                                        expect(error).toMatch(/definition.en cannot be updated on published profile profile1_id/);
                                    });
                                });
                            });
                        });
                    });

                    describe("and the published version's iri is not in the profile's versions[0].wasRevisionOf", () => {
                        test('it should throw an error', async () => {
                            profileDocument.versions[0].wasRevisionOf = ['not_version1_id'];

                            error = await testError(orgModel, user, profileDocument);

                            expect(error).toMatch(/A new version of profile1_id cannot be created because the current published version id is not in the submitted document's current version's wasRevisionOf array/);
                        });
                    });

                    describe("and the profile's versions[0] has no wasRevisionOf property", () => {
                        test('it should throw an error', async () => {
                            error = await testError(orgModel, user, profileDocument);

                            expect(error).toMatch(/A new version of profile1_id cannot be created because the current published version id is not in the submitted document's current version's wasRevisionOf array/);
                        });
                    });
                });

                describe("and the published version's iri is not equal to the profiles versions[1].id", () => {
                    test('it should throw an error', async () => {
                        profileDocument.versions.push({
                            id: 'not_version1_id',
                            generatedAtTime: new Date(),
                        });

                        error = await testError(orgModel, user, profileDocument);

                        expect(error).toMatch(/A new version of profile profile1_id cannot be created because the current published version id does not match the submitted document's previous version id/);
                    });
                });

                describe('and there is no versions[1] in the profile', () => {
                    test('it should throw an error', async () => {
                        error = await testError(orgModel, user, profileDocument);

                        expect(error).toMatch(/A new version of profile profile1_id cannot be created because the current published version id does not match the submitted document's previous version id/);
                    });
                });
            });

            describe('and a published version of the profile does not exist', () => {
                test('it should throw an error', async () => {
                    error = await testError(orgModel, user, profileDocument);

                    expect(error).toMatch(/A new version of profile profile1_id cannot be created because it has not yet been published/);
                });
            });
        });

        describe('when a draft version of the profile exists', () => {
            beforeEach(async () => {
                existingDraftVersion = new ProfileVersionModel({
                    iri: VERSION1,
                    name: 'profile1',
                    description: 'profile description',
                    state: 'draft',
                    createdBy: user,
                    updatedBy: user,
                });
                await existingDraftVersion.save();

                existingProfile.currentDraftVersion = existingDraftVersion;
                await existingProfile.save();
            });

            test('it should throw an error', async () => {
                error = await testError(orgModel, user, profileDocument);

                expect(error).toMatch(/A new version of profile profile1_id cannot be created because there is already a draft version/);
            });
        });
    });

    // describe('when the profile does not exist on the server', () => {
    //     describe('and published? is true', () => {
    //         test('it should save a new version model on the server with the correct values', async () => {

    //         });

    //         test('it should return a new profile model with currentPublishedVersion equal to the new version model', async () => {

    //         });
    //     });

    //     describe('and published? is false', () => {
    //         test('it should save a new version model on the server with the correct values', async () => {

    //         });

    //         test('it should return a new profile model with currentDraftVersion equal to the new version model', async () => {

    //         });
    //     });
    // });
});
