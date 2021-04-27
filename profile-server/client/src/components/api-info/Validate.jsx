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
import { ValidationResultObject, ProfileObject, ExampleRequestResponse } from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { Description, Header, Lead, Notice, SubHeader } from './util/PageTemplate';

export default function Validate() {
    return (
        <PageTemplate>
            <Header>
                Validate Profile
            </Header>
            <Lead>Validate profile by uploading a JSON-LD xAPI Profile document.</Lead>
            <Description>
                An endpoint provided to test a JSON-LD xAPI Profile document's conformance
                to the xAPI Profile spec. It will respond with validation errors if any exist.
                This endpoint is public and does not require an api key.
            </Description>
            <Notice type="warning">
                This validates against a schema. It is possible importing a validated profile may fail
                due to issues such as IRI conflicts.
            </Notice>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="POST"
                path="/api/validate"
                headers={{ "Content-Type": "application/json" }}
            >
                <ProfileObject />
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
                code="400"
                message="Invalid Profile"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <ValidationResultObject />
            </HTTPResponseAccordion>
            <SubHeader>
                Example Validate Profile
            </SubHeader>
            <ExampleRequestResponse
                heading="POST Validate Profile Request"
                example={getExampleRequest}
            />
            <ExampleRequestResponse
                heading="POST Validate Profile Response"
                example={getExampleResponse}
            />
        </PageTemplate>
    )
}

function getExampleRequest() {
    return `
POST /api/validate HTTP/1.1
Host: <host ip>
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
    return `
200 OK
Content-Type: application/json; charset=utf-8

{
    "success": true,
    "message": "Validation successful."
}
    `
}
