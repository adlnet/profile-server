/* eslint-disable notice/notice */
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
module.exports = {
    type: 'object',
    id: '#Document',
    properties: {
        id: {
            description: 'The IRI of the document resource, used as the stateId/profileId in xAPI',
            type: 'string',
            format: 'iri',
        },
        type: {
            description: '	One of: StateResource, AgentProfileResource, ActivityProfileResource',
            type: 'string',
            enum: ['StateResource', 'AgentProfileResource', 'ActivityProfileResource'],
        },
        inScheme: {
            description: 'The IRI of the specific Profile version currently being described',
            type: 'string',
            format: 'iri',
        },
        prefLabel: {
            description: 'A Language Map of descriptive names for the document resource',
            $ref: '#LanguageMap',
        },
        definition: {
            description: 'A Language Map of descriptions of the purpose and usage of the document resource',
            $ref: '#LanguageMap',
        },
        contentType: {
            description: 'The media type for the resource, as described in RFC 2046 (e.g. application/json). MUST use the contentType given in the Content-Type header, including any parameters as given.',
            type: 'string',
        },
        deprecated: {
            description: 'A boolean. If true, this Concept is deprecated.',
            type: 'boolean',
        },
        context: {
            description: 'The IRI of a JSON-LD context for this document resource.',
            type: 'string',
            format: 'iri',
        },
        schema: {
            description: 'the IRI for accessing a JSON Schema for this document resource.',
            type: 'string',
            format: 'iri',
        },
        inlineSchema: {
            description: '	An alternate way to include a JSON Schema, as a string.',
            oneOf: [
                { $ref: 'http://json-schema.org/draft-07/schema#' },
                {
                    type: 'string',
                    format: 'jsonschema',
                },
            ],
        },
    },
    additionalProperties: false,
    description: 'an extension',
    required: ['id', 'type', 'inScheme', 'prefLabel', 'definition'],
    exclusiveProps: ['schema', 'inlineSchema'],
};




