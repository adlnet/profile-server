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
import { ExampleRequestResponse, NotAllowedObject, NotFoundObject, RequestConflictObject, UnauthorizedObject, ValidationResultObject } from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { Description, Header, Lead, SubHeader } from './util/PageTemplate';

export default function DeleteProfile() {
    return (
        <PageTemplate>
            <Header>
                Delete Draft Profile
            </Header>
            <Lead>Delete a draft profile version from the server.</Lead>
            <Description>
                Enables a user with appropriate permissions to delete a profile. Only draft
                profiles can be deleted. Only draft profiles of the working group associated
                with the api key may be deleted using that api key. Versions will maintain
                continuity without gaps - if draft (“version 3”) is deleted, the next draft will
                be “version 3”.
            </Description>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="DELETE"
                path="/api/profile/:profile_uuid"
                headers={{ "Content-Type": "application/json", "x-api-key": "api-key-uuid" }}
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
                code="405"
                message="Not Allowed"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <NotAllowedObject />
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
        </PageTemplate>
    )
}

function getExampleRequest() {
    return `
DELETE /api/profile/33333333-bbbb-4f4b-8888-2255c33bb0dd HTTP/1.1
Host: <host ip>
x-api-key: 00000000-xxxx-xxxx-xxxx-000000000000
    `
}

function getExampleResponse() {
    return `
200 OK

{
    "success": true,
    "message": "The draft was successfully deleted."
}
    `
}
