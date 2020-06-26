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
const createIRI = require('../../../../utils/createIRI');
const profileController = require('../../../../controllers/profiles');
const profileVersionsController = require('../../../../controllers/profileVersions');
const conceptController = require('../../../../controllers/concepts');

async function makeAProfile(profiri) {
    const models = require('../../../../ODM/models');
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
        org: org.uuid,
        prof: p_profile,
        vers: [p_version],
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
    });

    test('get profile with two versions', async () => {
        const profiri = 'https://test.tom.com/test/testprofile3';
        const info = await makeAProfile(profiri);

        const mods = info.vers[0].toJSON();
        delete mods.iri;
        mods.name = 'test profile v2';
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org, info.prof.uuid, mods);
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
        const newVersion = await profileVersionsController.addNewProfileVersion(info.org, info.prof.uuid, mods);
        newVersion.publish();
        info.vers.push(newVersion);

        mods = info.vers[1].toJSON();
        delete mods.iri;
        mods.name = 'test profile v3';
        const newDraftVersion = await profileVersionsController.addNewProfileVersion(info.org, info.prof.uuid, mods);
        info.draft = [newDraftVersion];
        const res = await request(app)
            .get(`/api/profile/${info.prof.uuid}`);

        // console.log(info.vers, res.status, res.body);
        // console.log(res.body);
        expect(res.status).toEqual(200);
        expect(res.body.id).toBe(info.prof.iri);
        expect(res.body.versions.length).toBe(2);
    });

    test.todo('returned profile should be valid (through the validator)');
    // test('should get a response', async () => {
    //     const res = await request(app)
    //         .get('/api')
    //         .query({ orgname: 'hello', profname: 'prof' });
    //     // .expect(200);
    //     expect(res.status).toEqual(200);
    //     expect(res.body.concept.iri).toBe(createIRI('hello', 'prof'));
    // });
});

describe('Get Profiles', () => {
    // const mongoServer = new MongoMemoryServer();

    // beforeAll(async () => {
    //     const dburi = await mongoServer.getUri();
    //     await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
    // });


});

describe('Get Group Profiles', () => {
    // const mongoServer = new MongoMemoryServer();

    // beforeAll(async () => {
    //     const dburi = await mongoServer.getUri();
    //     await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
    // });

    it.todo('test get group profiles');
});


