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
import { v4 as uuidv4 } from 'uuid';

export function ProfileAndStatusObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Profile and Status Object" : ""}
            rows={[
                { property: "status", type: "Profile Status Object", description: "[Optional] Profile Status Object to set published status and a verification request" },
                { property: "profile", type: "Profile", description: "The xAPI Profile in JSON-LD" }
            ]}
        />
    );
}

export function ProfileMetadataResponseObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Profile Metadata Response Object" : ""}
            rows={[
                { property: "success", type: "Boolean", description: "The request was successful" },
                { property: "metadata", type: "Profile Metadata", description: "Metadata about the profile" }
            ]}
        />
    )
}

export function ProfileStatusResponseObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Profile Status Response Object" : ""}
            rows={[
                { property: "success", type: "Boolean", description: "The request was successful" },
                { property: "status", type: "Profile Status Object", description: "The current status of the profile" }
            ]}
        />
    )
}

export function ValidationResultObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Validation Result Object" : ""}
            rows={[
                { property: "success", type: "Boolean", description: "The request was successful" },
                { property: "message", type: "String", description: "Validation results" }
            ]}
        />
    )
}

export function UnauthorizedObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Unauthorized Object" : ""}
            rows={[
                { property: "success", type: "Boolean", description: "The request was successful" },
                { property: "message", type: "String", description: "The message from the server about this unauthorized response" }
            ]}
        />
    )
}

export function NotFoundObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Not Found Object" : ""}
            rows={[
                { property: "success", type: "Boolean", description: "The request was successful" },
                { property: "message", type: "String", description: "The message from the server about this not found response" }
            ]}
        />
    )
}

export function NotAllowedObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Not Allowed Object" : ""}
            rows={[
                { property: "success", type: "Boolean", description: "The request was successful" },
                { property: "message", type: "String", description: "The message from the server about this not allowed response" }
            ]}
        />
    )
}

export function RequestConflictObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Unauthorized Object" : ""}
            rows={[
                { property: "success", type: "Boolean", description: "The request was successful" },
                { property: "message", type: "String", description: "The message from the server about this conflict response" }
            ]}
        />
    )
}

export function PreconditionFailedObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Precondition Failed Object" : ""}
            rows={[
                { property: "success", type: "Boolean", description: "The request was successful" },
                { property: "message", type: "String", description: "The message from the server about this precondition failed response" }
            ]}
        />
    )
}

export function PreconditionRequiredObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Precondition Required Object" : ""}
            rows={[
                { property: "success", type: "Boolean", description: "The request was successful" },
                { property: "message", type: "String", description: "The message from the server about this precondition required response" }
            ]}
        />
    )
}

export function ProfileStatusObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Profile Status Object" : ""}
            rows={[
                { property: "published", type: "Boolean", description: "Indicates if this profile is published or draft" },
                { property: "verified", type: "Boolean", description: "Indicates if this profile is verified" },
                { property: "verificationRequest", type: "ISO 8601 Datetime", description: "ISO 8601 Datetime of when a request to verify the profile was submitted" }
            ]}
        />
    )
}

export function ProfileObject(props) {
    return (
        <div className="font-ui-2xs font-base margin-top-1" style={props.style}>An xAPI Profile JSON-LD document. See&nbsp;
            <a href="https://github.com/adlnet/xapi-profiles/blob/master/xapi-profiles-structure.md">
                the ADL xAPI Profile Spec
        </a> for more information.
        </div>
    )
}

export function SPARQLQuery(props) {
    return (
        <div className="font-ui-2xs font-base margin-top-1" style={props.style}>A SPARQL query.
        See&nbsp;
            <a href="https://www.w3.org/TR/rdf-sparql-query/"> the W3C spec on the SPARQL Query Language</a>, or&nbsp;
            <a href="https://jena.apache.org/tutorials/sparql.html"> the Apache Jena SPARQL Tutorial</a> for more information.
        </div>
    )
}

export function SPARQLQueryResults(props) {
    return (
        <div className="font-ui-2xs font-base margin-top-1" style={props.style}>SPARQL query results in JSON.
        </div>
    )
}

export function ProfileMetadataObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Profile Metadata Object" : ""}
            rows={[
                { property: "profile_url", type: "URL", description: "URL to the profile on the server" },
                { property: "profile_id", type: "IRI", description: "The IRI of the profile" },
                { property: "version_url", type: "URL", description: "URL to the profile version on the server" },
                { property: "version_id", type: "IRI", description: "The IRI of the profile version" },
                { property: "version_uuid", type: "UUID", description: "The UUID of the profile version" },
                { property: "name", type: "String", description: "The name of the profile version" },
                { property: "version", type: "Number", description: "The version of the profile version" },
                { property: "template_count", type: "Number", description: "The number of statement templates in the profile version" },
                { property: "concept_count", type: "Number", description: "The number of concepts in the profile version" },
                { property: "pattern_count", type: "Number", description: "The number of patterns in the profile version" },
                { property: "updated", type: "ISO 8601 Datetime", description: "ISO 8601 Datetime of the last update to the profile version" },
                { property: "working_group", type: "Working Group Object", description: "The working group that owns the profile version" },
                { property: "status", type: "Profile Status Object", description: "The status of the profile version" }
            ]}
        />
    )
}

export function WorkingGroupObject(props) {
    return (
        <ObjectTable
            caption={!props.hideCaption ? "Working Group Object" : ""}
            rows={[
                { property: "url", type: "URL", description: "URL to the working group on the Profile Server" },
                { property: "name", type: "String", description: "The name of the working group" },
                { property: "uuid", type: "UUID", description: "The UUID of the working group" }
            ]}
        />
    )
}

export function ReferencedObjectTypes(props) {
    if (!props.references) return '';
    return (
        <div className="grid-row padding-left-0" style={props.style}>
            <div className="usa-accordion">
                {
                    props.references.map((reference, i) => <ObjectAccordionSection key={i} idx={i + 'refobj'} reference={reference} />)
                }
            </div>
        </div>
    )
}

export function ExampleRequestResponse(props) {
    if (!props.example) return '';
    return (
        <div className="grid-row padding-left-0" style={props.style}>
            <div className="usa-accordion">
                <ObjectAccordionSection idx={uuidv4()} reference={{ type: props.heading, component: <pre className="font-code-2xs text-base">{props.example()}</pre> }} />
            </div>
        </div>
    )
}

function ObjectAccordionSection(props) {
    return (<>
        <div key={props.idx + 'button'} className="usa-accordion__heading border-bottom border-primary-light">
            <button className="api-info usa-accordion__button bg-white padding-left-1 padding-bottom-1" style={{ block: "inline" }} aria-expanded="false" aria-controls={props.idx}>
                <div className="grid-row">
                    <div className="grid-col margin-left-2 font-ui-xs">
                        <span>{props.reference.type}</span>
                    </div>
                </div>
            </button>
        </div>
        <div key={props.idx + 'body'} id={props.idx} className="usa-accordion__content margin-0 padding-0" hidden>
            {
                props.reference.component && <>
                    {/* <div className="grid-row padding-x-1 margin-bottom-0">
                        <div className="grid-col"><span className="text-base-darker text-bold">Body</span></div>
                    </div> */}
                    <div className="grid-row padding-x-3 margin-bottom-1">
                        {props.reference.component}
                    </div>
                </>
            }
        </div>
    </>)
}

function ObjectTable(props) {
    return (
        <table className="usa-table usa-table--borderless font-ui-2xs font-base margin-y-0" style={{ width: "100%" }}>
            <caption className="text-base-darker" style={{ marginBottom: "0" }}>{props.caption}</caption>
            <thead>
                <tr className="text-base">
                    <th scope="col">Property</th>
                    <th scope="col">Type</th>
                    <th scope="col">Description</th>
                </tr>
            </thead>
            <tbody>
                {props.rows && props.rows.map((row, i) => {
                    return (
                        <tr key={i}>
                            <th key={i + "cell1"} scope="row">{row.property}</th>
                            <td key={i + "cell2"}>
                                {row.type}
                            </td>
                            <td key={i + "cell3"}>{row.description}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    )
}