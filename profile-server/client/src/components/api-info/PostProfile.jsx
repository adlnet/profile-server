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
import {
    ProfileAndStatusObject, ProfileMetadataResponseObject, ValidationResultObject,
    UnauthorizedObject, RequestConflictObject, ReferencedObjectTypes, ProfileStatusObject,
    ProfileObject, ProfileMetadataObject, WorkingGroupObject, ExampleRequestResponse
} from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { Description, Header, Lead, CodeSpan, SubHeader } from './util/PageTemplate';

export default function PostProfile() {
    return (
        <PageTemplate>
            <Header>
                import/create profile
            </Header>
            <Lead>Upload a JSON-LD xAPI Profile document to the xAPI Profile Server.</Lead>
            <Description>
                This process will save the profile to the working group that owns the
                api key used to authenticate this request, and set the profile state
                to published. If a published version of the profile already exists
                this request will create a new published version. An optional profile
                status object can be included in the request body to set this version
                of the profile to draft (<CodeSpan>published: false</CodeSpan>), or to request verification
                of the incoming published profile (<CodeSpan>verificationRequest: Datetime</CodeSpan>).
            </Description>
            <Description>
                The conflict response is returned when the profile version already exists.
                This is determined when the International Resource Identifier (IRI) of the
                imported document matches an existing IRI in the database. The conflict
                response is also returned when a request is made to publish a new version
                when a current draft exists. To resolve this delete or publish the current
                draft version.
            </Description>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="POST"
                path="/api/profile"
                headers={{ "Content-Type": "application/json", "x-api-key": "api-key-uuid" }}
            >
                <ProfileAndStatusObject />
            </HTTPRequest>
            <SubHeader>
                HTTP Responses
            </SubHeader>
            <HTTPResponseAccordion
                code="200"
                message="Success"
                headers={{ "Content-Type": "application/json; charset=UTF-8", "Last-Modified": "Datetime" }}
            >
                <ProfileMetadataResponseObject />
            </HTTPResponseAccordion>
            <HTTPResponseAccordion
                style={{ marginTop: "1em" }}
                code="400"
                message="Invalid Profile"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <ValidationResultObject />
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
                code="409"
                message="Conflict"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <RequestConflictObject />
            </HTTPResponseAccordion>
            <SubHeader>
                Referenced Object Types
            </SubHeader>
            <ReferencedObjectTypes
                references={[
                    { type: "Profile Status Object", component: <ProfileStatusObject hideCaption={true} /> },
                    { type: "Profile", component: <ProfileObject hideCaption={true} /> },
                    { type: "Profile Metadata Object", component: <ProfileMetadataObject hideCaption={true} /> },
                    { type: "Working Group Object", component: <WorkingGroupObject hideCaption={true} /> }
                ]}
            />
            <SubHeader>
                Example Basic Publish Profile
            </SubHeader>
            <ExampleRequestResponse
                heading="POST Profile Request"
                example={getExampleRequest}
            />
            <ExampleRequestResponse
                heading="POST Profile Response"
                example={getExampleResponse}
            />
            <SubHeader>
                Example Post Draft Profile
            </SubHeader>
            <ExampleRequestResponse
                heading="POST Profile as Draft"
                example={getExampleDraftRequest}
            />
            <ExampleRequestResponse
                heading="POST Profile as Draft "
                example={getExampleDraftResponse}
            />
        </PageTemplate>
    )
}

function getExampleRequest() {
    return `
POST /api/profile HTTP/1.1
Host: <host ip>
x-api-key: 00000000-xxxx-xxxx-xxxx-000000000000
Content-Type: application/json

{
    "profile": {
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
        "concepts": [ ... ],
        "templates": [ ... ],
        "patterns": [ ... ]
    }
}
    `
}

function getExampleResponse() {
    return (`
200 OK
Content-Type: application/json; charset=utf-8
Last-Modified: "Tue Sep 29 2020 16:17:05 GMT-0400 (Eastern Daylight Time)"

{
    "success": true,
    "metadata": {
        "profile_url": "https://some.url/profile/aaaaaaaa-ffff-4444-9999-333333333333",
        "profile_id": "https://some.profile.iri",
        "version_url": "https://some.url/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd",
        "version_id": "https://some.profile.iri/v/1",
        "version_uuid": "33333333-bbbb-4f4b-8888-2255c33bb0dd"
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
    }
}
    `)
}

function getExampleDraftRequest() {
    return (`
POST /api/profile HTTP/1.1
Host: <host ip>
x-api-key: 00000000-xxxx-xxxx-xxxx-000000000000
Content-Type: application/json

{
    "status": {
        "published": false
    },
    "profile": {
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
        "concepts": [ ... ],
        "templates": [ ... ],
        "patterns": [ ... ]
    }
}
    `)
}

function getExampleDraftResponse() {
    return (`
200 OK
Content-Type: application/json; charset=utf-8
Last-Modified: "Tue Sep 29 2020 16:17:05 GMT-0400 (Eastern Daylight Time)"

{
    "success": true,
    "metadata": {
        "profile_url": "https://some.url/profile/aaaaaaaa-ffff-4444-9999-333333333333",
        "profile_id": "https://some.profile.iri",
        "version_url": "https://some.url/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd",
        "version_id": "https://some.profile.iri/v/1",
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
            "published": false,
            "verified": false
        }
    }
}   
    `)
}
