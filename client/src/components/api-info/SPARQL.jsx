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
    SPARQLQueryResults, ValidationResultObject,
    UnauthorizedObject, ExampleRequestResponse, SPARQLQuery
} from './util/HTTPContent';
import { HTTPRequest, HTTPResponseAccordion } from './util/HTTPRequestandResponse';
import PageTemplate, { Description, Header, Lead, SubHeader } from './util/PageTemplate';

export default function SPARQL() {
    return (
        <PageTemplate>
            <Header>
                SPARQL
            </Header>
            <Lead>A semantic query language endpoint for the xAPI Profile Server.</Lead>
            <Description>
                This server hosts an endpoint to perform SPARQL semantic queries across the
                profile data. Using this language it is possible to follow the semantic
                relationships between components of the profiles to identify profiles that
                could match certain criteria or needs.
            </Description>
            <Description>
                It is outside the scope of this documentation to provide a comprehensive guide
                to SPARQL or semantic querying.
            </Description>
            <SubHeader>
                HTTP Request
            </SubHeader>
            <HTTPRequest
                method="POST"
                path="/api/sparql"
                headers={{ "Content-Type": "text/plain", "x-api-key": "api-key-uuid" }}
            >
                <SPARQLQuery />
            </HTTPRequest>
            <SubHeader>
                HTTP Responses
            </SubHeader>
            <HTTPResponseAccordion
                code="200"
                message="Success"
                headers={{ "Content-Type": "application/json; charset=UTF-8" }}
            >
                <SPARQLQueryResults />
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
            <SubHeader>
                Example Basic SPARQL
            </SubHeader>
            <ExampleRequestResponse
                heading="POST SPARQL Request"
                example={getExampleRequest}
            />
            <ExampleRequestResponse
                heading="POST SPARQL Response"
                example={getExampleResponse}
            />
        </PageTemplate>
    )
}

function getExampleRequest() {
    return `
POST /api/sparql HTTP/1.1
Host: <host ip>
x-api-key: 19dfe409-d4ee-4199-8f15-89c3c511030b
Content-Type: text/plain

select ?o 
where {
    ?o a <https://w3id.org/xapi/ontology#Verb>
}
    `
}

function getExampleResponse() {
    return (`
200 OK
Content-Type: application/json; charset=utf-8

[
    {
        "o": {
            "token": "uri",
            "value": "https://someurl/verbs/someverb"
        }
    }, {... more results}
]
    `)
}
