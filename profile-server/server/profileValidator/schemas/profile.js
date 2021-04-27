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
    id: '#Profile',
    properties: {
        id: {
            description: 'The IRI of the Profile overall (not a specific version)',
            type: 'string',
            format: 'iri',
        },
        '@context': {
            description: 'SHOULD be https://w3id.org/xapi/profiles/context and MUST contain this URI if array-valued.',
            oneOf: [
                {
                    type: 'string',
                    enum: ['https://w3id.org/xapi/profiles/context'],
                },
                {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    contains: {
                        type: 'string',
                        enum: ['https://w3id.org/xapi/profiles/context'],
                    },
                },
            ],
        },
        type: {
            description: '',
            type: 'string',
            enum: ['Profile'],
        },
        conformsTo: {
            description: 'Canonical URI of the Profile specification version conformed to. The Profile specification version of this document is https://w3id.org/xapi/profiles#1.0.',
            type: 'string',
            format: 'uri',
        },
        prefLabel: {
            description: 'Language map of names for this Profile.',
            $ref: '#LanguageMap',
        },
        definition: {
            description: 'Language map of descriptions for this Profile. If there are additional rules for the Profile as a whole that cannot be expressed using this specification, include them here, or at the seeAlso URL.',
            $ref: '#LanguageMap',
        },
        seeAlso: {
            description: 'A URL containing information about the Profile. Recommended instead of especially long definitions. When seeAlso is provided definition SHOULD only include a short description of the Profile to aid in discovery and display.',
            type: 'string',
            format: 'url',
        },
        versions: {
            description: 'An array of all Profile version objects for this Profile.',
            type: 'array',
            items: {
                $ref: '#ProfileVersion',
            },
        },
        author: {
            description: 'An Organization or Person.',
            $ref: '#Organization',
        },
        concepts: {
            description: 'An array of Concepts that make up this Profile.',
            type: 'array',
            items: {
                oneOf: [
                    { $ref: '#Concept' },
                    { $ref: '#Extension' },
                    { $ref: '#Document' },
                    { $ref: '#Activity' },
                ],
            },
        },
        templates: {
            description: 'An array of Statement Templates for this Profile.',
            type: 'array',
            items: {
                $ref: '#Template',
            },
        },
        patterns: {
            description: 'An array of Patterns for this Profile.',
            type: 'array',
            items: {
                $ref: '#Pattern',
            },
        },

    },
    additionalProperties: false,
    required: ['id', 'type', 'prefLabel', 'definition', '@context', 'conformsTo', 'versions'],
    description: 'A Profile includes a variety of metadata, both natural language text for humans to understand the Profile, and structured data about versions and who created it. In addition to the metadata, there are properties for describing the Concepts, Statement Templates, and Patterns of the Profile.',
};
