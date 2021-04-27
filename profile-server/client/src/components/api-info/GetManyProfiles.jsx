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
import React from 'react';
import { ExampleRequestResponse, ProfileMetadataResponseObject, ReferencedObjectTypes, ProfileMetadataObject, ProfileStatusObject, WorkingGroupObject } from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { Description, Header, Lead, SubHeader } from './util/PageTemplate';

export default function GetManyProfiles() {
    return (
        <PageTemplate>
            <Header>
                get profiles
            </Header>
            <Lead>Retrieve all of the lastest published version of each profile.</Lead>
            <Description>
                This endpoint returns the most current published version for each profile. Due
                to the potential size of the reponse, metadata for each profile is returned, instead
                of the entire profile. Also this request can be filtered by working group, as well
                as limited and paged, through the use of query string parameters.
            </Description>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="GET"
                path="/api/profile"
                queryParams={{
                    "limit": "The number of results to return",
                    "page": "The page of results to return",
                    "workinggroup": "The UUID of the working group to filter by"
                }}
            >
            </HTTPRequest>
            <SubHeader>
                HTTP Responses
            </SubHeader>
            <HTTPResponseAccordion
                code="200"
                message="Success"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <ProfileMetadataResponseObject />
            </HTTPResponseAccordion>
            <SubHeader>
                Referenced Object Types
            </SubHeader>
            <ReferencedObjectTypes
                references={[
                    { type: "Profile Metadata Object", component: <ProfileMetadataObject hideCaption={true} /> },
                    { type: "Working Group Object", component: <WorkingGroupObject hideCaption={true} /> },
                    { type: "Profile Status Object", component: <ProfileStatusObject hideCaption={true} /> }
                ]}
            />
            <SubHeader>
                Example Get Profiles
            </SubHeader>
            <ExampleRequestResponse
                heading="GET Profiles Request"
                example={getExampleRequest}
            />
            <ExampleRequestResponse
                heading="GET Profiles Response"
                example={getExampleResponse}
            />
            <SubHeader>
                Example Get Profiles with Limit
            </SubHeader>
            <ExampleRequestResponse
                heading="GET Profiles Request"
                example={getExampleLimitRequest}
            />
            <ExampleRequestResponse
                heading="GET Profiles Response"
                example={getExampleLimitResponse}
            />
        </PageTemplate>
    )
}

function getExampleRequest() {
    return `
    GET /api/profile HTTP/1.1
    Host: <host ip>    
    `
}

function getExampleResponse() {
    return `
200 OK
Content-Type: application/json; charset=utf-8

{
    "success": true,
    "metadata": [
        {
            "profile_url": "https://some.url/profile/aaaaaaaa-ffff-4444-9999-333333333333",
            "profile_id": "https://some.profile.iri",
            "version_url": "https://some.url/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd",
            "version_id": "https://some.profile.iri/v/1",
            "version_uuid": "33333333-bbbb-4f4b-8888-2255c33bb0dd",
            "name": "Name of the Profile",
            "version": 1,
            "template_count": 12,
            "concept_count": 10,
            "pattern_count": 0,
            "updated": "2020-09-28T14:09:00.886Z",
            "working_group": {
                "name": "Some Working Group",
                "url": "http://workinggroup.url/etc"
                "uuid": "33333333-61b6-4b15-9dcf-c4c4c4c4c4c4"
            },
            "status": {
                "published": true,
                "verified": false
            }
        },
        {... additional profile metadata results}
    ]
}
    `
}

function getExampleLimitRequest() {
    return `
    GET /api/profile?limit=2 HTTP/1.1
    Host: <host ip>    
    `
}

function getExampleLimitResponse() {
    return `
200 OK
Content-Type: application/json; charset=utf-8

{
    "success": true,
    "metadata": [
        {
            "profile_url": "https://some.url/profile/aaaaaaaa-ffff-4444-9999-333333333333",
            "profile_id": "https://some.profile.iri",
            "version_url": "https://some.url/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd",
            "version_id": "https://some.profile.iri/v/1",
            "version_uuid": "33333333-bbbb-4f4b-8888-2255c33bb0dd",
            "name": "Name of the Profile",
            "version": 1,
            "template_count": 12,
            "concept_count": 10,
            "pattern_count": 0,
            "updated": "2020-09-28T14:09:00.886Z",
            "working_group": {
                "name": "Some Working Group",
                "url": "http://workinggroup.url/etc",
                "uuid": "33333333-61b6-4b15-9dcf-c4c4c4c4c4c4"
            },
            "status": {
                "published": true,
                "verified": false
            }
        },
        {
            "profile_url": "https://some.url/profile/aaaaaaaa-ffff-4444-9999-333333333333",
            "profile_id": "https://some.profile.iri",
            "version_url": "https://some.url/profile/33333333-bbbb-4f4b-8888-2255ccceedd1",
            "version_id": "https://some.profile.iri/v/1",
            "version_uuid": "33333333-bbbb-4f4b-8888-2255ccceedd1",
            "name": "Another Profile",
            "version": 2,
            "template_count": 15,
            "concept_count": 10,
            "pattern_count": 3,
            "updated": "2020-06-18T14:09:00.886Z",
            "working_group": {
                "name": "Some Other Working Group",
                "url": "http://other.workinggroup.url/etc"
                "uuid": "33333333-61b6-4b15-9dcf-aaa333111eee"
            },
            "status": {
                "published": true,
                "verified": false
            }
        }
    ]
}
    `
}
