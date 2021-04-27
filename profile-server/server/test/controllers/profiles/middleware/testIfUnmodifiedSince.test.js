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
const mongoose = require('mongoose');

const ProfileVersionModel = require('../../../../ODM/models').profileVersion;
const testIfUnmodifiedSince = require('../../../../controllers/profiles').middleware.testIfUnmodifiedSince;

const next = response => err => {
    if (err) {
        response.statusCode = err.status || 500;
        response.statusMessage = err.message;
    }
};

const addDays = (date, days) => {
    const copy = new Date(Number(date));
    copy.setDate(date.getDate() + days);
    return copy;
};

const SOME_PROFILE_ID = 'some_profile_id';
let requestObject;
const aDate = new Date();
const anEarlierDate = addDays(aDate, -1);
const aLaterDate = addDays(aDate, 1);
let request;
let response;
let profile;
describe('controllers.profiles.middleware.testIfUnmodifiedSince', () => {
    beforeEach(() => {
        requestObject = {
            method: 'GET',
            url: '/endpoint',
        };
    });

    describe('if there is a profile', () => {
        beforeEach(() => {
            profile = new ProfileVersionModel({
                iri: SOME_PROFILE_ID,
                name: 'some profile',
                description: 'this is a profile',
            });

            requestObject.profile = profile;
        });

        describe('and there is an If-Unmodified-Since header property', () => {
            beforeEach(() => {
                requestObject.headers = {};
                requestObject.headers['If-Unmodified-Since'] = aDate;
            });

            describe('and If-Unmodified-Since is equal to profile.updatedOn', () => {
                test('it should return a success code.', () => {
                    profile.updatedOn = aDate;

                    request = httpmocks.createRequest(requestObject);
                    response = httpmocks.createResponse();
                    testIfUnmodifiedSince(request, response, next(response));

                    expect(response.statusCode).toEqual(200);
                });

                describe('and If-Unmodified-Since is a string', () => {
                    test('it should return a success code.', () => {
                        profile.updatedOn = aDate;
                        requestObject.headers['If-Unmodified-Since'] = aDate.toString();

                        request = httpmocks.createRequest(requestObject);
                        response = httpmocks.createResponse();
                        testIfUnmodifiedSince(request, response, next(response));

                        expect(response.statusCode).toEqual(200);
                    });
                });
            });

            describe('and If-Unmodified-Since is greater than profile.updatedOn', () => {
                test('it should return a precondition failed error response.', () => {
                    profile.updatedOn = anEarlierDate;

                    request = httpmocks.createRequest(requestObject);
                    response = httpmocks.createResponse();
                    testIfUnmodifiedSince(request, response, next(response));

                    expect(response.statusCode).toEqual(412);
                });
            });

            describe('and If-Unmodified-Since is less than profile.updatedOn', () => {
                test('it should return a precondition failed error response.', () => {
                    profile.updatedOn = aLaterDate;

                    request = httpmocks.createRequest(requestObject);
                    response = httpmocks.createResponse();
                    testIfUnmodifiedSince(request, response, next(response));

                    expect(response.statusCode).toEqual(412);
                });
            });
        });

        describe('and there is not an If-Unmodified-Since header property', () => {
            test('it should return a precondition required error response.', () => {
                request = httpmocks.createRequest(requestObject);
                response = httpmocks.createResponse();
                testIfUnmodifiedSince(request, response, next(response));

                expect(response.statusCode).toEqual(428);
            });
        });
    });

    describe('if there is no a profile', () => {
        test('it should return an error response.', () => {
            request = httpmocks.createRequest(requestObject);
            response = httpmocks.createResponse();
            testIfUnmodifiedSince(request, response, next(response));

            expect(response.statusCode).toEqual(500);
        });
    });
});
