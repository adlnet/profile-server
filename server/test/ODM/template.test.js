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
const { rest } = require('lodash');

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
    const verbconcept1 = await addConcept(
        version,
        {
            name: 'concept ' + uuid(),
            description: 'concept for testing export',
            type: 'Verb',
            conceptType: 'Verb',
        },
    );

    return {
        org,
        profile,
        version,
        verbconcept1,
    };
}

describe('template setup', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;

    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('test basic setup worked', async () => {
        expect(org.name).toBeDefined();
        expect(profile.organization).toBe(org._id);
        expect(version.parentProfile._id).toStrictEqual(profile._id);
        expect(verbconcept1.parentProfile).toBe(version._id);
    });
});

describe('test basics of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let acttypeconcept;
    let template;
    let exported;
    const templateName = 'template basic';
    const templateDescription = 'the description of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        acttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing export',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            objectActivityType: acttypeconcept._id,
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('id is the iri of the template', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('type is StatementTemplate', async () => {
        expect(exported.type).toBe('StatementTemplate');
    });

    test('inScheme is the iri of the profile version', async () => {
        expect(exported.inScheme).toBe(version.iri);
    });

    test('template name should return the right value', async () => {
        expect(exported.prefLabel.en).toBe(templateName);
    });

    test('template definition should be the en description', async () => {
        expect(exported.definition.en).toBe(templateDescription);
    });

    test('the verb is added to this template', async () => {
        expect(exported.verb).toBe(verbconcept1.iri);
    });

    test('the objectActivityType is added to this template', async () => {
        expect(exported.objectActivityType).toBe(acttypeconcept.iri);
    });

    test('rules does not exist', async () => {
        expect(exported.rules).toBeUndefined();
    });
});

describe('test language maps of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let acttypeconcept;
    let template;
    let exported;
    const templateName = 'template lang maps';
    const templateDescription = 'the description of the template lang map tests';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        acttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing export',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            objectActivityType: acttypeconcept._id,
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
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('preflabel en is the name of the template', async () => {
        expect(exported.prefLabel.en).toBe(templateName);
    });

    test('prefLabel fr to be the translation name set for the template', async () => {
        expect(exported.prefLabel.fr).toBe('french translation name');
    });

    test('definition en is the description of the template', async () => {
        expect(exported.definition.en).toBe(templateDescription);
    });

    test('definition fr to be the translation description set for the template', async () => {
        expect(exported.definition.fr).toBe('french translation description');
    });
});

describe('test contextGroupingActivityType of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let acttypeconcept;
    let acttypeconcept2;
    let template;
    let exported;
    const templateName = 'template contextGroupingActivityType';
    const templateDescription = 'the contextGroupingActivityType of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        acttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing contextGroupingActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        acttypeconcept2 = await addConcept(
            version,
            {
                name: 'concept 2 ' + uuid(),
                description: 'concept 2 for testing contextGroupingActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            contextGroupingActivityType: [
                acttypeconcept._id,
                acttypeconcept2._id,
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export has contextGroupingActivityTypes', async () => {
        expect(exported.contextGroupingActivityType.length).toBe(2);
    });

    test('contextGroupingActivityTypes to contain first activity type concept iri', async () => {
        expect(exported.contextGroupingActivityType).toContain(acttypeconcept.iri);
    });

    test('contextGroupingActivityTypes to contain second activity type concept iri', async () => {
        expect(exported.contextGroupingActivityType).toContain(acttypeconcept2.iri);
    });
});

describe('test contextParentActivityType of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let acttypeconcept;
    let acttypeconcept2;
    let template;
    let exported;
    const templateName = 'template contextParentActivityType';
    const templateDescription = 'the contextParentActivityType of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        acttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing contextParentActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        acttypeconcept2 = await addConcept(
            version,
            {
                name: 'concept 2 ' + uuid(),
                description: 'concept 2 for testing contextParentActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            contextParentActivityType: [
                acttypeconcept._id,
                acttypeconcept2._id,
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export has contextParentActivityType', async () => {
        expect(exported.contextParentActivityType.length).toBe(2);
    });

    test('contextParentActivityType to contain first activity type concept iri', async () => {
        expect(exported.contextParentActivityType).toContain(acttypeconcept.iri);
    });

    test('contextParentActivityType to contain second activity type concept iri', async () => {
        expect(exported.contextParentActivityType).toContain(acttypeconcept2.iri);
    });
});

describe('test contextOtherActivityType of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let acttypeconcept;
    let acttypeconcept2;
    let template;
    let exported;
    const templateName = 'template contextOtherActivityType';
    const templateDescription = 'the contextOtherActivityType of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        acttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing contextOtherActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        acttypeconcept2 = await addConcept(
            version,
            {
                name: 'concept 2 ' + uuid(),
                description: 'concept 2 for testing contextOtherActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            contextOtherActivityType: [
                acttypeconcept._id,
                acttypeconcept2._id,
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export has contextOtherActivityType', async () => {
        expect(exported.contextOtherActivityType.length).toBe(2);
    });

    test('contextOtherActivityType to contain first activity type concept iri', async () => {
        expect(exported.contextOtherActivityType).toContain(acttypeconcept.iri);
    });

    test('contextOtherActivityType to contain second activity type concept iri', async () => {
        expect(exported.contextOtherActivityType).toContain(acttypeconcept2.iri);
    });
});

describe('test contextCategoryActivityType of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let acttypeconcept;
    let acttypeconcept2;
    let template;
    let exported;
    const templateName = 'template contextCategoryActivityType';
    const templateDescription = 'the contextCategoryActivityType of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        acttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing contextCategoryActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        acttypeconcept2 = await addConcept(
            version,
            {
                name: 'concept 2 ' + uuid(),
                description: 'concept 2 for testing contextCategoryActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            contextCategoryActivityType: [
                acttypeconcept._id,
                acttypeconcept2._id,
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export has contextCategoryActivityType', async () => {
        expect(exported.contextCategoryActivityType.length).toBe(2);
    });

    test('contextCategoryActivityType to contain first activity type concept iri', async () => {
        expect(exported.contextCategoryActivityType).toContain(acttypeconcept.iri);
    });

    test('contextCategoryActivityType to contain second activity type concept iri', async () => {
        expect(exported.contextCategoryActivityType).toContain(acttypeconcept2.iri);
    });
});

describe('test attachmentUsageType of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let atttypeconcept;
    let atttypeconcept2;
    let template;
    let exported;
    const templateName = 'template attachmentUsageType';
    const templateDescription = 'the attachmentUsageType of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        atttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing attachmentUsageType',
                type: 'AttachmentUsageType',
                conceptType: 'AttachmentUsageType',
            },
        );

        atttypeconcept2 = await addConcept(
            version,
            {
                name: 'concept 2 ' + uuid(),
                description: 'concept 2 for testing attachmentUsageType',
                type: 'AttachmentUsageType',
                conceptType: 'AttachmentUsageType',
            },
        );

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            attachmentUsageType: [
                atttypeconcept._id,
                atttypeconcept2._id,
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export has attachmentUsageType', async () => {
        expect(exported.attachmentUsageType.length).toBe(2);
    });

    test('attachmentUsageType to contain first activity type concept iri', async () => {
        expect(exported.attachmentUsageType).toContain(atttypeconcept.iri);
    });

    test('attachmentUsageType to contain second activity type concept iri', async () => {
        expect(exported.attachmentUsageType).toContain(atttypeconcept2.iri);
    });
});

describe('test multiple references of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let atttypeconcept;
    let atttypeconcept2;
    let acttypeconcept;
    let acttypeconcept2;
    let template;
    let exported;
    const templateName = 'template attachmentUsageType';
    const templateDescription = 'the attachmentUsageType of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        acttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing contextCategoryActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        acttypeconcept2 = await addConcept(
            version,
            {
                name: 'concept 2 ' + uuid(),
                description: 'concept 2 for testing contextCategoryActivityType',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        atttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing attachmentUsageType',
                type: 'AttachmentUsageType',
                conceptType: 'AttachmentUsageType',
            },
        );

        atttypeconcept2 = await addConcept(
            version,
            {
                name: 'concept 2 ' + uuid(),
                description: 'concept 2 for testing attachmentUsageType',
                type: 'AttachmentUsageType',
                conceptType: 'AttachmentUsageType',
            },
        );

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            contextCategoryActivityType: [
                acttypeconcept,
            ],
            objectActivityType: acttypeconcept2,
            attachmentUsageType: [
                atttypeconcept._id,
                atttypeconcept2._id,
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });



    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export has objectActivityType', async () => {
        expect(exported.objectActivityType).toBe(acttypeconcept2.iri);
    });

    test('template export has contextCategoryActivityType', async () => {
        expect(exported.contextCategoryActivityType.length).toBe(1);
    });

    test('contextCategoryActivityType contains the activity type concept iri', async () => {
        expect(exported.contextCategoryActivityType).toContain(acttypeconcept.iri);
    });

    test('template export has attachmentUsageType', async () => {
        expect(exported.attachmentUsageType.length).toBe(2);
    });

    test('attachmentUsageType to contain first attachment type concept iri', async () => {
        expect(exported.attachmentUsageType).toContain(atttypeconcept.iri);
    });

    test('attachmentUsageType to contain second attachment type concept iri', async () => {
        expect(exported.attachmentUsageType).toContain(atttypeconcept2.iri);
    });
});

describe('test objectStatementRefTemplate of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let acttypeconcept;
    let verbconcept2;
    let objtemplate;
    let template;
    let exported;
    const templateName = 'template objectStatementRefTemplate';
    const templateDescription = 'the objectStatementRefTemplate of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    beforeEach(async () => {
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        acttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing objectStatementRefTemplate',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        verbconcept2 = await addConcept(
            version,
            {
                name: 'concept 2 ' + uuid(),
                description: 'concept 2 for testing objectStatementRefTemplate',
                type: 'Verb',
                conceptType: 'Verb',
            },
        );

        objtemplate = await createTemplate(version, {
            name: templateName + '1',
            description: templateDescription,
            verb: verbconcept1._id,
        });

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept2._id,
            objectStatementRefTemplate: [
                objtemplate,
            ],
        });
        exported = await template.export(version.iri);
    });

    afterEach(async () => {
        await org.remove();
        await profile.remove();
        await version.remove();
        await verbconcept1.remove();
        await acttypeconcept.remove();
        await verbconcept2.remove();
        await objtemplate.remove();
        await template.remove();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export has objectStatementRefTemplate', async () => {
        expect(exported.objectStatementRefTemplate.length).toBe(1);
    });

    test('objectStatementRefTemplate to contain first activity type concept iri', async () => {
        expect(exported.objectStatementRefTemplate).toContain(objtemplate.iri);
    });
});

describe('test contextStatementRefTemplate of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let acttypeconcept;
    let verbconcept2;
    let ctxtemplate;
    let template;
    let exported;
    const templateName = 'template contextStatementRefTemplate';
    const templateDescription = 'the contextStatementRefTemplate of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        acttypeconcept = await addConcept(
            version,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing contextStatementRefTemplate',
                type: 'ActivityType',
                conceptType: 'ActivityType',
            },
        );

        verbconcept2 = await addConcept(
            version,
            {
                name: 'concept 2 ' + uuid(),
                description: 'concept 2 for testing contextStatementRefTemplate',
                type: 'Verb',
                conceptType: 'Verb',
            },
        );

        ctxtemplate = await createTemplate(version, {
            name: templateName + '1',
            description: templateDescription,
            verb: verbconcept1._id,
        });

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept2._id,
            contextStatementRefTemplate: [
                ctxtemplate,
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export has contextStatementRefTemplate', async () => {
        expect(exported.contextStatementRefTemplate.length).toBe(1);
    });

    test('contextStatementRefTemplate to contain first activity type concept iri', async () => {
        expect(exported.contextStatementRefTemplate).toContain(ctxtemplate.iri);
    });
});

describe('test rules of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let template;
    let exported;
    const templateName = 'template rules';
    const templateDescription = 'the rules of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            rules: [
                {
                    location: 'context.contextActivities.grouping[*].id',
                    presence: 'included',
                },
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export contains the rule', async () => {
        expect(exported.rules.length).toBe(1);
    });

    test('template exports rule location', async () => {
        expect(exported.rules[0].location).toBe('context.contextActivities.grouping[*].id');
    });

    test('template exports presence', async () => {
        expect(exported.rules[0].presence).toBe('included');
    });

    test('template rule empty any array not showing', async () => {
        expect(exported.rules[0].any).not.toBeDefined();
    });

    test('template rule empty all array not showing', async () => {
        expect(exported.rules[0].all).not.toBeDefined();
    });

    test('template rule empty none array not showing', async () => {
        expect(exported.rules[0].none).not.toBeDefined();
    });
});

describe('test rules selector of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let template;
    let exported;
    const templateName = 'template rules';
    const templateDescription = 'the rules of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            rules: [
                {
                    location: 'context.contextActivities.grouping',
                    selector: 'id',
                    presence: 'included',
                },
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export contains the rule', async () => {
        expect(exported.rules.length).toBe(1);
    });

    test('template exports rule location', async () => {
        expect(exported.rules[0].location).toBe('context.contextActivities.grouping');
    });

    test('template exports rule selector', async () => {
        expect(exported.rules[0].selector).toBe('id');
    });

    test('template exports presence', async () => {
        expect(exported.rules[0].presence).toBe('included');
    });
});

describe('test rules any of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let template;
    let exported;
    const templateName = 'template rules';
    const templateDescription = 'the rules of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            rules: [
                {
                    location: 'context.contextActivities.grouping[*].id',
                    presence: 'included',
                    any: ['https://w3id.org/xapi/scorm', 'https://w3id.org/xapi/video'],
                },
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export contains the rule', async () => {
        expect(exported.rules.length).toBe(1);
    });

    test('template exports rule location', async () => {
        expect(exported.rules[0].location).toBe('context.contextActivities.grouping[*].id');
    });

    test('template exports presence', async () => {
        expect(exported.rules[0].presence).toBe('included');
    });

    test('template has any rules', async () => {
        expect(exported.rules[0].any.length).toBe(2);
    });

    test('template export rules any contains correct values', async () => {
        expect(exported.rules[0].any).toStrictEqual(['https://w3id.org/xapi/scorm', 'https://w3id.org/xapi/video']);
    });
});

describe('test rules all of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let template;
    let exported;
    const templateName = 'template rules';
    const templateDescription = 'the rules of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            rules: [
                {
                    location: 'context.contextActivities.grouping[*].id',
                    all: ['https://w3id.org/xapi/scorm', 'https://w3id.org/xapi/video'],
                },
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export contains the rule', async () => {
        expect(exported.rules.length).toBe(1);
    });

    test('template exports rule location', async () => {
        expect(exported.rules[0].location).toBe('context.contextActivities.grouping[*].id');
    });

    test('template has all rules', async () => {
        expect(exported.rules[0].all.length).toBe(2);
    });

    test('template export rules all contains correct values', async () => {
        expect(exported.rules[0].all).toStrictEqual(['https://w3id.org/xapi/scorm', 'https://w3id.org/xapi/video']);
    });
});

describe('test rules none of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let template;
    let exported;
    const templateName = 'template rules';
    const templateDescription = 'the rules of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            rules: [
                {
                    location: 'context.contextActivities.grouping[*].id',
                    none: ['https://w3id.org/xapi/scorm', 'https://w3id.org/xapi/video'],
                },
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export contains the rule', async () => {
        expect(exported.rules.length).toBe(1);
    });

    test('template exports rule location', async () => {
        expect(exported.rules[0].location).toBe('context.contextActivities.grouping[*].id');
    });

    test('template has none rules', async () => {
        expect(exported.rules[0].none.length).toBe(2);
    });

    test('template export rules none contains correct values', async () => {
        expect(exported.rules[0].none).toStrictEqual(['https://w3id.org/xapi/scorm', 'https://w3id.org/xapi/video']);
    });
});

describe('test rules scopeNote of template export', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let template;
    let exported;
    const templateName = 'template rules';
    const templateDescription = 'the rules of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            rules: [
                {
                    location: 'context.contextActivities.grouping[*].id',
                    none: ['https://w3id.org/xapi/scorm', 'https://w3id.org/xapi/video'],
                    scopeNote: {
                        en: 'This is the test of the scopeNote',
                        fr: 'Ceci est le test de la scopeNote',
                    },
                },
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export contains the rule', async () => {
        expect(exported.rules.length).toBe(1);
    });

    test('template exports rule location', async () => {
        expect(exported.rules[0].location).toBe('context.contextActivities.grouping[*].id');
    });

    test('template export of rules scopeNote contains the correct values', async () => {
        expect(exported.rules[0].scopeNote).toStrictEqual({
            en: 'This is the test of the scopeNote',
            fr: 'Ceci est le test de la scopeNote',
        });
    });
});

describe('test rules of template export can handle more than one rule', () => {
    let org;
    let profile;
    let version;
    let verbconcept1;
    let template;
    let exported;
    const templateName = 'template rules';
    const templateDescription = 'the rules of the template';


    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        const data = await populateDb();
        org = data.org;
        profile = data.profile;
        version = data.version;
        verbconcept1 = data.verbconcept1;

        template = await createTemplate(version, {
            name: templateName,
            description: templateDescription,
            verb: verbconcept1._id,
            rules: [
                {
                    location: 'context.contextActivities.grouping[*].id',
                    none: ['https://w3id.org/xapi/scorm', 'https://w3id.org/xapi/video'],
                    scopeNote: {
                        en: 'This is the test of the scopeNote',
                        fr: 'Ceci est le test de la scopeNote',
                    },
                },
                {
                    location: 'object.definition',
                    selector: 'type',
                    any: ['http://adlnet.gov/expapi/activities/lesson', 'https://w3id.org/xapi/video/activity-type/video'],
                },
            ],
        });
        exported = await template.export(version.iri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('template export has iri', async () => {
        expect(exported.id).toBe(template.iri);
    });

    test('template export contains the rule', async () => {
        expect(exported.rules.length).toBe(2);
    });

    test('template exports rule location', async () => {
        expect(exported.rules[0].location).toBe('context.contextActivities.grouping[*].id');
    });

    test('template export rules none contains correct values', async () => {
        expect(exported.rules[0].none).toStrictEqual(['https://w3id.org/xapi/scorm', 'https://w3id.org/xapi/video']);
    });

    test('template export of rules scopeNote contains the correct values', async () => {
        expect(exported.rules[0].scopeNote).toStrictEqual({
            en: 'This is the test of the scopeNote',
            fr: 'Ceci est le test de la scopeNote',
        });
    });

    test('template exports second rule location', async () => {
        expect(exported.rules[1].location).toBe('object.definition');
    });

    test('template exports second rule selector', async () => {
        expect(exported.rules[1].selector).toBe('type');
    });

    test('template export rules any contains correct values', async () => {
        expect(exported.rules[1].any).toStrictEqual(['http://adlnet.gov/expapi/activities/lesson', 'https://w3id.org/xapi/video/activity-type/video']);
    });
});
