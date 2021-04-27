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
    id: '#Pattern',
    primaryPatternRule: true,
    requiresOneOf: ['alternates', 'optional', 'oneOrMore', 'sequence', 'zeroOrMore'],
    properties: {
        id: {
            description: 'A URI for the Statement Template.',
            type: 'string',
            format: 'iri',
        },
        type: {
            type: 'string',
            enum: ['Pattern'],
        },
        primary: {
            description: 'Default false. Only primary Patterns are checked for matching sequences of Statements.',
            type: 'boolean',
        },
        inScheme: {
            description: 'The IRI of the specific Profile version currently being described',
            type: 'string',
            format: 'iri',
        },
        prefLabel: {
            description: 'A Language Map of descriptive names for the Pattern',
            $ref: '#LanguageMap',
        },
        definition: {
            description: 'A Language Map of descriptions of the purpose and usage of the Pattern',
            $ref: '#LanguageMap',
        },
        deprecated: {
            description: 'A boolean. If true, this Pattern is deprecated.',
            type: 'boolean',
        },
        alternates: {
            description: 'An array of Pattern or Statement Template identifiers. An alternates Pattern matches if any member of the array matches',
            type: 'array',
            minLength: 2,
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        optional: {
            description: 'A single Pattern or Statement Template identifier. An optional Pattern matches if the identified thing matches once, or is not present at all',
            type: 'string',
            format: 'iri',
        },
        oneOrMore: {
            description: 'A single Pattern or Statement Template identifier. A oneOrMore Pattern matches if the identified thing matches once, or any number of times more than once',
            type: 'string',
            format: 'iri',
        },
        zeroOrMore: {
            description: 'A single Pattern or Statement Template identifier. A zeroOrMore Pattern matches if the identified thing is not present or is present one or more times',
            type: 'string',
            format: 'iri',
        },
        sequence: {
            description: 'An array of Pattern or Statement Template identifiers. A sequence Pattern matches if the identified things match in the order specified.',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },

    },
    additionalProperties: false,
    required: ['id', 'type'],
    description: 'Patterns describe groups of Statements matching particular Statement Templates, ordered in certain ways. For example, a Pattern in a video Profile might start with a Statement about playing a video and then be followed by Statements about pausing, skipping, playing again, and so forth.',
};
