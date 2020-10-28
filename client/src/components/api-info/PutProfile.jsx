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
import { NotFoundObject, ProfileAndStatusObject, ProfileMetadataResponseObject, RequestConflictObject, UnauthorizedObject, ValidationResultObject, PreconditionFailedObject, PreconditionRequiredObject, ReferencedObjectTypes, ProfileStatusObject, ProfileObject, ProfileMetadataObject, WorkingGroupObject, ExampleRequestResponse } from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { CodeSpan, Description, Header, Lead, Notice, SubHeader } from './util/PageTemplate';

export default function PutProfile() {
    return (
        <PageTemplate>
            <Header>
                Edit Profile
            </Header>
            <Lead>Edit a draft profile by uploading a JSON-LD xAPI Profile document.</Lead>
            <Description>
                Update enables a user to update an xAPI Profile. Only profiles
                in draft can be edited. Profiles can only be edited by users
                in the group that governs the profile. An optional status object
                can be included in the body of the request to set the status to
                published, and to request verification.
            </Description>
            <Description>
                This endpoint requires the <CodeSpan>If-Unmodified-Since</CodeSpan> header to determine
                if the edit operation should continue. It can be obtained from the response headers
                of GET and POST profile endpoints.
            </Description>
            <Notice type="warning">
                A conflict will occur when attempting to update a profile that is published. To create a
                new draft, POST the profile with the <CodeSpan>status.published</CodeSpan> to&nbsp;
                <CodeSpan>false</CodeSpan>.
            </Notice>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="PUT"
                path="/api/profile/:profile_uuid"
                headers={{ "Content-Type": "application/json", "x-api-key": "api-key-uuid", "If-Unmodified-Since": "Datetime (Last-Modified value)" }}
                expandHeaderColumn={true}
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
                code="404"
                message="Not Found"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <NotFoundObject />
            </HTTPResponseAccordion>
            <HTTPResponseAccordion
                style={{ marginTop: "1em" }}
                code="409"
                message="Conflict"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <RequestConflictObject />
            </HTTPResponseAccordion>
            <HTTPResponseAccordion
                style={{ marginTop: "1em" }}
                code="412"
                message="Precondition Failed"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <PreconditionFailedObject />
            </HTTPResponseAccordion>
            <HTTPResponseAccordion
                style={{ marginTop: "1em" }}
                code="428"
                message="Precondition Required"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <PreconditionRequiredObject />
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
                Example Basic Edit Profile
            </SubHeader>
            <ExampleRequestResponse
                heading="PUT Profile Request"
                example={getExampleRequest}
            />
            <ExampleRequestResponse
                heading="PUT Profile Response"
                example={getExampleResponse}
            />
            <SubHeader>
                Example Edit and Publish Profile
            </SubHeader>
            <ExampleRequestResponse
                heading="PUT Profile as Draft"
                example={getExampleDraftRequest}
            />
            <ExampleRequestResponse
                heading="PUT Profile as Draft"
                example={getExampleDraftResponse}
            />
        </PageTemplate>
    )
}


function getExampleRequest() {
    return `
PUT /api/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd HTTP/1.1
Host: <host ip>
x-api-key: 00000000-xxxx-xxxx-xxxx-000000000000
Content-Type: application/json
If-Unmodified-Since: "Tue Sep 29 2020 16:17:05 GMT-0400 (Eastern Daylight Time)"

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
    }
}
    `)
}

function getExampleDraftRequest() {
    return (`
POST /api/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd HTTP/1.1
Host: <host ip>
x-api-key: 00000000-xxxx-xxxx-xxxx-000000000000
Content-Type: application/json
If-Unmodified-Since: "Tue Sep 29 2020 16:17:05 GMT-0400 (Eastern Daylight Time)"

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
            "published": false,
            "verified": false
        }
    }
}   
    `)
}
