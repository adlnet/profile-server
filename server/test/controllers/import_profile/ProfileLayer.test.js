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
const ProfileLayer = require('../../../controllers/importProfile/ProfileLayer')
    .ProfileLayer;
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

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
});
