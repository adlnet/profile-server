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
    ExampleRequestResponse, NotFoundObject, ProfileMetadataObject, ProfileStatusObject,
    ProfileStatusResponseObject, ReferencedObjectTypes, UnauthorizedObject,
    ValidationResultObject, WorkingGroupObject
} from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { CodeSpan, Description, Header, Lead, SubHeader } from './util/PageTemplate';

export default function Status() {
    return (
        <PageTemplate>
            <Header>
                update profile status
            </Header>
            <Lead>Set a profile to published or request the profile to be verified.</Lead>
            <Description>
                Enables a user with appropriate permissions to update the status of a given
                profile to publish the profile version, or to request the admin to verify the
                profile version. This can only be done by the working group members and only
                the <CodeSpan>published</CodeSpan> and <CodeSpan>verificationRequest</CodeSpan> properties
                can be modified. Setting the <CodeSpan>published</CodeSpan> property
                to <CodeSpan>true</CodeSpan> will publish the profile version. Setting
                an <CodeSpan>ISO 8601 Datetime</CodeSpan> for the <CodeSpan>verificationRequest</CodeSpan> property
                will add the profile version to the queue of profiles to be verified by the server administrator.
            </Description>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="POST"
                path="/api/profile/:profile_uuid/status"
                headers={{ "Content-Type": "application/json", "x-api-key": "api-key-uuid" }}
            >
                <ProfileStatusObject />
            </HTTPRequest>
            <SubHeader>
                HTTP Responses
            </SubHeader>
            <HTTPResponseAccordion
                code="200"
                message="Success"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <ProfileStatusResponseObject />
            </HTTPResponseAccordion>
            <HTTPResponseAccordion
                style={{ marginTop: "1em" }}
                code="400"
                message="Bad Request"
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
            <SubHeader>
                Referenced Object Types
            </SubHeader>
            <ReferencedObjectTypes
                references={[
                    { type: "Profile Metadata Object", component: <ProfileMetadataObject hideCaption={true} /> },
                    { type: "Working Group Object", component: <WorkingGroupObject hideCaption={true} /> }
                ]}
            />
            <SubHeader>
                Example Basic Publish Profile
            </SubHeader>
            <ExampleRequestResponse
                heading="POST Profile Publish Request"
                example={getExampleRequest}
            />
            <ExampleRequestResponse
                heading="POST Profile Publish Response"
                example={getExampleResponse}
            />
            <SubHeader>
                Example Post Verification Request Profile
            </SubHeader>
            <ExampleRequestResponse
                heading="POST Profile Verification Request"
                example={getExampleVerifyRequest}
            />
            <ExampleRequestResponse
                heading="POST Profile Verification Response"
                example={getExampleVerifyResponse}
            />
        </PageTemplate>
    )
}

function getExampleRequest() {
    return `
POST /api/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd/status? HTTP/1.1
Host: <host ip>
x-api-key: 00000000-xxxx-xxxx-xxxx-000000000000
Content-Type: application/json

{
    "published": true,
    "verified": false
}
    `
}

function getExampleResponse() {
    return `
{
    "success": true,
    "status": {
        "published": true,
        "verified": false
    }
}
    `
}

function getExampleVerifyRequest() {
    return `
POST /api/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd/status? HTTP/1.1
Host: <host ip>
x-api-key: 00000000-xxxx-xxxx-xxxx-000000000000
Content-Type: application/json

{
    "published": true,
    "verified": false,
    "verificationRequest": "2020-09-29T20:16:20.385Z"
}  
    `
}

function getExampleVerifyResponse() {
    return `
{
    "success": true,
    "status": {
        "published": true,
        "verified": false,
        "verificationRequest": "2020-09-29T20:16:20.385Z"
    }
}
    `
}


