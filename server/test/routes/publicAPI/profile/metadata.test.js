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

const createAPIURL = require('../../../../utils/createAPIURL');
const profileController = require('../../../../controllers/profiles');
const profileVersionsController = require('../../../../controllers/profileVersions');
const conceptController = require('../../../../controllers/concepts');
const models = require('../../../../ODM/models');

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
        cleanUp: async function () {
            if (org) await org.remove();
            if (p_profile) await p_profile.remove();
            if (p_version) await p_version.remove();
        },
    };
}


describe('Profile Metadata Get', () => {
    const mongoServer = new MongoMemoryServer();
    jest.setTimeout(10000);

    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('test get profile metadata endpoint', async () => {
        const profiri = 'https://test.tom.com/test/testprofile1';
        const info = await makeAProfile(profiri);

        const maker = new models.user({ uuid: require('uuid').v4(), email: 'test@test.com' });
        await maker.save();
        const key = new models.apiKey({ scope: 'organization', scopeObject: info.org, createdBy: maker, updatedBy: maker });
        await key.save();

        const res = await request(app)
            .get(`/api/profile/${info.vers[0].uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(res.status).toBe(200);
        const profmeta = res.body.metadata;
        expect(Math.floor((new Date(res.get('Last-Modified'))).getTime() / 1000)).toBe(Math.floor(info.vers[0].updatedOn.getTime() / 1000));
        expect(profmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(profmeta.profile_id).toBe(info.prof.iri);
        expect(profmeta.version_url).toBe(createAPIURL.profile(info.vers[0].uuid));
        expect(profmeta.version_id).toBe(info.vers[0].iri);
        expect(profmeta.name).toBe(info.vers[0].name);
        expect(profmeta.version).toBe(info.vers[0].version);
        expect(profmeta.template_count).toBe(info.vers[0].templates.length);
        expect(profmeta.concept_count).toBe(info.vers[0].concepts.length);
        expect(profmeta.pattern_count).toBe(info.vers[0].patterns.length);
        expect(profmeta.updated).toEqual(info.vers[0].updatedOn.toISOString());
        expect(profmeta.status.verified).toBe(info.vers[0].isVerified);
        expect(profmeta.status.published).toBe(true);
        expect(profmeta.status).not.toHaveProperty('verificationRequest');
        expect(profmeta.working_group.name).toBe(info.org.name);
        expect(profmeta.working_group.url).toBe(info.org.collaborationLink);
    });

    test('draft profile can be retrieved with right key', async () => {
        const profiri = 'https://test.tom.com/test/testprofile2';
        const info = await makeAProfile(profiri);

        const maker = new models.user({ uuid: require('uuid').v4(), email: 'draftman@test.com' });
        await maker.save();
        const key = new models.apiKey({ scope: 'organization', scopeObject: info.org, createdBy: maker, updatedBy: maker });
        await key.save();

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;

        const res = await request(app)
            .get(`/api/profile/${info.draft.uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(res.status).toBe(200);
        const profmeta = res.body.metadata;
        expect(profmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(profmeta.profile_id).toBe(info.prof.iri);
        expect(profmeta.version_url).toBe(createAPIURL.profile(info.draft.uuid));
        expect(profmeta.version_id).toBe(info.draft.iri);
        expect(profmeta.name).toBe(info.draft.name);
        expect(profmeta.version).toBe(info.draft.version);
        expect(profmeta.template_count).toBe(info.draft.templates.length);
        expect(profmeta.concept_count).toBe(info.draft.concepts.length);
        expect(profmeta.pattern_count).toBe(info.draft.patterns.length);
        expect(profmeta.updated).toEqual(info.draft.updatedOn.toISOString());
        expect(profmeta.status.verified).toBe(info.draft.isVerified);
        expect(profmeta.status.published).toBe(false);
        expect(profmeta.status).not.toHaveProperty('verificationRequest');
        expect(profmeta.working_group.name).toBe(info.org.name);
        expect(profmeta.working_group.url).toBe(info.org.collaborationLink);
    });

    test('draft profile cannot be retrieved with wrong key', async () => {
        const profiri = 'https://test.tom.com/test/testprofile3';
        const info = await makeAProfile(profiri);

        const otherorg = await new models.organization({ name: 'test org' + uuid() });
        await otherorg.save();
        const other = new models.user({ uuid: require('uuid').v4(), email: 'publicdude@test.com' });
        await other.save();
        const otherkey = new models.apiKey({ scope: 'organization', scopeObject: otherorg, createdBy: other, updatedBy: other });
        await otherkey.save();

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;
        const res = await request(app)
            .get(`/api/profile/${info.draft.uuid}/meta`)
            .set('x-api-key', otherkey.uuid)
            .send();

        expect(res.status).toEqual(401);
        expect(res.body.success).toBe(false);
    });
});


describe('Profile Status Update', () => {
    const mongoServer = new MongoMemoryServer();
    jest.setTimeout(10000);

    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    let maker;
    let key;
    let newVersion;
    let info;
    let otherorg;
    let otherkey;
    let other;
    beforeEach(async () => {
        info = await makeAProfile('https://test.tom.com/test/testprofile1');
        maker = new models.user({ email: 'draftman@test.com' });
        await maker.save();
        key = new models.apiKey({ scope: 'organization', scopeObject: info.org, createdBy: maker, updatedBy: maker });
        await key.save();

        otherorg = await new models.organization({ name: 'test org' + uuid() });
        await otherorg.save();
        other = new models.user({ email: 'wrongkey@test.com' });
        await other.save();
        otherkey = new models.apiKey({ scope: 'organization', scopeObject: otherorg, createdBy: other, updatedBy: other });
        await otherkey.save();
    });

    afterEach(async () => {
        await info.cleanUp();
        await maker.remove();
        await key.remove();
        if (newVersion) newVersion.remove();
        await otherorg.remopve;
        await other.remove();
        await otherkey.remove();
    });

    test('update published via status endpoint', async () => {
        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;

        const res = await request(app)
            .get(`/api/profile/${info.draft.uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(res.status).toBe(200);
        const profmeta = res.body.metadata;
        expect(profmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(profmeta.profile_id).toBe(info.prof.iri);
        expect(profmeta.version_url).toBe(createAPIURL.profile(info.draft.uuid));
        expect(profmeta.version_id).toBe(info.draft.iri);
        expect(profmeta.name).toBe(info.draft.name);
        expect(profmeta.version).toBe(info.draft.version);
        expect(profmeta.status.verified).toBe(info.draft.isVerified);
        expect(profmeta.status.published).toBe(false);
        expect(profmeta.status).not.toHaveProperty('verificationRequest');

        const newstatus = JSON.parse(JSON.stringify(profmeta.status));
        newstatus.published = true;

        const updateRes = await request(app)
            .post(`/api/profile/${info.draft.uuid}/status`)
            .set('Content-Type', 'application/json')
            .set('x-api-key', key.uuid)
            .send(newstatus);

        expect(updateRes.status).toBe(200);
        const updatedstatus = updateRes.body.status;
        expect(updatedstatus.verified).toBe(false);
        expect(updatedstatus.published).toBe(true);
        expect(updatedstatus).not.toHaveProperty('verificationRequest');

        const newres = await request(app)
            .get(`/api/profile/${info.draft.uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(newres.status).toBe(200);
        const newmeta = newres.body.metadata;
        expect(newmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(newmeta.profile_id).toBe(info.prof.iri);
        expect(newmeta.version_url).toBe(createAPIURL.profile(info.draft.uuid));
        expect(newmeta.version_id).toBe(info.draft.iri);
        expect(newmeta.name).toBe(info.draft.name);
        expect(newmeta.version).toBe(info.draft.version);
        expect(newmeta.status.verified).toBe(false);
        expect(newmeta.status.published).toBe(true);
        expect(newmeta.status).not.toHaveProperty('verificationRequest');

        const parent_profile = await models.profile.findOne({ uuid: info.prof.uuid });
        expect(parent_profile.currentPublishedVersion._id.toString()).toBe(info.draft._id.toString());

        info.vers.push(info.draft);
    });

    test('update verification request via status endpoint', async () => {
        const res = await request(app)
            .get(`/api/profile/${info.vers[0].uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(res.status).toBe(200);
        const profmeta = res.body.metadata;
        expect(profmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(profmeta.profile_id).toBe(info.prof.iri);
        expect(profmeta.version_url).toBe(createAPIURL.profile(info.vers[0].uuid));
        expect(profmeta.version_id).toBe(info.vers[0].iri);
        expect(profmeta.name).toBe(info.vers[0].name);
        expect(profmeta.version).toBe(info.vers[0].version);
        expect(profmeta.status.verified).toBe(info.vers[0].isVerified);
        expect(profmeta.status.published).toBe(true);
        expect(profmeta.status).not.toHaveProperty('verificationRequest');

        const newstatus = JSON.parse(JSON.stringify(profmeta.status));
        newstatus.verificationRequest = (new Date()).toISOString();

        const updateRes = await request(app)
            .post(`/api/profile/${info.vers[0].uuid}/status`)
            .set('Content-Type', 'application/json')
            .set('x-api-key', key.uuid)
            .send(newstatus);

        expect(updateRes.status).toBe(200);
        const updatedstatus = updateRes.body.status;
        expect(updatedstatus.verified).toBe(false);
        expect(updatedstatus.published).toBe(true);
        expect(updatedstatus).toHaveProperty('verificationRequest');
        expect(updatedstatus.verificationRequest).toBe(newstatus.verificationRequest);

        const newres = await request(app)
            .get(`/api/profile/${info.vers[0].uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(newres.status).toBe(200);
        const newmeta = newres.body.metadata;
        expect(newmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(newmeta.profile_id).toBe(info.prof.iri);
        expect(newmeta.version_url).toBe(createAPIURL.profile(info.vers[0].uuid));
        expect(newmeta.version_id).toBe(info.vers[0].iri);
        expect(newmeta.name).toBe(info.vers[0].name);
        expect(newmeta.version).toBe(info.vers[0].version);
        expect(newmeta.status.verified).toBe(false);
        expect(newmeta.status.published).toBe(true);
        expect(updatedstatus).toHaveProperty('verificationRequest');
        expect(updatedstatus.verificationRequest).toBe(newstatus.verificationRequest);
    });

    test('fail update published via status endpoint with wrong key', async () => {
        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;

        const res = await request(app)
            .get(`/api/profile/${info.draft.uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(res.status).toBe(200);
        const profmeta = res.body.metadata;
        expect(profmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(profmeta.profile_id).toBe(info.prof.iri);
        expect(profmeta.version_url).toBe(createAPIURL.profile(info.draft.uuid));
        expect(profmeta.version_id).toBe(info.draft.iri);
        expect(profmeta.name).toBe(info.draft.name);
        expect(profmeta.version).toBe(info.draft.version);
        expect(profmeta.status.verified).toBe(info.draft.isVerified);
        expect(profmeta.status.published).toBe(false);
        expect(profmeta.status).not.toHaveProperty('verificationRequest');

        const newstatus = {
            published: true,
        };

        const updateRes = await request(app)
            .post(`/api/profile/${info.draft.uuid}/status`)
            .set('Content-Type', 'application/json')
            .set('x-api-key', other.uuid)
            .send(newstatus);

        expect(updateRes.status).toBe(401);

        const newres = await request(app)
            .get(`/api/profile/${info.draft.uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(newres.status).toBe(200);
        const newmeta = newres.body.metadata;
        expect(newmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(newmeta.profile_id).toBe(info.prof.iri);
        expect(newmeta.version_url).toBe(createAPIURL.profile(info.draft.uuid));
        expect(newmeta.version_id).toBe(info.draft.iri);
        expect(newmeta.name).toBe(info.draft.name);
        expect(newmeta.version).toBe(info.draft.version);
        expect(newmeta.status.verified).toBe(info.draft.isVerified);
        expect(newmeta.status.published).toBe(false);
        expect(newmeta.status).not.toHaveProperty('verificationRequest');
    });

    test('fail update published via status endpoint with no key', async () => {
        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;

        const res = await request(app)
            .get(`/api/profile/${info.draft.uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(res.status).toBe(200);
        const profmeta = res.body.metadata;
        expect(profmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(profmeta.profile_id).toBe(info.prof.iri);
        expect(profmeta.version_url).toBe(createAPIURL.profile(info.draft.uuid));
        expect(profmeta.version_id).toBe(info.draft.iri);
        expect(profmeta.name).toBe(info.draft.name);
        expect(profmeta.version).toBe(info.draft.version);
        expect(profmeta.status.verified).toBe(info.draft.isVerified);
        expect(profmeta.status.published).toBe(false);
        expect(profmeta.status).not.toHaveProperty('verificationRequest');

        const newstatus = {
            published: true,
        };

        const updateRes = await request(app)
            .post(`/api/profile/${info.draft.uuid}/status`)
            .set('Content-Type', 'application/json')
            .send(newstatus);

        expect(updateRes.status).toBe(401);

        const newres = await request(app)
            .get(`/api/profile/${info.draft.uuid}/meta`)
            .set('x-api-key', key.uuid)
            .send();

        expect(newres.status).toBe(200);
        const newmeta = newres.body.metadata;
        expect(newmeta.profile_url).toBe(createAPIURL.profile(info.prof.uuid));
        expect(newmeta.profile_id).toBe(info.prof.iri);
        expect(newmeta.version_url).toBe(createAPIURL.profile(info.draft.uuid));
        expect(newmeta.version_id).toBe(info.draft.iri);
        expect(newmeta.name).toBe(info.draft.name);
        expect(newmeta.version).toBe(info.draft.version);
        expect(newmeta.status.verified).toBe(info.draft.isVerified);
        expect(newmeta.status.published).toBe(false);
        expect(newmeta.status).not.toHaveProperty('verificationRequest');
    });
});


