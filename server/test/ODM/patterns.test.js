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
const jsonschema = require('../../profileValidator/schemas/jsonschema');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const uuid = require('uuid').v4;

const models = require('../../ODM/models');
const createIRI = require('../../utils/createIRI');

const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

async function createOrg(name) {
    const org = await new models.organization({ name: name });
    await org.save();
    return org;
}

async function createProfile(org, profileiri) {
    const profile = new models.profile();
    profile.organization = org._id;
    profile.iri = profileiri;
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

async function createTemplate(profileVersion, templateBody) {
    if (!templateBody.iri) {
        const profileiri = (await profileVersion.populate('parentProfile').execPopulate()).parentProfile.iri;
        templateBody.iri = createIRI.template(profileiri, templateBody.name);
    }

    templateBody.parentProfile = profileVersion._id;

    const template = new models.template(templateBody);
    await template.save();
    profileVersion.templates.push(template);
    profileVersion.updatedOn = new Date();
    await profileVersion.save();

    return template;
}

async function createPattern(profileVersion, patternBody) {
    if (!patternBody.iri) {
        const profileiri = (await profileVersion.populate('parentProfile').execPopulate()).parentProfile.iri;
        patternBody.iri = createIRI.pattern(profileiri, patternBody.name);
    }

    patternBody.parentProfile = profileVersion._id;

    const pattern = new models.pattern(patternBody);
    await pattern.save();
    profileVersion.patterns.push(pattern);
    profileVersion.updatedOn = new Date();
    await profileVersion.save();

    return pattern;
}

async function populateDb() {
    const org = await createOrg(uuid());
    const profileIRI = 'https://tom.com/test/profile/' + uuid();
    const profile = await createProfile(org, profileIRI);
    const version = await createDraft(
        org,
        profile,
        {
            name: 'draft profile' + uuid(),
            description: 'test profile for export',
        },
    );
    const verbconcept = await addConcept(
        version,
        {
            name: 'concept ' + uuid(),
            description: 'concept for testing export',
            type: 'Verb',
            conceptType: 'Verb',
        },
    );

    const template = await createTemplate(version, {
        name: 'template ' + uuid(),
        description: 'template description for testing patterns',
        verb: verbconcept._id,
    });

    return {
        org,
        profile,
        version,
        verbconcept,
        template,
    };
}

describe('pattern setup', () => {
    let org;
    let profile;
    let version;
    let verbconcept;
    let template;

    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept = data.verbconcept;
        template = data.template;
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('test basic setup worked', async () => {
        expect(org.name).toBeDefined();
        expect(profile.organization).toBe(org._id);
        expect(version.parentProfile._id).toStrictEqual(profile._id);
        expect(verbconcept.parentProfile).toBe(version._id);
        expect(template.parentProfile).toBe(version._id);
    });
});

describe('test basics of pattern export', () => {
    let org;
    let profile;
    let version;
    let verbconcept;
    let acttypeconcept;
    let template;
    let pattern;
    let exported;
    const patternName = 'the pattern';
    const patternDescription = 'the description of the pattern';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept = data.verbconcept;
        template = data.template;

        pattern = await createPattern(version, {
            name: patternName,
            description: patternDescription,
            translations: [
                {
                    language: 'fr',
                    translationName: 'french translation name',
                },
                {
                    language: 'fr',
                    translationDesc: 'french translation description',
                },
            ],
        });

        exported = await pattern.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('id is the iri of the template', async () => {
        expect(exported.id).toBe(pattern.iri);
    });

    test('type is Pattern', async () => {
        expect(exported.type).toBe('Pattern');
    });

    test('primary defaults to undefined', async () => {
        expect(exported.primary).toBeFalsy();
    });

    test('inScheme is the iri of the profile version', async () => {
        expect(exported.inScheme).toBe(version.iri);
    });

    test('template name should return the right value', async () => {
        expect(exported.prefLabel.en).toBe(patternName);
    });

    test('template definition should be the en description', async () => {
        expect(exported.definition.en).toBe(patternDescription);
    });

    test('prefLabel fr to be the translation name set for the pattern', async () => {
        expect(exported.prefLabel.fr).toBe('french translation name');
    });

    test('definition fr to be the translation description set for the pattern', async () => {
        expect(exported.definition.fr).toBe('french translation description');
    });

    test('alternates does not exist', async () => {
        expect(exported.alternates).toBeUndefined();
    });

    test('optional does not exist', async () => {
        expect(exported.optional).toBeUndefined();
    });

    test('oneOrMore does not exist', async () => {
        expect(exported.oneOrMore).toBeUndefined();
    });

    test('sequence does not exist', async () => {
        expect(exported.sequence).toBeUndefined();
    });

    test('zeroOrMore does not exist', async () => {
        expect(exported.zeroOrMore).toBeUndefined();
    });
});

describe('test alternates of pattern export', () => {
    let org;
    let profile;
    let version;
    let verbconcept;
    let acttypeconcept;
    let template;
    let concept2;
    let template2;
    let pattern;
    let exported;
    const patternName = 'the pattern';
    const patternDescription = 'the description of the pattern';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept = data.verbconcept;
        template = data.template;

        concept2 = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing export',
                type: 'Verb',
                conceptType: 'Verb',
            },
        );

        template2 = await createTemplate(version, {
            name: 'template2 ' + uuid(),
            description: 'template2 description for testing patterns',
            verb: concept2._id,
        });

        pattern = await createPattern(version, {
            name: patternName,
            description: patternDescription,
            alternates: [
                new models.patternComponent({
                    component: template,
                    componentType: 'template',
                }),
                new models.patternComponent({
                    component: template2,
                    componentType: 'template',
                }),
            ],
        });

        exported = await pattern.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('id is the iri of the template', async () => {
        expect(exported.id).toBe(pattern.iri);
    });

    test('alternates contains 2 components', async () => {
        expect(exported.alternates.length).toBe(2);
    });

    test('alternates array matches the 2 ids of the templates', async () => {
        expect(exported.alternates).toStrictEqual([template.iri, template2.iri]);
    });
});

describe('test optional of pattern export', () => {
    let org;
    let profile;
    let version;
    let verbconcept;
    let acttypeconcept;
    let template;
    let concept2;
    let template2;
    let pattern;
    let exported;
    const patternName = 'the pattern';
    const patternDescription = 'the description of the pattern';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept = data.verbconcept;
        template = data.template;

        pattern = await createPattern(version, {
            name: patternName,
            description: patternDescription,
            optional:
                new models.patternComponent({
                    component: template,
                    componentType: 'template',
                }),
        });

        exported = await pattern.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('id is the iri of the template', async () => {
        expect(exported.id).toBe(pattern.iri);
    });

    test('optional matches the iri of the template', async () => {
        expect(exported.optional).toBe(template.iri);
    });
});

describe('test oneOrMore of pattern export', () => {
    let org;
    let profile;
    let version;
    let verbconcept;
    let acttypeconcept;
    let template;
    let concept2;
    let template2;
    let pattern;
    let exported;
    const patternName = 'the pattern';
    const patternDescription = 'the description of the pattern';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept = data.verbconcept;
        template = data.template;

        pattern = await createPattern(version, {
            name: patternName,
            description: patternDescription,
            oneOrMore:
                new models.patternComponent({
                    component: template,
                    componentType: 'template',
                }),
        });

        exported = await pattern.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('id is the iri of the template', async () => {
        expect(exported.id).toBe(pattern.iri);
    });

    test('oneOrMore matches the iri of the template', async () => {
        expect(exported.oneOrMore).toBe(template.iri);
    });
});

describe('test sequence of pattern export', () => {
    let org;
    let profile;
    let version;
    let verbconcept;
    let acttypeconcept;
    let template;
    let concept2;
    let template2;
    let pattern;
    let pattern2;
    let exported;
    const patternName = 'the pattern';
    const patternDescription = 'the description of the pattern';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept = data.verbconcept;
        template = data.template;

        concept2 = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing export',
                type: 'Verb',
                conceptType: 'Verb',
            },
        );

        template2 = await createTemplate(version, {
            name: 'template2 ' + uuid(),
            description: 'template2 description for testing patterns',
            verb: concept2._id,
        });

        pattern2 = await createPattern(version, {
            name: 'pattern2',
            description: 'p2 desc',
            oneOrMore: new models.patternComponent({
                component: template2,
                componentType: 'template',
            }),
        });

        pattern = await createPattern(version, {
            name: patternName,
            description: patternDescription,
            primary: true,
            sequence: [
                new models.patternComponent({
                    component: template,
                    componentType: 'template',
                }),
                new models.patternComponent({
                    component: pattern2,
                    componentType: 'pattern',
                }),
            ],
        });

        exported = await pattern.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('id is the iri of the template', async () => {
        expect(exported.id).toBe(pattern.iri);
    });

    test('pattern is primary', async () => {
        expect(exported.primary).toBe(true);
    });

    test('sequence contains 2 components', async () => {
        expect(exported.sequence.length).toBe(2);
    });

    test('sequence array matches the 2 ids of the components', async () => {
        expect(exported.sequence).toStrictEqual([template.iri, pattern2.iri]);
    });
});

describe('test zeroOrMore of pattern export', () => {
    let org;
    let profile;
    let version;
    let verbconcept;
    let acttypeconcept;
    let template;
    let concept2;
    let template2;
    let pattern;
    let exported;
    const patternName = 'the pattern';
    const patternDescription = 'the description of the pattern';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept = data.verbconcept;
        template = data.template;

        pattern = await createPattern(version, {
            name: patternName,
            description: patternDescription,
            zeroOrMore:
                new models.patternComponent({
                    component: template,
                    componentType: 'template',
                }),
        });

        exported = await pattern.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('id is the iri of the template', async () => {
        expect(exported.id).toBe(pattern.iri);
    });

    test('zeroOrMore matches the iri of the template', async () => {
        expect(exported.zeroOrMore).toBe(template.iri);
    });
});
