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
const request = require('supertest');
const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

const organizationModel = require('../../../../../ODM/models').organization;
const userModel = require('../../../../../ODM/models').user;
const apiKeyModel = require('../../../../../ODM/models').apiKey;
const profileController = require('../../../../../controllers/profiles');
const app = require('../../../../../../app');

// const mongoServer = new MongoMemoryServer();
// jest.setTimeout(10000);

// beforeEach(async () => {
//     const cnnStr = await mongoServer.getUri();
//     await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });
// });

// afterEach(async () => {
//     await mongoose.disconnect();
//     await mongoServer.stop();
// });

describe('Using an api key to get a profile', () => {
    let org;
    let p_profile;
    let p_version;
    let apiKey;

    beforeEach(async () => {
        org = new organizationModel({
            name: 'test',
        });
        await org.save();

        const user = new userModel({ name: 'test_name', uuid: require('uuid').v4() });
        await user.save();

        apiKey = await apiKeyModel.createNew('organization', org);

        p_profile = await profileController.addNewProfile(
            org.uuid,
            {
                iri: 'https://test.tom.com/test/testprofile',
                name: 'test profile',
                description: 'it is the test version',
            },
        );
        await p_profile.populate('currentDraftVersion').execPopulate();

        p_version = p_profile.currentDraftVersion;
        await p_version.publish();
    });

    describe('if the api key is valid', () => {
        describe('and the work group id is valid', () => {
            // let res;

            beforeEach(async () => {
                res = await request(app)
                    .get(`/api/workinggroup/${org.uuid}/profile/${p_version.uuid}`)
                    .set('api-key', apiKey.uuid);
            });
            test.todo('work');

            // test('should return a 200 status.', () => {
            //     expect(res.status).toEqual(200);
            // });

            // test('should return the profile.', () => {
            //     expect(res.body.id).toBe(p_profile.iri);
            //     expect(res.body.versions[0].id).toBe(p_version.iri);
            // });
        });

        // describe('but the work group id is invalid', () => {
        //     let res;

        //     beforeEach(async () => {
        //         res = await request(app)
        //             .get(`/api/workinggroup/bleep-bloop/profile/${p_version.uuid}`)
        //             .set('api-key', apiKey.uuid);
        //     });

        //     test('should return a 401 status', () => {
        //         expect(res.status).toEqual(401);
        //     });

        //     test('should return a message saying that the work group id is invalid.', () => {
        //         expect(res.body.message).toBe('Work group id bleep-bloop is invalid.');
        //     });
        // });
    });

    // describe('if the api key is invalid', () => {
    //     let res;
    //     beforeEach(async () => {
    //         res = await request(app)
    //             .get(`/api/workinggroup/${org.uuid}/profile/${p_version.uuid}`)
    //             .set('api-key', 'bleep-bloop');
    //     });

    //     test('should return a 401 status', () => {
    //         expect(res.status).toEqual(401);
    //     });

    //     test('should return a message saying that the key is invalid.', () => {
    //         expect(res.body.message).toBe('Api Key bleep-bloop is invalid.');
    //     });
    // });

    // describe('if the api key is missing', () => {
    //     let res;
    //     beforeEach(async () => {
    //         res = await request(app)
    //             .get(`/api/workinggroup/${org.uuid}/profile/${p_version.uuid}`);
    //     });

    //     test('should return a 401 status', () => {
    //         expect(res.status).toEqual(401);
    //     });

    //     test('should return a message saying that the key is missing.', () => {
    //         expect(res.body.message).toBe('Api Key is missing.');
    //     });
    // });
});
