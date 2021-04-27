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
import { ProfileObject, ExampleRequestResponse, NotFoundObject } from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { Description, Header, Lead, CodeSpan, SubHeader } from './util/PageTemplate';

export default function GetProfileByIRI() {
    return (
        <PageTemplate>
            <Header>
                get a profile by IRI
            </Header>
            <Lead>Get a JSON-LD xAPI Profile document from the xAPI Profile Server by its IRI.</Lead>
            <Description>
                This will retrieve the profile version that matches
                the IRI in the URL, or the most current published version if the base profile IRI was provided.
                The returned document is the JSON-LD xAPI Profile.
                The IRI of the profile can be found in the metadata response for the profile
                either when it was created or by querying the <CodeSpan>/api/profile/:uuid/metadata</CodeSpan> endpoint. It
                is also in the profile document.
            </Description>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="GET"
                path="/api/profile"
                queryParams={{ "iri": "The IRI of the profile or profile version" }}
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
                code="404"
                message="Not Found"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <NotFoundObject />
            </HTTPResponseAccordion>
            <SubHeader>
                Example Get Profile by IRI
            </SubHeader>
            <ExampleRequestResponse
                heading="GET Profile by IRI Request"
                example={getExampleRequest}
            />
            <ExampleRequestResponse
                heading="GET Profile by IRI Response"
                example={getExampleResponse}
            />
        </PageTemplate>
    )
}

function getExampleRequest() {
    return `
    GET /api/profile?iri=https://some.profile.iri HTTP/1.1
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
