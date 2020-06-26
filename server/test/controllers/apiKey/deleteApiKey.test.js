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

let deleteApiKeyByUuid;

describe('Deleting an api key', () => {
    const next = response => err => {
        if (err) {
            response.statusCode = 400;
            response.statusMessage = err.message;
        }
    };

    describe('when passed a valid api key id', () => {
        let res;
        beforeEach(async () => {
            deleteApiKeyByUuid = sinon.stub(apiKeyModel, 'deleteByUuid');

            const req = httpmocks.createRequest({
                method: 'DELETE',
                url: '/',
                params: {
                    org: 'some-org-id',
                    apiKey: 'some-good-apikey-id',
                },
            });
            res = httpmocks.createResponse();

            await apiKeyController.deleteApiKey(req, res, next(res));
        });

        afterEach(() => {
            deleteApiKeyByUuid.restore();
        });

        test('it should respond with a 200 status.', () => {
            expect(res.statusCode).toEqual(200);
        });

        test('it should respond with a success.', () => {
            expect(res._getData().success).toBeTruthy();
        });
    });

    describe('when passed an invalid api key id', () => {
        let res;
        beforeEach(async () => {
            deleteApiKeyByUuid = sinon.stub(apiKeyModel, 'deleteByUuid');
            deleteApiKeyByUuid.throws(new Error('Api Key does not exist.'));

            const req = httpmocks.createRequest({
                method: 'DELETE',
                url: '/',
                params: {
                    org: 'some-org-id',
                    apiKey: 'bad-apikey-id',
                },
            });
            res = httpmocks.createResponse();

            await apiKeyController.deleteApiKey(req, res, next(res));
        });

        afterEach(() => {
            deleteApiKeyByUuid.restore();
        });

        test('it should respond with a failed status.', () => {
            expect(res.statusCode).toEqual(400);
        });

        test('it should respond with an error.', () => {
            expect(res.statusMessage).toMatch(/Api Key does not exist/);
        });
    });

    describe('when missing an api key id', () => {
        let res;
        beforeEach(async () => {
            deleteApiKeyByUuid = sinon.stub(apiKeyModel, 'deleteByUuid');
            deleteApiKeyByUuid.throws(new Error('Api Key does not exist.'));

            const req = httpmocks.createRequest({
                method: 'DELETE',
                url: '/',
                params: {
                    org: 'some-org-id',
                },
            });
            res = httpmocks.createResponse();

            await apiKeyController.deleteApiKey(req, res, next(res));
        });

        afterEach(() => {
            deleteApiKeyByUuid.restore();
        });

        test('it should respond with a failed status.', () => {
            expect(res.statusCode).toEqual(400);
        });

        test('it should respond with an error.', () => {
            expect(res.statusMessage).toMatch(/Api Key does not exist/);
        });
    });
});

