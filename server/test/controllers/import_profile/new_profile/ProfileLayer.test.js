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

const OrganizationModel = require('../../../../ODM/models').organization;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

beforeEach(async () => {
    const cnnStr = await mongoServer.getUri();
    await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('ProfileLayer#scanProfileLayer', () => {
    test('it should return a profile model with the correct values.', async () => {
        const organization = new OrganizationModel({ name: 'workGroup1' });
        const profileDocument = {
            id: 'profile1_id',
            '@context': 'https://w3id.org/xapi/profiles/context',
            type: 'Profile',
            conformsTo: 'https://w3id.org/xapi/profiles#1.0',
            versions: [
                { id: 'version1_id' },
            ],
            author: { type: 'Organization', name: 'workGroup1', url: 'https://github.com/thingies' },
            prefLabel: { en: 'profile1' },
            definition: { en: 'test_description.' },
            seeAlso: 'stuff.com',
            concepts: [{
                id: 'concept1_id',
                prefLabel: { en: 'concept1' },
                definition: { en: 'concept1_desc' },
                type: 'Verb',
            }, {
                id: 'concept2_id',
                prefLabel: { en: 'concept2' },
                definition: { en: 'concept2_desc' },
                type: 'Verb',
                related: [
                    'concept1_id',
                ],
            }, {
                id: 'concept3_id',
                prefLabel: { en: 'concept3' },
                definition: { en: 'concept3_desc' },
                type: 'ActivityType',
            }],
            templates: [{
                id: 'template1_id',
                prefLabel: { en: 'template1' },
                definition: { en: 'template1_desc' },
                contextGroupingActivityType: ['concept3_id'],
            }],
            patterns: [{
                id: 'pattern1_id',
                prefLabel: { en: 'pattern1' },
                definition: { en: 'pattern1_desc' },
                optional: 'template1_id',
            }],
        };

        const profileLayer = new ProfileLayer(organization, profileDocument);

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
        let organization;
        beforeEach(() => {
            organization = new OrganizationModel({ name: 'workGroup1' });
            profileDocument = {
                id: 'profile1_id',
                '@context': 'https://w3id.org/xapi/profiles/context',
                type: 'Profile',
                conformsTo: 'https://w3id.org/xapi/profiles#1.0',
                versions: [
                    { id: 'version3_id', wasRevisionOf: ['version2_id'], generatedAtTime: new Date() },
                    { id: 'version2_id', wasRevisionOf: ['version1_id'], generatedAtTime: new Date() },
                    { id: 'version1_id', wasRevisionOf: ['otherProfileVersion_id'], generatedAtTime: new Date() },
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

            test('it should throw and error.', async () => {
                const profileLayer = new ProfileLayer(organization, profileDocument);

                let error;
                try {
                    profileModel = await (await (await (await
                    profileLayer
                        .scanProfileLayer())
                        .scanVersionLayer())
                        .scanProfileComponentLayer())
                        .save();
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/profile1_id cannot be a member of a version's wasRevisionOf property because it is the root id of this profile/);
            });
        });

        describe('and none of these versions are on the server', () => {
            let currentVersion;
            let versions;
            beforeEach(async () => {
                const profileLayer = new ProfileLayer(organization, profileDocument);

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
                expect(versions.map(v => v.iri).includes('version3_id')).toBeTruthy();
                expect(versions.map(v => v.iri).includes('version2_id')).toBeTruthy();
                expect(versions.map(v => v.iri).includes('version1_id')).toBeTruthy();
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
