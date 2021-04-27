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
import { UnauthorizedObject, ProfileObject, ExampleRequestResponse, NotFoundObject } from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { Description, Header, Lead, CodeSpan, SubHeader, Notice } from './util/PageTemplate';

export default function GetSingleProfile() {
    return (
        <PageTemplate>
            <Header>
                get a profile
            </Header>
            <Lead>Get a JSON-LD xAPI Profile document from the xAPI Profile Server.</Lead>
            <Description>
                This will retrieve the profile version that matches
                the UUID in the URL. The returned document is the JSON-LD xAPI Profile.
                The UUID of the profile can be found in the metadata response for the profile
                either when it was created or by querying the <CodeSpan>/api/profile/:uuid/metadata</CodeSpan> endpoint.
            </Description>
            <Notice type="warning">
                Use an api key to get profile drafts. The api key determines which working group's profile drafts you can access.
            </Notice>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="GET"
                path="/api/profile/:profile_uuid"
                headers={{ "x-api-key": "[Optional] api-key-uuid" }}
            >
            </HTTPRequest>
            <SubHeader>
                HTTP Responses
            </SubHeader>
            <HTTPResponseAccordion
                code="200"
                message="Success"
                headers={{ "Content-Type": "application/json; charset=UTF-8", "Last-Modified": "Datetime" }}
            >
                <ProfileObject />
            </HTTPResponseAccordion>
            <HTTPResponseAccordion
                style={{ marginTop: "1em" }}
                code="401"
                message="Unauthorized"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <UnauthorizedObject />
            </HTTPResponseAccordion>
            <HTTPResponseAccordion
                style={{ marginTop: "1em" }}
                code="404"
                message="Not Found"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <NotFoundObject />
            </HTTPResponseAccordion>
            <SubHeader>
                Example Basic Get Profile
            </SubHeader>
            <ExampleRequestResponse
                heading="GET Profile Request"
                example={getExampleRequest}
            />
            <ExampleRequestResponse
                heading="GET Profile Response"
                example={getExampleResponse}
            />
            <SubHeader>
                Example Get Draft Profile
            </SubHeader>
            <ExampleRequestResponse
                heading="GET Draft Profile Request"
                example={getExampleDraftRequest}
            />
            <ExampleRequestResponse
                heading="GET Draft Profile Response"
                example={getExampleDraftResponse}
            />
        </PageTemplate>
    )
}

function getExampleRequest() {
    return `
GET /api/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd HTTP/1.1
Host: <host ip>
    `
}

function getExampleResponse() {
    return `
200 OK
Content-Type: application/json; charset=utf-8
Last-Modified: "Tue Sep 29 2020 16:17:05 GMT-0400 (Eastern Daylight Time)"

{
    "@context": "https://w3id.org/xapi/profiles/context",
    "id": "https://some.profile.iri",
    "type": "Profile",
    "conformsTo": "https://w3id.org/xapi/profiles#1.0",
    "prefLabel": {
        "en": "Name of the Profile"
    },
    "definition": {
        "en": "A description"
    },
    "seeAlso": "https://some.path.to.moreinfo",
    "versions": [
        {
            "id": "https://some.profile.iri/v/1",
            "generatedAtTime": "2020-09-28T14:09:00.886Z"
        }
    ],
    "author": {
        "type": "Organization",
        "name": "Some Working Group"
    },
    "versions": [ ... ],
    "concepts": [ ... ],
    "templates": [ ... ],
    "patterns": [ ... ]
}
    `
}

function getExampleDraftRequest() {
    return `
GET /api/profile/33333333-bbbb-4f4b-8888-2255c33990cc HTTP/1.1
Host: <host ip>
x-api-key: 00000000-xxxx-xxxx-xxxx-000000000000
    `
}

function getExampleDraftResponse() {
    return `
200 OK
Content-Type: application/json; charset=utf-8
Last-Modified: "Tue Sep 29 2020 16:17:05 GMT-0400 (Eastern Daylight Time)"

{
    "@context": "https://w3id.org/xapi/profiles/context",
    "id": "https://some.profile.iri",
    "type": "Profile",
    "conformsTo": "https://w3id.org/xapi/profiles#1.0",
    "prefLabel": {
        "en": "Name of the Profile"
    },
    "definition": {
        "en": "A description"
    },
    "seeAlso": "https://some.path.to.moreinfo",
    "versions":[
        {
            "id": "https://some.profile.iri/v/2",
            "wasRevisionOf": "https://some.profile.iri/v/1",
            "generatedAtTime: "2020-09-28T15:15:00.456Z"
        },
        {
            "id": "https://some.profile.iri/v/1",
            "generatedAtTime": "2020-09-28T14:09:00.886Z"
        }
    ]
    "author": {
        "type": "Organization",
        "name": "Some Working Group"
    },
    "versions": [ ... ],
    "concepts": [ ... ],
    "templates": [ ... ],
    "patterns": [ ... ]
}
    `
}