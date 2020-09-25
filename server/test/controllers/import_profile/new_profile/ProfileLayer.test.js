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
const { profile } = require('../../../../utils/createIRI');
const ProfileLayer = require('../../../../controllers/importProfile/ProfileLayer')
    .ProfileLayer;
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const { profileVersion, concept, template, pattern } = require('../../../../ODM/models');
const ProfileModel = require('../../../../ODM/models').profile;
const OrganizationModel = require('../../../../ODM/models').organization;
const UserModel = require('../../../../ODM/models').user;

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

describe('ProfileLayer#scanProfileLayer', () => {
    const PROFILE1_ID = 'profile1_id';
    const VERSION1_ID = 'version1_id';
    const VERSION2_ID = 'version2_id';
    const VERSION3_ID = 'version3_id';
    const CONCEPT1_ID = 'concept1_id';
    const CONCEPT2_ID = 'concept2_id';
    const CONCEPT3_ID = 'concept3_id';
    const TEMPLATE1_ID = 'template1_id';
    const PATTERN1_ID = 'pattern1_id';

    let organization;
    let user;
    beforeEach(async () => {
        user = new UserModel({ email: 'an@email.com' });
        await user.save();

        organization = new OrganizationModel({ name: 'workGroup1' });
        await organization.save();
    });

    afterEach(async () => {
        await user.remove();
        await organization.remove();

        await ProfileModel.findOneAndDelete({ iri: PROFILE1_ID });
        await profileVersion.findOneAndDelete({ iri: VERSION1_ID });
        await profileVersion.findOneAndDelete({ iri: VERSION2_ID });
        await profileVersion.findOneAndDelete({ iri: VERSION3_ID });
        await concept.findOneAndDelete({ iri: CONCEPT1_ID });
        await concept.findOneAndDelete({ iri: CONCEPT2_ID });
        await concept.findOneAndDelete({ iri: CONCEPT3_ID });
        await template.findOneAndDelete({ iri: TEMPLATE1_ID });
        await pattern.findOneAndDelete({ iri: PATTERN1_ID });
    });

    test('it should return a profile model with the correct values.', async () => {
        const profileDocument = {
            id: PROFILE1_ID,
            '@context': 'https://w3id.org/xapi/profiles/context',
            type: 'Profile',
            conformsTo: 'https://w3id.org/xapi/profiles#1.0',
            versions: [
                { id: VERSION1_ID },
            ],
            author: { type: 'Organization', name: 'workGroup1', url: 'https://github.com/thingies' },
            prefLabel: { en: 'profile1' },
            definition: { en: 'test_description.' },
            seeAlso: 'stuff.com',
            concepts: [{
                id: CONCEPT1_ID,
                prefLabel: { en: 'concept1' },
                definition: { en: 'concept1_desc' },
                type: 'Verb',
            }, {
                id: CONCEPT2_ID,
                prefLabel: { en: 'concept2' },
                definition: { en: 'concept2_desc' },
                type: 'Verb',
                related: [
                    CONCEPT1_ID,
                ],
            }, {
                id: CONCEPT3_ID,
                prefLabel: { en: 'concept3' },
                definition: { en: 'concept3_desc' },
                type: 'ActivityType',
            }],
            templates: [{
                id: TEMPLATE1_ID,
                prefLabel: { en: 'template1' },
                definition: { en: 'template1_desc' },
                contextGroupingActivityType: [CONCEPT3_ID],
            }],
            patterns: [{
                id: PATTERN1_ID,
                prefLabel: { en: 'pattern1' },
                definition: { en: 'pattern1_desc' },
                optional: TEMPLATE1_ID,
            }],
        };

        const profileLayer = new ProfileLayer(organization, user, profileDocument);

        const profileModel = await (await (await (await
        profileLayer
            .scanProfileLayer())
            .scanVersionLayer())
            .scanProfileComponentLayer())
            .save();

        expect(profileModel.iri).toEqual(profileDocument.id);
    });

    describe('when there are multiple versions', () => {
        let profileDocument;
        let profileModel;
        beforeEach(() => {
            profileDocument = {
                id: PROFILE1_ID,
                '@context': 'https://w3id.org/xapi/profiles/context',
                type: 'Profile',
                conformsTo: 'https://w3id.org/xapi/profiles#1.0',
                versions: [
                    { id: VERSION3_ID, wasRevisionOf: [VERSION2_ID], generatedAtTime: new Date() },
                    { id: VERSION2_ID, wasRevisionOf: [VERSION1_ID], generatedAtTime: new Date() },
                    { id: VERSION1_ID, wasRevisionOf: ['otherProfileVersion_id'], generatedAtTime: new Date() },
                ],
                author: { type: 'Organization', name: 'workGroup1', url: 'https://github.com/thingies' },
                prefLabel: { en: 'profile1' },
                definition: { en: 'test_description.' },
                seeAlso: 'stuff.com',
            };
        });

        describe('and one member of the document versions wasRevisionOf is the root profile id', () => {
            beforeEach(() => {
                profileDocument.versions.push({ id: 'version05_id', wasRevisionOf: profileDocument.id, generatedAtTime: new Date() });
            });

            // This is allowed but we are filtering out any reference to the root profile from any wasRevisionOf array.
            // test('it should throw and error.', async () => {
            //     const profileLayer = new ProfileLayer(organization, profileDocument);

            //     let error;
            //     try {
            //         profileModel = await (await (await (await
            //         profileLayer
            //             .scanProfileLayer())
            //             .scanVersionLayer())
            //             .scanProfileComponentLayer())
            //             .save();
            //     } catch (err) {
            //         error = err.message;
            //     }

            //     expect(error).toMatch(/profile1_id cannot be a member of a version's wasRevisionOf property because it is the root id of this profile/);
            // });
        });

        describe('and none of these versions are on the server', () => {
            let currentVersion;
            let versions;
            beforeEach(async () => {
                const profileLayer = new ProfileLayer(organization, user, profileDocument);

                profileModel = await (await (await (await
                profileLayer
                    .scanProfileLayer())
                    .scanVersionLayer())
                    .scanProfileComponentLayer())
                    .save();

                currentVersion = profileModel.currentPublishedVersion;
                versions = (await profileModel.populate({ path: 'versions', populate: { path: 'wasRevisionOf' } }).execPopulate()).versions;
            });

            test('it should create shallow versions for the previous versions.', () => {
                expect(versions.length).toEqual(profileDocument.versions.length);
                expect(versions.map(v => v.iri).includes(VERSION3_ID)).toBeTruthy();
                expect(versions.map(v => v.iri).includes(VERSION2_ID)).toBeTruthy();
                expect(versions.map(v => v.iri).includes(VERSION1_ID)).toBeTruthy();
            });

            test('those shallow versions that are created should have wasRevisionOf props with the correct profile versions', () => {
                const v1 = versions.find(v => v.iri === profileDocument.versions[2].id);
                expect(v1.wasRevisionOf.length).toEqual(profileDocument.versions[2].wasRevisionOf.length);
                expect(v1.wasRevisionOf[0].iri).toEqual(profileDocument.versions[2].wasRevisionOf[0]);
                expect(v1.wasRevisionOf[0].isShallowVersion).toBeTruthy();
                expect(v1.parentProfile).toBeTruthy();

                const v2 = versions.find(v => v.iri === profileDocument.versions[1].id);
                expect(v2.wasRevisionOf.length).toEqual(profileDocument.versions[1].wasRevisionOf.length);
                expect(v2.wasRevisionOf[0].iri).toEqual(profileDocument.versions[1].wasRevisionOf[0]);
                expect(v2.wasRevisionOf[0].isShallowVersion).toBeTruthy();
                expect(v2.parentProfile).toBeTruthy();
            });

            test('it should create shallow parentless versions for any versions in a wasRevisionOf prop that are not versions of this profile.', () => {
                const v1 = versions.find(v => v.iri === profileDocument.versions[2].id);
                expect(v1.wasRevisionOf[0].parentProfile).toBeFalsy();
            });
        });
    });
});
