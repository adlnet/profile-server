const { TestScheduler } = require('jest');

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
test.todo('do tests');
// const request = require('supertest');
// const mongoose = require('mongoose');
// const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

// const apiKeyModel = require('../../../../ODM/models').apiKey;
// const organizationModel = require('../../../../ODM/models').organization;
// const profileController = require('../../../../controllers/profiles');

// const app = require('../../../../../app');
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

// describe('Generating an api key with a valid organization', () => {
//     let org;
//     let res;
//     beforeEach(async () => {
//         org = new organizationModel({
//             name: 'test',
//         });
//         await org.save();

//         res = await request(app)
//             .post(`/app/org/${org.uuid}/apiKey`)
//             .send();
//     });

//     test('should return with a 200 status.', () => {
//         expect(res.status).toEqual(200);
//     });

//     test('should return with a success.', () => {
//         expect(res.body.success).toBeTruthy();
//     });

//     test('should return an apiKey object.', () => {
//         expect(res.body.apiKey).not.toBeUndefined();
//     });
// });

// describe('Generating an api key with an invalid organization', () => {
//     let res;
//     beforeEach(async () => {
//         res = await request(app)
//             .post('/app/org/invalidOrgId/apiKey')
//             .send();
//     });

//     test('should return with a 404 status', () => {
//         expect(res.status).toEqual(404);
//     });

//     test('should return with a failure.', () => {
//         expect(res.body.success).toBeFalsy();
//     });

//     test('should return with the message `This is an invalid organization.`', () => {
//         expect(res.body.message).toEqual('Could not locate org resource with uuid: invalidOrgId');
//     });
// });
