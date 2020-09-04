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
const uuid = require('uuid').v4;

const models = require('../../ODM/models');
const createIRI = require('../../utils/createIRI');
const { createConcept } = require('../../controllers/concepts');
const profileVersions = require('../../routes/profileVersions');
const concept = require('../../ODM/concept');

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

beforeAll(async () => {
    const dburi = await mongoServer.getUri();
    await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
    // todo: need to create a working group and hold their uuid
});

afterAll(async () => {
    await mongoServer.stop();
});

async function createOrg(name) {
    const org = await new models.organization({ name: name });
    await org.save();

    return org;
}

async function createProfile(org, profiri) {
    const profile = new models.profile();
    profile.organization = org._id;
    profile.iri = profiri;
    await profile.save();

    return profile;
}

async function createDraft(org, profile, draftInfo) {
    const draft = new models.profileVersion(draftInfo);
    draft.organization = org._id;
    draft.parentProfile = profile._id;
    draft.uuid = uuid();
    draft.iri = `${profile.iri}/v/${draft.version}`;

    profile.currentDraftVersion = draft._id;
    await profile.save();
    await draft.save();

    return draft;
}

async function addConcept(profileVersion, conceptBody) {
    if (!conceptBody.iri) {
        const profileiri = (await profileVersion.populate('parentProfile').execPopulate()).parentProfile.iri;
        conceptBody.iri = createIRI.concept(profileiri, conceptBody.name, conceptBody.type);
    }

    const concept = new models.concept(conceptBody);
    concept.parentProfile = profileVersion._id;

    await concept.save();
    profileVersion.concepts.push(concept);
    profileVersion.updatedOn = new Date();
    await profileVersion.save();

    return concept;
}

test('concept test functions', async () => {
    const org = await createOrg('test');
    expect(org.uuid).toBeDefined();

    const profileIRI = 'https://tom.com/test/profile';
    const profile = await createProfile(org, profileIRI);
    expect(profile.uuid).toBeDefined();
    expect(profile.iri).toBe(profileIRI);

    const version = await createDraft(
        org,
        profile,
        {
            name: 'version 1',
            description: 'test version 1 of the profile',
        },
    );

    expect(version.uuid).toBeDefined();
    expect(version.name).toBe('version 1');
    expect(version.parentProfile).toBe(profile._id);

    const concept1 = await addConcept(
        version,
        {
            name: 'version 1 concept',
            description: 'version 1 concept description',
            type: 'Verb',
            conceptType: 'Verb',
        },
    );

    expect(concept1.uuid).toBeDefined();
    expect(concept1.name).toBe('version 1 concept');
    expect(concept1.type).toBe('Verb');
    expect(concept1.conceptType).toBe('Verb');
    expect(concept1.parentProfile).toBe(version._id);
});

test('concept test lang map', async () => {
    const org = await createOrg('test' + uuid());

    const profileIRI = 'https://tom.com/test/profile/2';
    const profile = await createProfile(org, profileIRI);

    const version = await createDraft(
        org,
        profile,
        {
            name: 'langmap prof',
            description: 'test langmap of the profile',
        },
    );

    const namelang = { fr: 'je suis Muzzy' };
    const desclang = { fr: 'je ne sais pas ce que c\'est' };
    const concept1 = await addConcept(
        version,
        {
            name: 'langmap concept',
            description: 'langmap concept description',
            type: 'Verb',
            conceptType: 'Verb',
            translations: [
                {
                    language: 'fr',
                    translationName: namelang.fr,
                },
                {
                    language: 'fr',
                    translationDesc: desclang.fr,
                },
            ],
        },
    );

    expect(concept1.uuid).toBeDefined();
    expect(concept1.name).toBe('langmap concept');
    expect(concept1.type).toBe('Verb');
    expect(concept1.conceptType).toBe('Verb');
    expect(concept1.parentProfile).toBe(version._id);
    const exported = await concept1.export(version.iri);
    expect(exported.prefLabel).toStrictEqual({ en: concept1.name, ...namelang });
});

describe('Export verb concept in profile JSON-LD format', () => {
    let org;
    let profile;
    let version;
    let concept1;

    beforeAll(async () => {
        org = await createOrg('mandatory');
        const profileIRI = 'https://tom.com/test/profile/mandatory-props';
        profile = await createProfile(org, profileIRI);
        version = await createDraft(
            org,
            profile,
            {
                name: 'mandatory props profile',
                description: 'test mandatory props of a concept export',
            },
        );
        concept1 = await addConcept(
            version,
            {
                name: 'mandatory props candidate',
                description: 'mandatory props concept',
                type: 'Verb',
                conceptType: 'Verb',
            },
        );
    });

    test('exported verb concept has mandatory properties', async () => {
        const exported = await concept1.export(version.iri);
        expect(exported.id).toBe(concept1.iri);
        expect(exported.type).toBe(concept1.type);
        expect(exported.inScheme).toBe(version.iri);
        expect(exported.prefLabel).toStrictEqual({ en: concept1.name });
        expect(exported.definition).toStrictEqual({ en: concept1.description });
    });

    test('similar terms are added to the export', async () => {
        const concept2 = await addConcept(
            version,
            {
                name: 'second concept',
                description: 'adding it to test similar terms',
                type: 'Verb',
                conceptType: 'Verb',
                similarTerms: [
                    {
                        concept: concept1,
                        relationType: 'related',
                    },
                ],
            },
        );
        const exported = await concept2.export();
        expect(exported.related).toContain(concept1.iri);
    });
});

describe('test extension concept export', () => {
    let org;
    let profile;
    let version;
    let concept1;

    beforeAll(async () => {
        org = await createOrg('extension');
        const profileIRI = 'https://tom.com/test/profile/extension-concepts';
        profile = await createProfile(org, profileIRI);
        version = await createDraft(
            org,
            profile,
            {
                name: 'extension concept profile',
                description: 'test extension concept export',
            },
        );
        concept1 = await addConcept(
            version,
            {
                name: 'mandatory props candidate',
                description: 'mandatory props concept',
                type: 'ContextExtension',
                conceptType: 'Extension',
            },
        );
    });

    test('context extension export mandatory', async () => {
        const exported = await concept1.export(version.iri);
        expect(exported.id).toBe(concept1.iri);
        expect(exported.type).toBe(concept1.type);
        expect(exported.inScheme).toBe(version.iri);
        expect(exported.prefLabel).toStrictEqual({ en: concept1.name });
        expect(exported.definition).toStrictEqual({ en: concept1.description });
    });

    test('context/result extension export extras', async () => {
        const verb1 = await addConcept(
            version,
            {
                name: 'tested',
                description: 'tested the concept creation',
                type: 'Verb',
                conceptType: 'Verb',
            },
        );

        const concept2 = await addConcept(
            version,
            {
                name: 'extras context extension concept',
                description: 'testing the other context properties for an extension concept',
                type: 'ContextExtension',
                conceptType: 'Extension',
                recommendedTerms: [verb1._id],
                inlineSchema: '{ "type": "object", "properties":{ "rank": {"type": "number", "required": true}, "medal": {"type": "string"}}}',
            },
        );

        const exported = await concept2.export();

        expect(exported.type).toBe('ContextExtension');
        expect(exported.recommendedVerbs).toContain(verb1.iri);
        expect(exported.inlineSchema).toBe('{ "type": "object", "properties":{ "rank": {"type": "number", "required": true}, "medal": {"type": "string"}}}');
        expect(exported.schema).not.toBeDefined();
    });

    test('activity extension recommendedActivityTypes', async () => {
        const acttype1 = await addConcept(
            version,
            {
                name: 'sometype',
                description: 'test activity type ',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        const actextconcept1 = await addConcept(
            version,
            {
                name: 'activity extension concept',
                description: 'testing the properties for an activity extension concept',
                type: 'ActivityExtension',
                conceptType: 'Extension',
                recommendedTerms: [acttype1._id],
                schemaString: 'https://tom.com/schemas/actext1',
            },
        );

        const exported = await actextconcept1.export();

        expect(exported.type).toBe('ActivityExtension');
        expect(exported.recommendedActivityTypes).toContain(acttype1.iri);
        expect(exported.schema).toBe('https://tom.com/schemas/actext1');
        expect(exported.inlineSchema).not.toBeDefined();
        expect(exported.recommendedVerbs).not.toBeDefined();
    });
});

describe('export of document type concepts', () => {
    let org;
    let profile;
    let version;
    let concept1;

    beforeAll(async () => {
        org = await createOrg('document');
        const profileIRI = 'https://tom.com/test/profile/document-concepts';
        profile = await createProfile(org, profileIRI);
        version = await createDraft(
            org,
            profile,
            {
                name: 'document concept profile',
                description: 'test document concept export',
            },
        );
        concept1 = await addConcept(
            version,
            {
                name: 'mandatory props candidate',
                description: 'mandatory props concept',
                type: 'StateResource',
                conceptType: 'Document',
                mediaType: 'application/json',
            },
        );
    });

    test('state resource export mandatory', async () => {
        const exported = await concept1.export(version.iri);
        expect(exported.id).toBe(concept1.iri);
        expect(exported.type).toBe(concept1.type);
        expect(exported.inScheme).toBe(version.iri);
        expect(exported.prefLabel).toStrictEqual({ en: concept1.name });
        expect(exported.definition).toStrictEqual({ en: concept1.description });
        expect(exported.contentType).toBe(concept1.mediaType);
    });

    test('optional context prop', async () => {
        const concept2 = await addConcept(
            version,
            {
                name: 'optional context prop candidate',
                description: 'optional context prop concept',
                type: 'AgentProfileResource',
                conceptType: 'Document',
                mediaType: 'application/json',
                contextIri: 'https://tom.com/context/iri',
            },
        );
        const exported = await concept2.export();
        expect(exported.id).toBe(concept2.iri);
        expect(exported.context).toBe(concept2.contextIri);
    });

    test('optional schema prop', async () => {
        const concept3 = await addConcept(
            version,
            {
                name: 'optional schema prop candidate',
                description: 'optional schema prop concept',
                type: 'ActivityProfileResource',
                conceptType: 'Document',
                mediaType: 'application/json',
                schemaString: 'https://tom.com/schema/iri',
            },
        );
        const exported = await concept3.export();
        expect(exported.id).toBe(concept3.iri);
        expect(exported.schema).toBe(concept3.schemaString);
    });

    test('optional inlineschema prop', async () => {
        const concept4 = await addConcept(
            version,
            {
                name: 'optional inlineschema prop candidate',
                description: 'optional inlineschema prop concept',
                type: 'StateResource',
                conceptType: 'Document',
                mediaType: 'application/json',
                inlineSchema: '{ "type": "object", "properties":{ "rank": {"type": "number", "required": true}, "medal": {"type": "string"}}}',
            },
        );
        const exported = await concept4.export();
        expect(exported.id).toBe(concept4.iri);
        expect(exported.inlineSchema).toBe(concept4.inlineSchema);
    });
});

describe('test activity concept export', () => {
    let org;
    let profile;
    let version;
    let concept1;

    beforeAll(async () => {
        org = await createOrg('activity');
        const profileIRI = 'https://tom.com/test/profile/activity-concepts';
        profile = await createProfile(org, profileIRI);
        version = await createDraft(
            org,
            profile,
            {
                name: 'activity concept profile',
                description: 'test activity concept export',
            },
        );
        concept1 = await addConcept(
            version,
            {
                name: 'mandatory props candidate',
                description: 'mandatory props concept',
                type: 'Activity',
                conceptType: 'Activity',
            },
        );
    });

    test('activity concept export mandatory', async () => {
        const exported = await concept1.export(version.iri);
        expect(exported.id).toBe(concept1.iri);
        expect(exported.type).toBe(concept1.type);
        expect(exported.inScheme).toBe(version.iri);
        expect(exported.activityDefinition['@context']).toBe('https://w3id.org/xapi/profiles/activity-context');
    });

    test('activity concept export activity definition', async () => {
        const concept2 = await addConcept(
            version,
            {
                name: 'activity def props candidate',
                description: 'activity def props concept',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'https://tom.com/activity/types/iri',
                moreInformation: 'https://tom.com/info/moreinfo',
                extensions: { 'http://tom.com/foo': 'foo' },
            },
        );

        const exported = await concept2.export();
        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: concept2.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: concept2.description });
        expect(exported.activityDefinition.type).toBe(concept2.activityType);
        expect(exported.activityDefinition.moreInfo).toBe(concept2.moreInformation);
        expect(exported.activityDefinition.extensions).toStrictEqual(concept2.extensions);
        // act def interaction props
    });

    test('choice interaction activity concept export', async () => {
        const choice = await addConcept(
            version,
            {
                name: 'interaction activity candidate',
                description: 'interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'choice',
                correctResponsesPattern: ['golf[,]tetris'],
                choices: [
                    {
                        id: 'golf',
                        description: {
                            'en-US': 'Golf Example',
                        },
                    },
                    {
                        id: 'facebook',
                        description: {
                            'en-US': 'Facebook App',
                        },
                    },
                    {
                        id: 'tetris',
                        description: {
                            'en-US': 'Tetris Example',
                        },
                    },
                    {
                        id: 'scrabble',
                        description: {
                            'en-US': 'Scrabble Example',
                        },
                    },
                ],
            },
        );
        const exported = await choice.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: choice.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: choice.description });
        expect(exported.activityDefinition.type).toBe(choice.activityType);
        expect(exported.activityDefinition.interactionType).toBe(choice.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(choice.correctResponsesPattern)));
        expect(exported.activityDefinition.choices).toStrictEqual(JSON.parse(JSON.stringify(choice.choices)));
    });

    test('sequence interaction activity concept export', async () => {
        const sequence = await addConcept(
            version,
            {
                name: 'sequence interaction activity candidate',
                description: 'sequence interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'sequencing',
                correctResponsesPattern: ['a[,]b[,]c[,]d'],
                choices: [
                    {
                        id: 'a',
                        description: {
                            'en-US': 'a',
                        },
                    },
                    {
                        id: 'b',
                        description: {
                            'en-US': 'b',
                        },
                    },
                    {
                        id: 'c',
                        description: {
                            'en-US': 'c',
                        },
                    },
                    {
                        id: 'd',
                        description: {
                            'en-US': 'd',
                        },
                    },
                ],
            },
        );
        const exported = await sequence.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: sequence.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: sequence.description });
        expect(exported.activityDefinition.type).toBe(sequence.activityType);
        expect(exported.activityDefinition.interactionType).toBe(sequence.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(sequence.correctResponsesPattern)));
        expect(exported.activityDefinition.choices).toStrictEqual(JSON.parse(JSON.stringify(sequence.choices)));
    });

    test('likert interaction activity concept export', async () => {
        const likert = await addConcept(
            version,
            {
                name: 'likert interaction activity candidate',
                description: 'likert interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'likert',
                correctResponsesPattern: ['c'],
                scale: [
                    {
                        id: 'a',
                        description: {
                            'en-US': 'a',
                        },
                    },
                    {
                        id: 'b',
                        description: {
                            'en-US': 'b',
                        },
                    },
                    {
                        id: 'c',
                        description: {
                            'en-US': 'c',
                        },
                    },
                    {
                        id: 'd',
                        description: {
                            'en-US': 'd',
                        },
                    },
                ],
            },
        );
        const exported = await likert.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: likert.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: likert.description });
        expect(exported.activityDefinition.type).toBe(likert.activityType);
        expect(exported.activityDefinition.interactionType).toBe(likert.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(likert.correctResponsesPattern)));
        expect(exported.activityDefinition.scale).toBeDefined();
        expect(exported.activityDefinition.scale).toStrictEqual(JSON.parse(JSON.stringify(likert.scale)));
        expect(exported.activityDefinition.choices).not.toBeDefined();
    });

    test('matching interaction activity concept export', async () => {
        const matching = await addConcept(
            version,
            {
                name: 'matching interaction activity candidate',
                description: 'matching interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'matching',
                correctResponsesPattern: ['a[.]1[,]b[.]2[,]c[.]3[,]d[.]4'],
                source: [
                    {
                        id: 'a',
                        description: {
                            'en-US': 'a',
                        },
                    },
                    {
                        id: 'b',
                        description: {
                            'en-US': 'b',
                        },
                    },
                    {
                        id: 'c',
                        description: {
                            'en-US': 'c',
                        },
                    },
                    {
                        id: 'd',
                        description: {
                            'en-US': 'd',
                        },
                    },
                ],
                target: [
                    {
                        id: '1',
                        description: {
                            'en-US': '1',
                        },
                    },
                    {
                        id: '2',
                        description: {
                            'en-US': '2',
                        },
                    },
                    {
                        id: '3',
                        description: {
                            'en-US': '3',
                        },
                    },
                    {
                        id: '4',
                        description: {
                            'en-US': '4',
                        },
                    },
                ],
            },
        );
        const exported = await matching.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: matching.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: matching.description });
        expect(exported.activityDefinition.type).toBe(matching.activityType);
        expect(exported.activityDefinition.interactionType).toBe(matching.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(matching.correctResponsesPattern)));
        expect(exported.activityDefinition.source).toBeDefined();
        expect(exported.activityDefinition.source).toStrictEqual(JSON.parse(JSON.stringify(matching.source)));
        expect(exported.activityDefinition.target).toBeDefined();
        expect(exported.activityDefinition.target).toStrictEqual(JSON.parse(JSON.stringify(matching.target)));
    });

    test('performance interaction activity concept export', async () => {
        const performance = await addConcept(
            version,
            {
                name: 'performance interaction activity candidate',
                description: 'performance interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'performance',
                correctResponsesPattern: ['a[.][,]b[.][,]c[.]'],
                steps: [
                    {
                        id: 'a',
                        description: {
                            'en-US': 'a',
                        },
                    },
                    {
                        id: 'b',
                        description: {
                            'en-US': 'b',
                        },
                    },
                    {
                        id: 'c',
                        description: {
                            'en-US': 'c',
                        },
                    },
                ],
            },
        );
        const exported = await performance.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: performance.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: performance.description });
        expect(exported.activityDefinition.type).toBe(performance.activityType);
        expect(exported.activityDefinition.interactionType).toBe(performance.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(performance.correctResponsesPattern)));
        expect(exported.activityDefinition.steps).toBeDefined();
        expect(exported.activityDefinition.steps).toStrictEqual(JSON.parse(JSON.stringify(performance.steps)));
    });

    test('true-false interaction activity concept export', async () => {
        const tf = await addConcept(
            version,
            {
                name: 'true-false interaction activity candidate',
                description: 'true-false interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'true-false',
                correctResponsesPattern: ['true'],
            },
        );
        const exported = await tf.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: tf.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: tf.description });
        expect(exported.activityDefinition.type).toBe(tf.activityType);
        expect(exported.activityDefinition.interactionType).toBe(tf.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(tf.correctResponsesPattern)));
    });

    test('fill-in interaction activity concept export', async () => {
        const fi = await addConcept(
            version,
            {
                name: 'fill-in interaction activity candidate',
                description: 'fill-in interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'fill-in',
                correctResponsesPattern: ['test fillin'],
            },
        );
        const exported = await fi.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: fi.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: fi.description });
        expect(exported.activityDefinition.type).toBe(fi.activityType);
        expect(exported.activityDefinition.interactionType).toBe(fi.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(fi.correctResponsesPattern)));
    });

    test('long-fill-in interaction activity concept export', async () => {
        const lfi = await addConcept(
            version,
            {
                name: 'long-fill-in interaction activity candidate',
                description: 'long-fill-in interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'long-fill-in',
                correctResponsesPattern: ['something longer than regular fill in'],
            },
        );
        const exported = await lfi.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: lfi.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: lfi.description });
        expect(exported.activityDefinition.type).toBe(lfi.activityType);
        expect(exported.activityDefinition.interactionType).toBe(lfi.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(lfi.correctResponsesPattern)));
    });

    test('numeric interaction activity concept export', async () => {
        const numeric = await addConcept(
            version,
            {
                name: 'numeric interaction activity candidate',
                description: 'numeric interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'numeric',
                correctResponsesPattern: ['4[:]15'],
            },
        );
        const exported = await numeric.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: numeric.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: numeric.description });
        expect(exported.activityDefinition.type).toBe(numeric.activityType);
        expect(exported.activityDefinition.interactionType).toBe(numeric.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(numeric.correctResponsesPattern)));
    });

    test('other interaction activity concept export', async () => {
        const other = await addConcept(
            version,
            {
                name: 'other interaction activity candidate',
                description: 'other interaction activity concept export test',
                type: 'Activity',
                conceptType: 'Activity',
                activityType: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'other',
                correctResponsesPattern: ['other stuff'],
            },
        );
        const exported = await other.export();

        expect(exported.name).not.toBeDefined();
        expect(exported.definition).not.toBeDefined();
        expect(exported.activityDefinition.name).toStrictEqual({ en: other.name });
        expect(exported.activityDefinition.description).toStrictEqual({ en: other.description });
        expect(exported.activityDefinition.type).toBe(other.activityType);
        expect(exported.activityDefinition.interactionType).toBe(other.interactionType);
        expect(exported.activityDefinition.correctResponsesPattern).toStrictEqual(JSON.parse(JSON.stringify(other.correctResponsesPattern)));
    });
});
