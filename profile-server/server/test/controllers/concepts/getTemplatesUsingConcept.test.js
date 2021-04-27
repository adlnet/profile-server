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
const httpmocks = require('node-mocks-http');
const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const conceptController = require('../../../controllers/concepts');
const userModel = require('../../../ODM/models').user;
const organizationModel = require('../../../ODM/models').organization;
const profileVersionModel = require('../../../ODM/models').profileVersion;
const profileModel = require('../../../ODM/models').profile;
const templateModel = require('../../../ODM/models').template;
const conceptModel = require('../../../ODM/models').concept;

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

console.prodLog = console.log;

beforeEach(async () => {
    const cnnStr = await mongoServer.getUri();
    await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Getting statement templates from a given profile version that use a given concept', () => {
    describe('when i pass in a valid concept uuid', () => {
        let user;
        let org;
        let profile;
        let profileVersion;
        let concept;
        let concept2;
        let templateWithConcept1;
        let templateWithConcept2;
        let templateWithoutConcept;
        let templates;
        beforeEach(async () => {
            org = new organizationModel({ name: 'test' });
            await org.save();
            profileVersion = new profileVersionModel({ iri: 'pv_id', name: 'test_version', organization: org, description: 'test version desc' });
            templateWithConcept1 = new templateModel({ iri: 't1_id', name: 'test_template_1', parentProfile: profileVersion });
            templateWithConcept2 = new templateModel({ iri: 't2_id', name: 'test_template_2', parentProfile: profileVersion });

            templateWithoutConcept = new templateModel({ iri: 't3_id', name: 'test_template_not' });
            await templateWithoutConcept.save();
            profileVersion.templates.push(templateWithoutConcept);

            concept = new conceptModel({ iri: 'c1_id', name: 'test_concept' });
            await concept.save();

            concept2 = new conceptModel({ iri: 'c2_id', name: 'test_concept2' });
            await concept2.save();

            templateWithConcept1.verb = concept;
            templateWithConcept1.objectActivityType = concept2;
            await templateWithConcept1.save();
            profileVersion.templates.push(templateWithConcept1);

            templateWithConcept2.contextGroupingActivityType = [concept];
            await templateWithConcept2.save();
            profileVersion.templates.push(templateWithConcept2);
            await profileVersion.save();
        });

        afterEach(async () => {
            await org.remove();
            await profileVersion.remove();
            await templateWithConcept1.remove();
            await templateWithConcept2.remove();
            await templateWithoutConcept.remove();
            await concept2.remove();
            await concept.remove();
        });

        describe('and a valid profile version uuid', () => {
            test('it should return all templates in the given profile version that use that concept.', async () => {
                templates = await conceptController.getTemplatesUsingConcept(concept.uuid, profileVersion.uuid);

                expect(templates.length).toEqual(2);
                expect(templates.map(t => t.uuid).includes(templateWithConcept1.uuid)).toBeTruthy();
                expect(templates.map(t => t.uuid).includes(templateWithConcept2.uuid)).toBeTruthy();
            });
        });

        describe('and no profile version', () => {
            test('it should return all statement templates that use that concept.', async () => {
                const otherProfileVerision = new profileVersionModel({ name: 'other_test_version', organization: org });
                const otherTemplate = new templateModel({ iri: 't4_id', name: 'other_test_template', objectActivityType: concept, parentProfile: otherProfileVerision });
                await otherTemplate.save();

                templates = await conceptController.getTemplatesUsingConcept(concept.uuid);

                expect(templates.length).toEqual(3);
                expect(templates.map(t => t.uuid).includes(templateWithConcept1.uuid)).toBeTruthy();
                expect(templates.map(t => t.uuid).includes(templateWithConcept2.uuid)).toBeTruthy();
                expect(templates.map(t => t.uuid).includes(otherTemplate.uuid)).toBeTruthy();
            });
        });

        describe('and an invalid profile version uuid', () => {
            test('it should throw an error.', async () => {
                let error;
                try {
                    const templates = await conceptController.getTemplatesUsingConcept(concept.uuid, 'invalid_version_id');
                } catch (err) {
                    error = err.message;
                }
                expect(error).toMatch(/Invalid profile version id/);
            });
        });
    });

    describe('when i pass in an invalid concept uuid', () => {
        test('it should throw an error.', async () => {
            let error;
            try {
                const templates = await conceptController.getTemplatesUsingConcept('invalid_concept_id');
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/Invalid concept id/);
        });
    });
});
