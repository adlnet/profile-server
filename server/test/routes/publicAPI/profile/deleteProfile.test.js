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
const request = require('supertest');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const uuid = require('uuid').v4;
const app = require('../../../../../app');

const fs = require('fs');
const path = require('path');

const createIRI = require('../../../../utils/createIRI');
const profileController = require('../../../../controllers/profiles');
const profileVersionsController = require('../../../../controllers/profileVersions');
const conceptController = require('../../../../controllers/concepts');
const models = require('../../../../ODM/models');

async function createDraft(org, profile, draftInfo) {
    return profileVersionsController.addNewProfileVersion(
        org.uuid,
        profile.uuid,
        draftInfo,
    );
}

async function makeAProfile(profiri) {
    const org = await new models.organization({ name: 'test org' + uuid() });
    await org.save();

    const p_profile = await profileController.addNewProfile(
        org.uuid,
        {
            iri: profiri,
            name: 'test profile',
            description: 'it is the test version',
        },
    );

    await p_profile.populate('currentDraftVersion').execPopulate();
    const p_version = p_profile.currentDraftVersion;
    await p_version.publish();

    return {
        org: org,
        prof: p_profile,
        vers: [p_version],
    };
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

describe('Delete Profile', () => {
    const mongoServer = new MongoMemoryServer();
    jest.setTimeout(10000);

    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoServer.stop();
    });

    test('test delete profile endpoint', async () => {
        const profiri = 'https://test.tom.com/test/testprofile1';
        const info = await makeAProfile(profiri);
        const maker = new models.user({ uuid: require('uuid').v4(), email: 'basic@test.com' });
        await maker.save();
        const key = new models.apiKey({ scope: 'organization', scopeObject: info.org, createdBy: maker, updatedBy: maker });
        await key.save();

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;

        const res = await request(app)
            .delete(`/api/profile/${info.draft.uuid}`)
            .set('x-api-key', key.uuid).send();

        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.metadata.version_id).toBe(info.draft.iri);
        expect(res.body.metadata.status.published).toBe(false);

        const dbDraft = await models.profileVersion.findOne({ iri: info.draft.iri });
        expect(dbDraft).toBeNull();

        const dbParent = await models.profile.findOne({ iri: info.prof.iri });
        expect(dbParent.currentDraftVersion).toBeNull();
    });

    test('test delete fail when profile published', async () => {
        const profiri = 'https://test.tom.com/test/testprofile2';
        const info = await makeAProfile(profiri);
        const maker = new models.user({ uuid: require('uuid').v4(), email: 'published@test.com' });
        await maker.save();
        const key = new models.apiKey({ scope: 'organization', scopeObject: info.org, createdBy: maker, updatedBy: maker });
        await key.save();

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;

        const res = await request(app)
            .delete(`/api/profile/${info.vers[0].uuid}`)
            .set('x-api-key', key.uuid).send();

        expect(res.status).toEqual(405);
        expect(res.body.success).toBe(false);
    });

    test('test delete fail with wrong key', async () => {
        const profiri = 'https://test.tom.com/test/testprofile3';
        const info = await makeAProfile(profiri);

        const otherorg = await new models.organization({ name: 'test org' + uuid() });
        await otherorg.save();
        const other = new models.user({ uuid: require('uuid').v4(), email: 'wrongkey@test.com' });
        await other.save();
        const otherkey = new models.apiKey({ scope: 'organization', scopeObject: otherorg, createdBy: other, updatedBy: other });
        await otherkey.save();

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;

        const res = await request(app)
            .delete(`/api/profile/${info.draft.uuid}`)
            .set('x-api-key', otherkey.uuid).send();

        expect(res.status).toEqual(401);
        expect(res.body.success).toBe(false);
    });

    test('test delete fail with no key', async () => {
        const profiri = 'https://test.tom.com/test/testprofile4';
        const info = await makeAProfile(profiri);

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;

        const res = await request(app)
            .delete(`/api/profile/${info.draft.uuid}`)
            .send();

        expect(res.status).toEqual(401);
        expect(res.body.success).toBe(false);
    });

    test('all components created during this draft are deleted', async () => {
        const profiri = 'https://test.tom.com/test/testprofile5';
        const info = await makeAProfile(profiri);
        const maker = new models.user({ uuid: require('uuid').v4(), email: 'delcomps@test.com' });
        await maker.save();
        const key = new models.apiKey({ scope: 'organization', scopeObject: info.org, createdBy: maker, updatedBy: maker });
        await key.save();

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';

        const draft = await createDraft(
            info.org,
            info.prof,
            mods,
        );

        const draftconcept = await addConcept(
            draft,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing delete',
                type: 'Verb',
                conceptType: 'Verb',
            },
        );

        const template = await createTemplate(draft, {
            name: 'template ' + uuid(),
            description: 'template description for testing pattern draft',
            verb: draftconcept._id,
        });

        const pattern = await createPattern(draft, {
            name: 'pattern ' + uuid(),
            description: 'pattern testing delete',
            oneOrMore:
                new models.patternComponent({
                    component: template,
                    componentType: 'template',
                }),
        });

        const beforedraft = await models.profileVersion.findOne({ iri: draft.iri });
        expect(beforedraft).not.toBeNull();
        const beforeprof = await models.profile.findOne({ iri: info.prof.iri });
        expect(beforeprof.currentDraftVersion.toJSON()).toEqual(draft.id);

        // check db for components
        const beforeconcept = await models.concept.findOne({ iri: draftconcept.iri });
        const beforetemplate = await models.template.findOne({ iri: template.iri });
        const beforepattern = await models.pattern.findOne({ iri: pattern.iri });
        expect(beforeconcept).not.toBeNull();
        expect(beforeconcept.parentProfile.toJSON()).toEqual(draft.id);
        expect(beforetemplate).not.toBeNull();
        expect(beforetemplate.parentProfile.toJSON()).toEqual(draft.id);
        expect(beforepattern).not.toBeNull();
        expect(beforepattern.parentProfile.toJSON()).toEqual(draft.id);

        const res = await request(app)
            .delete(`/api/profile/${draft.uuid}`)
            .set('x-api-key', key.uuid).send();

        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
        // check db for draft
        const afterdraft = await models.profileVersion.findOne({ iri: draft.iri });
        expect(afterdraft).toBeNull();
        const afterprof = await models.profile.findOne({ iri: info.prof.iri });
        expect(afterprof.currentDraftVersion).toBeNull();
        // check db for components
        const afterconcept = await models.concept.findOne({ iri: draftconcept.iri });
        const aftertemplate = await models.template.findOne({ iri: template.iri });
        const afterpattern = await models.pattern.findOne({ iri: pattern.iri });
        expect(afterconcept).toBeNull();
        expect(aftertemplate).toBeNull();
        expect(afterpattern).toBeNull();
    });

    test('all components created during previous versions are not deleted', async () => {
        const profiri = 'https://test.tom.com/test/testprofile6';
        const info = await makeAProfile(profiri);
        const maker = new models.user({ uuid: require('uuid').v4(), email: 'delsomecomps@test.com' });
        await maker.save();
        const key = new models.apiKey({ scope: 'organization', scopeObject: info.org, createdBy: maker, updatedBy: maker });
        await key.save();

        const publishedversion = info.vers[0];
        const draftpublishedconcept = await addConcept(
            publishedversion,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing delete',
                type: 'Verb',
                conceptType: 'Verb',
            },
        );

        const publishedtemplate = await createTemplate(publishedversion, {
            name: 'template ' + uuid(),
            description: 'template description for testing pattern draft',
            verb: draftpublishedconcept._id,
        });

        const publishedpattern = await createPattern(publishedversion, {
            name: 'pattern ' + uuid(),
            description: 'pattern testing delete',
            oneOrMore:
                new models.patternComponent({
                    component: publishedtemplate,
                    componentType: 'template',
                }),
        });


        const beforepublishedconcept = await models.concept.findOne({ iri: draftpublishedconcept.iri });
        const beforepublishedtemplate = await models.template.findOne({ iri: publishedtemplate.iri });
        const beforepublishedpattern = await models.pattern.findOne({ iri: publishedpattern.iri });
        expect(beforepublishedconcept).not.toBeNull();
        expect(beforepublishedconcept.parentProfile.toJSON()).toEqual(publishedversion.id);
        expect(beforepublishedtemplate).not.toBeNull();
        expect(beforepublishedtemplate.parentProfile.toJSON()).toEqual(publishedversion.id);
        expect(beforepublishedpattern).not.toBeNull();
        expect(beforepublishedpattern.parentProfile.toJSON()).toEqual(publishedversion.id);



        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';

        const draft = await createDraft(
            info.org,
            info.prof,
            mods,
        );

        const draftconcept = await addConcept(
            draft,
            {
                name: 'concept ' + uuid(),
                description: 'concept for testing delete',
                type: 'Verb',
                conceptType: 'Verb',
            },
        );

        const template = await createTemplate(draft, {
            name: 'template ' + uuid(),
            description: 'template description for testing pattern draft',
            verb: draftconcept._id,
        });

        const pattern = await createPattern(draft, {
            name: 'pattern ' + uuid(),
            description: 'pattern testing delete',
            oneOrMore:
                new models.patternComponent({
                    component: template,
                    componentType: 'template',
                }),
        });

        const beforedraft = await models.profileVersion.findOne({ iri: draft.iri });
        expect(beforedraft).not.toBeNull();
        const beforeprof = await models.profile.findOne({ iri: info.prof.iri });
        expect(beforeprof.currentDraftVersion.toJSON()).toEqual(draft.id);

        // check db for components
        const beforeconcept = await models.concept.findOne({ iri: draftconcept.iri });
        const beforetemplate = await models.template.findOne({ iri: template.iri });
        const beforepattern = await models.pattern.findOne({ iri: pattern.iri });
        expect(beforeconcept).not.toBeNull();
        expect(beforeconcept.parentProfile.toJSON()).toEqual(draft.id);
        expect(beforetemplate).not.toBeNull();
        expect(beforetemplate.parentProfile.toJSON()).toEqual(draft.id);
        expect(beforepattern).not.toBeNull();
        expect(beforepattern.parentProfile.toJSON()).toEqual(draft.id);

        const res = await request(app)
            .delete(`/api/profile/${draft.uuid}`)
            .set('x-api-key', key.uuid).send();

        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
        // check db for draft
        const afterdraft = await models.profileVersion.findOne({ iri: draft.iri });
        expect(afterdraft).toBeNull();
        const afterprof = await models.profile.findOne({ iri: info.prof.iri });
        expect(afterprof.currentDraftVersion).toBeNull();
        // check db for components, ones created in draft should be gone
        const afterconcept = await models.concept.findOne({ iri: draftconcept.iri });
        const aftertemplate = await models.template.findOne({ iri: template.iri });
        const afterpattern = await models.pattern.findOne({ iri: pattern.iri });
        expect(afterconcept).toBeNull();
        expect(aftertemplate).toBeNull();
        expect(afterpattern).toBeNull();

        // make sure db still has the components created in the published version
        const afterpublishedconcept = await models.concept.findOne({ iri: draftpublishedconcept.iri });
        const afterpublishedtemplate = await models.template.findOne({ iri: publishedtemplate.iri });
        const afterpublishedpattern = await models.pattern.findOne({ iri: publishedpattern.iri });
        expect(afterpublishedconcept).not.toBeNull();
        expect(afterpublishedconcept.parentProfile.toJSON()).toEqual(publishedversion.id);
        expect(afterpublishedtemplate).not.toBeNull();
        expect(afterpublishedtemplate.parentProfile.toJSON()).toEqual(publishedversion.id);
        expect(afterpublishedpattern).not.toBeNull();
        expect(afterpublishedpattern.parentProfile.toJSON()).toEqual(publishedversion.id);
    });
});
