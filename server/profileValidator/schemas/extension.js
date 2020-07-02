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
    id: '#Extension',
    properties: {
        id: {
            description: 'The IRI of the extension, used as the extension key in xAPI',
            type: 'string',
            format: 'iri',
        },
        type: {
            description: 'ContextExtension, ResultExtension, or ActivityExtension',
            type: 'string',
            enum: ['ContextExtension', 'ResultExtension', 'ActivityExtension'],
        },
        inScheme: {
            description: 'The IRI of the specific Profile version currently being described	',
            type: 'string',
            format: 'iri',
        },
        prefLabel: {
            description: 'A Language Map of descriptive names for the extension',
            $ref: '#LanguageMap',
        },
        definition: {
            description: 'A Language Map of descriptions of the purpose and usage of the extension',
            $ref: '#LanguageMap',
        },
        deprecated: {
            description: 'A boolean. If true, this Concept is deprecated.',
            type: 'boolean',
        },
        recommendedActivityTypes: {
            description: 'Only allowed on an ActivityExtension. An array of activity type URIs that this extension is recommended for use with (extending to narrower of the same).',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        recommendedVerbs: {
            description: '	Only allowed on a ContextExtension or a ResultExtension. An array of verb URIs that this extension is recommended for use with (extending to narrower of the same).',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        context: {
            description: 'the IRI of a JSON-LD context for this extension',
            type: 'string',
            format: 'iri',
        },
        schema: {
            description: 'the IRI for accessing a JSON Schema for this extension. The JSON Schema can be used to constrain the extension to a single type.',
            type: 'string',
            format: 'iri',
        },
        inlineSchema: {
            description: 'An alternate way to include a JSON Schema, as a string.',
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
    description: 'This extension includes a JSON Schema that systems handling Statements with it can use to validate the structure of extension values. Also, it recommends a verb to use it with. While it only mentions the placed verb, if the medaled verb is defined as given above, it is narrower than placed and is recommended as well.',
    required: ['id', 'type', 'inScheme', 'prefLabel', 'definition'],
    exclusiveProps: ['schema', 'inlineSchema'],
};




