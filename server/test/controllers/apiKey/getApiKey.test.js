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
const httpmocks = require('node-mocks-http');
const sinon = require('sinon');

const apiKeyController = require('../../../controllers/apiKeys');
const apiKeyModel = require('../../../ODM/models').apiKey;

describe('Retrieving an api key', () => {
    const next = response => err => {
        if (err) {
            response.statusCode = 400;
            response.statusMessage = err.message;
        }
    };

    describe('when passed a valid api key id', () => {
        let uuid;
        let res;
        let createNewApiKey;
        beforeEach(async () => {
            uuid = require('uuid').v4();
            const expectedApiKey = new apiKeyModel({ uuid: uuid });

            createNewApiKey = sinon.stub(apiKeyModel, 'findOne');
            createNewApiKey.resolves(expectedApiKey);

            const req = httpmocks.createRequest({
                method: 'GET',
                url: '/',
                params: {
                    org: 'good-org-uuid',
                    apiKey: 'good-apikey-uuid',
                },
            });
            res = httpmocks.createResponse();

            await apiKeyController.getApiKey(req, res, next(res));
        });

        afterEach(() => {
            createNewApiKey.restore();
        });

        test('it should respond with a status 200.', () => {
            expect(res.statusCode).toEqual(200);
        });

        test('it should respond with a success.', () => {
            expect(res._getData().success).toBeTruthy();
        });

        test('it should return the requested api key.', () => {
            const data = res._getData().apiKey;
            expect(data).not.toBeUndefined();
            expect(data.uuid).toEqual(uuid);
        });
    });

    describe('when passed an invalid api key id', () => {
        let res;
        let createNewApiKey;
        beforeEach(async () => {
            createNewApiKey = sinon.stub(apiKeyModel, 'findOne');
            createNewApiKey.resolves(undefined);

            const req = httpmocks.createRequest({
                method: 'GET',
                url: '/',
                params: {
                    org: 'some-org-id',
                    apiKey: 'bad-apikey-id',
                },
            });
            res = httpmocks.createResponse();

            await apiKeyController.getApiKey(req, res, next(res));
        });

        afterEach(() => {
            createNewApiKey.restore();
        });

        test('it should respond with a failed status.', () => {
            expect(res.statusCode).toEqual(400);
        });

        test('it should respond with an error.', () => {
            expect(res.statusMessage).toMatch(/Api Key does not exist/);
        });
    });
});
