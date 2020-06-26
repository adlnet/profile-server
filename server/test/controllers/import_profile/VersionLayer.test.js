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
const { definition } = require('../../../utils/langmaps');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const VersionLayer = require('../../../controllers/importProfile/VersionLayer')
    .VersionLayer;
const ProfileModel = require('../../../ODM/models').profile;
const ProfileVersionModel = require('../../../ODM/models').profileVersion;
const OrganizationModel = require('../../../ODM/models').organization;

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

describe('VersionLayer#Constructor', () => {
    test('it should return a profileVersion model with the correct values.', async () => {
        const versionLayer = new VersionLayer({
            profileModel: new ProfileModel({
                iri: 'profile1_id',
                organization: new OrganizationModel({ name: 'workGroup1' }),
            }),
            versionDocument: {
                versions: [
                    { id: 'version1_id' },
                ],
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
            },
            save: async function (versionModel) {
                await versionModel.save();
                return versionModel;
            },
        });

        const versionModel = await (await (await
        versionLayer
            .scanVersionLayer())
            .scanProfileComponentLayer())
            .save();
        expect(versionModel.iri).toEqual('version1_id');

        const foundProfileVersion = await ProfileVersionModel.findOne({ iri: versionModel.iri });
        expect(foundProfileVersion.id).toEqual(versionModel.id);
        await foundProfileVersion.remove();
    });
});

describe('VersionLayer#scanVersionLayer', () => {
    let profileLayer;
    beforeEach(() => {
        profileLayer = {
            profileModel: new ProfileModel({
                iri: 'profile1_id',
                organization: new OrganizationModel({ name: 'workGroup1' }),
            }),
            versionDocument: {
                versions: [
                    { id: 'version1_id' },
                ],
                prefLabel: { en: 'profile1' },
                definition: { en: 'test_description.' },
                seeAlso: 'stuff.com',
            },
            save: function (versionModel) {
                return versionModel;
            },
        };
    });

    describe('if the profile version exists on the server', () => {
        let existingVersion;
        beforeEach(async () => {
            existingVersion = new ProfileVersionModel({
                iri: 'version1_id',
                name: 'profile1',
                description: 'profile1_desc',
            });
            await existingVersion.save();
        });

        afterEach(async () => {
            await existingVersion.remove();
        });

        test('it should throw an error.', async () => {
            const versionLayer = new VersionLayer(profileLayer);

            let error;
            try {
                const versionModel = await (await
                versionLayer
                    .scanVersionLayer())
                    .save();
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Profile version version1_id already exists/);
        });
    });
});
