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
const url = require('url');

const createAPIURL = require('../../../../utils/createAPIURL');
const profileController = require('../../../../controllers/profiles');
const profileVersionsController = require('../../../../controllers/profileVersions');
const conceptController = require('../../../../controllers/concepts');
const models = require('../../../../ODM/models');
const { Decipher } = require('crypto');
const { POINT_CONVERSION_UNCOMPRESSED } = require('constants');

const TEST_PROF_1 = 'http://tom.com/test/profile2';
const TEST_PROF_2 = 'http://keith.com/test/profile1';
const TEST_PROF_3 = 'https://adlnet.gov/xapi/test/profiles/1';

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

describe('Get Profile', () => {
    const mongoServer = new MongoMemoryServer();
    jest.setTimeout(10000);

    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        // todo: need to create a working group and hold their uuid
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('get profile with a uuid returns the profile', async () => {
        const profiri = 'https://test.tom.com/test/testprofile1';
        const info = await makeAProfile(profiri);

        const res = await request(app)
            .get(`/api/profile/${info.vers[0].uuid}`);

        // console.log(res.body);
        expect(res.status).toEqual(200);
        expect(res.body.id).toBe(info.prof.iri);
        expect(res.body.versions[0].id).toBe(info.vers[0].iri);
        expect(Math.floor((new Date(res.get('Last-Modified'))).getTime() / 1000)).toBe(Math.floor(info.vers[0].updatedOn.getTime() / 1000));
    });

    test('get profile at URL returns the profile', async () => {
        const profiri = 'https://test.tom.com/test/testprofile/testurl';
        const info = await makeAProfile(profiri);

        const theurl = url.parse(info.vers[0].url);

        const res = await request(app)
            .get(theurl.pathname)
            .set('Content-Type', 'application/json')
            .send();

        // console.log(res.body);
        expect(res.status).toEqual(200);
        expect(res.body.id).toBe(info.prof.iri);
        expect(res.body.versions[0].id).toBe(info.vers[0].iri);
        expect(Math.floor((new Date(res.get('Last-Modified'))).getTime() / 1000)).toBe(Math.floor(info.vers[0].updatedOn.getTime() / 1000));
    });

    test('get parent profile with a uuid returns the profile with current published info', async () => {
        const profiri = 'https://test.tom.com/test/testprofile2';
        const info = await makeAProfile(profiri);

        const res = await request(app)
            .get(`/api/profile/${info.prof.uuid}`);

        // console.log(info.vers, res.status, res.body);
        // console.log(res.body);
        expect(res.status).toEqual(200);
        expect(res.body.id).toBe(info.prof.iri);
        expect(Math.floor((new Date(res.get('Last-Modified'))).getTime() / 1000)).toBe(Math.floor(info.vers[0].updatedOn.getTime() / 1000));
    });

    test('get profile with two versions', async () => {
        const profiri = 'https://test.tom.com/test/testprofile3';
        const info = await makeAProfile(profiri);

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);
        newVersion.publish();
        info.vers.push(newVersion);

        const res = await request(app)
            .get(`/api/profile/${info.prof.uuid}`);

        // console.log(info.vers, res.status, res.body);
        // console.log(res.body);
        expect(res.status).toEqual(200);
        expect(res.body.id).toBe(info.prof.iri);
        expect(res.body.versions.length).toBe(2);
    });

    test('get profile does not return draft versons', async () => {
        const profiri = 'https://test.tom.com/test/testprofile4';
        const info = await makeAProfile(profiri);

        let mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);
        newVersion.publish();
        info.vers.push(newVersion);

        mods = info.vers[1].toJSON();
        delete mods.iri;
        mods.name = 'test profile v3';
        const newDraftVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);
        info.draft = [newDraftVersion];
        const res = await request(app)
            .get(`/api/profile/${info.prof.uuid}`);

        // console.log(info.vers, res.status, res.body);
        // console.log(res.body);
        expect(res.status).toEqual(200);
        expect(res.body.id).toBe(info.prof.iri);
        expect(res.body.versions.length).toBe(2);
    });

    test('get profile does return draft versions when a key from the profile wg is used', async () => {
        const profiri = 'https://test.tom.com/test/testprofile6';
        const info = await makeAProfile(profiri);
        const maker = new models.user({ uuid: require('uuid').v4(), email: 'test@test.com' });
        await maker.save();
        const key = new models.apiKey({ scope: 'organization', scopeObject: info.org, createdBy: maker, updatedBy: maker });
        await key.save();

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;
        const res = await request(app)
            .get(`/api/profile/${info.draft.uuid}`)
            .set('x-api-key', key.uuid).send();

        expect(res.status).toEqual(200);
        expect(res.body.id).toBe(info.prof.iri);
        expect(res.body.prefLabel.en).toBe(mods.name);
        expect(res.body.versions.length).toBe(2);
        expect(Math.floor((new Date(res.get('Last-Modified'))).getTime() / 1000)).toBe(Math.floor(info.draft.updatedOn.getTime() / 1000));
    });

    test('get profile does not return draft versions when a key from the profile wg is not used', async () => {
        const profiri = 'https://test.tom.com/test/testprofile7';
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
            .get(`/api/profile/${info.draft.uuid}`)
            .set('x-api-key', otherkey.uuid).send();

        expect(res.status).toEqual(404);
        expect(res.body.success).toBe(false);
    });

    test('returned profile should be valid (through the validator)', async () => {
        const wg = new models.organization({ name: 'wg_name' });
        await wg.save();
        const maker = new models.user({ uuid: require('uuid').v4(), email: 'test1@test.com' });
        await maker.save();
        const key = new models.apiKey({ scope: 'organization', scopeObject: wg, createdBy: maker, updatedBy: maker });
        await key.save();

        const scormprofile = JSON.parse(fs.readFileSync('server/test/routes/publicAPI/profile/test_resources/scorm.jsonld'));
        const res = await request(app)
            .post('/api/profile')
            .set('Content-Type', 'application/json')
            .set('x-api-key', key.uuid)
            .send({
                status: {
                    published: true,
                },
                profile: scormprofile,
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.metadata.profile_id).toBe(scormprofile.id);

        const uuid = path.basename(res.body.metadata.profile_url);
        const exported = await request(app)
            .get(`/api/profile/${uuid}`);

        expect(exported.status).toBe(200);
        expect(exported.body.id).toBe(scormprofile.id);

        const validationres = await request(app)
            .post('/api/validate')
            .set('Content-Type', 'application/json')
            .send(exported.body);

        expect(validationres.status).toBe(200);
        expect(validationres.body.success).toBe(true);
    });
});

describe('Get Profiles', () => {
    const mongoServer = new MongoMemoryServer();
    jest.setTimeout(10000);
    let info;

    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        // todo: need to create a working group and hold their uuid
        info = await makeAProfile('https://tom.com/test/getprofiles/profile1');
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('test basic get of all public profiles', async () => {
        const res = await request(app)
            .get('/api/profile');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.metadata.length).toBe(1);
    });

    test('test profiles response of basic get of all public profiles', async () => {
        const res = await request(app)
            .get('/api/profile');

        expect(res.status).toBe(200);
        const profmeta = res.body.metadata[0];
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
        expect(profmeta.status).not.toHaveProperty('verificationRequested');
        expect(profmeta.working_group.name).toBe(info.org.name);
        expect(profmeta.working_group.url).toBe(info.org.collaborationLink);
    });

    describe('with query params', () => {
        let prof2;
        let prof3;
        let prof4;
        beforeEach(async () => {
            prof2 = await makeAProfile(TEST_PROF_1);
            prof3 = await makeAProfile(TEST_PROF_2);
            prof4 = await makeAProfile(TEST_PROF_3);
        });

        afterEach(async () => {
            if (prof2) await prof2.cleanUp();
            if (prof2) await prof3.cleanUp();
            if (prof2) await prof4.cleanUp();
        });

        test('test limit param on get profiles', async () => {
            const res = await request(app).get('/api/profile').query({ limit: 1 });
            expect(res.status).toBe(200);
            expect(res.body.metadata.length).toBe(1);
        });

        test('test both page and limit on get profiles', async () => {
            const res = await request(app).get('/api/profile').query({ limit: 1, page: 2 });
            expect(res.status).toBe(200);
            expect(res.body.metadata.length).toBe(1);
            expect(res.body.metadata[0].profile_id).toBe(prof2.prof.iri);
        });

        test('test get working group profiles', async () => {
            const res = await request(app).get('/api/profile').query({ workinggroup: prof3.org.uuid });
            expect(res.status).toBe(200);
            expect(res.body.metadata.length).toBe(1);
            expect(res.body.metadata[0].profile_id).toBe(prof3.prof.iri);
        });
    });
});

describe('Get Profile by IRI', () => {
    const mongoServer = new MongoMemoryServer();
    jest.setTimeout(10000);
    let info;

    beforeAll(async () => {
        const dburi = await mongoServer.getUri();
        await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
        // todo: need to create a working group and hold their uuid
        info = await makeAProfile('https://tom.com/test/getprofiles/profile1');
    });

    afterAll(async () => {
        await mongoServer.stop();
    });
    // info prof.. mommy
    // info.vers[0] published

    test('can get a profile by iri', async () => {
        const res = await request(app)
            .get('/api/profile').query({ iri: info.prof.iri });

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(info.prof.iri);
    });

    test('can get a profile by version iri', async () => {
        const res = await request(app)
            .get('/api/profile').query({ iri: info.vers[0].iri });

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(info.prof.iri);
        expect(res.body.versions[0].id).toBe(info.vers[0].iri);
        expect(res.body.prefLabel.en).toBe(info.vers[0].name);
    });

    test('cannot get a profile by unknown iri', async () => {
        const res = await request(app)
            .get('/api/profile').query({ iri: 'http://tom.com/fake/iri' });

        expect(res.status).toBe(404);
    });

    test('can not get a profile by draft iri', async () => {
        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org.uuid, info.prof.uuid, mods);

        info.draft = newVersion;
        const res = await request(app)
            .get('/api/profile').query({ iri: info.draft.iri });

        expect(res.status).toBe(404);
    });
});
