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
const organizationModel = require('../../../ODM/models').organization;
const apiKeyModel = require('../../../ODM/models').apiKey;

let findOrganizationByUuid;
let findApiKeys;
describe('Retrieving all active api keys for an organization', () => {
    const next = response => err => {
        if (err) {
            response.statusCode = 400;
            response.statusMessage = err.message;
        }
    };

    describe('when passed a valid organization', () => {
        let res;
        let uuids;
        let expectedApiKeys;
        beforeEach(async () => {
            uuids = [...Array(4).keys()].map(k => require('uuid').v4());
            expectedApiKeys = await Promise.all(uuids.map(async (uuid, i) => (
                apiKeyModel({ uuid: uuid })
            )));

            findOrganizationByUuid = sinon.stub(organizationModel, 'findByUuid');
            findOrganizationByUuid.resolves(new organizationModel({ name: 'test' }));
            findApiKeys = sinon.stub(apiKeyModel, 'find');
            findApiKeys.resolves(expectedApiKeys);

            const req = httpmocks.createRequest({
                method: 'GET',
                url: '/',
                params: {
                    org: 'some-org-id',
                },
            });
            res = httpmocks.createResponse();

            await apiKeyController.getApiKeys(req, res, next(res));
        });

        afterEach(() => {
            findOrganizationByUuid.restore();
            findApiKeys.restore();
        });

        test('it should respond with a status 200', () => {
            expect(res.statusCode).toEqual(200);
        });

        test('it should respond with a success', () => {
            expect(res._getData().success).toBeTruthy();
        });

        test('it should respond with all the active api keys for the organization.', () => {
            const data = res._getData().apiKeys;
            expect(data).not.toBeUndefined();
            expect(data.length).toEqual(4);
            expect(data).toStrictEqual(expectedApiKeys);
        });
    });

    describe('when passed an invalid organization', () => {
        let res;
        beforeEach(async () => {
            findOrganizationByUuid = sinon.stub(organizationModel, 'findByUuid');
            findOrganizationByUuid.resolves(undefined);
            findApiKeys = sinon.stub(apiKeyModel, 'find');

            const req = httpmocks.createRequest({
                method: 'GET',
                url: '/',
                params: {
                    org: 'bad-org-id',
                },
            });
            res = httpmocks.createResponse();

            await apiKeyController.getApiKeys(req, res, next(res));
        });

        afterEach(() => {
            findOrganizationByUuid.restore();
            findApiKeys.restore();
        });

        test('it should respond with a failed status.', () => {
            expect(res.statusCode).toEqual(400);
        });

        test('it should respond with an error.', () => {
            expect(res.statusMessage).toMatch(/Organization does not exist/);
        });
    });
});
