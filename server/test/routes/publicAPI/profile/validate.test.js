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

const app = require('../../../../../app');
const createIRI = require('../../../../utils/createIRI');

describe('Validate', () => {
    // const mongoServer = new MongoMemoryServer();

    // beforeAll(async () => {
    //     const dburi = await mongoServer.getUri();
    //     await mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
    // });

    it.todo('test validation endpoint');
});
