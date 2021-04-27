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
import { ExampleRequestResponse, NotFoundObject, ProfileMetadataResponseObject, ReferencedObjectTypes, ProfileMetadataObject, ProfileStatusObject, WorkingGroupObject, UnauthorizedObject } from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { Description, Header, Lead, SubHeader } from './util/PageTemplate';

export default function Metadata() {
    return (
        <PageTemplate>
            <Header>
                get profile metadata
            </Header>
            <Lead>Get the metadata about a specific profile.</Lead>
            <Description>
                This endpoint returns the metadata about a profile based on the
                UUID provided in the URL. Using the base profile UUID will return
                the metadata for the latest published profile.
            </Description>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="GET"
                path="/api/profile/:profile_uuid/meta"
                headers={{ "Content-Type": "application/json", "x-api-key": "api-key-uuid" }}
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
                <ProfileMetadataResponseObject />
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
                Example Get Profile Metadata
            </SubHeader>
            <ExampleRequestResponse
                heading="GET Profile Metadata Request"
                example={getExampleRequest}
            />
            <ExampleRequestResponse
                heading="GET Profile Metadata Response"
                example={getExampleResponse}
            />
        </PageTemplate>
    )
}

function getExampleRequest() {
    return `
GET /api/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd/meta HTTP/1.1
Host: <host ip> 
x-api-key: 00000000-xxxx-xxxx-xxxx-000000000000
Content-Type: application/json   
    `
}

function getExampleResponse() {
    return `
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
            "url": "http://workinggroup.url/etc"
            "uuid": "33333333-61b6-4b15-9dcf-c4c4c4c4c4c4"
        },
        "status": {
            "published": true,
            "verified": false
        }
    }
}
    `
}

