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
    id: '#Concept',
    properties: {
        id: {
            description: 'The IRI of this Concept',
            type: 'string',
            format: 'iri',
        },
        type: {
            description: 'Verb, ActivityType, or AttachmentUsageType',
            type: 'string',
            enum: ['Verb', 'ActivityType', 'AttachmentUsageType'],
        },
        inScheme: {
            description: 'The IRI of the specific Profile version currently being described',
            type: 'string',
            format: 'iri',
        },
        prefLabel: {
            description: 'A Language Map of the preferred names in each language',
            $ref: '#LanguageMap',
        },
        definition: {
            description: 'A Language Map of the precise definition, including how to use the Concept properly in Statements',
            $ref: '#LanguageMap',
        },
        deprecated: {
            description: 'A boolean. If true, this Concept is deprecated.',
            type: 'boolean',
        },
        broader: {
            description: 'An array of IRIs of Concepts of the same type from this Profile version that have a broader meaning.',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        broadMatch: {
            description: 'An array of IRIs of Concepts of the same type from a different Profile that have a broader meaning.',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        narrower: {
            description: 'An array of IRIs of Concepts of the same type from this Profile version that have a narrower meaning.',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        narrowMatch: {
            description: 'An array of IRIs of Concepts of the same type from different Profiles that have narrower meanings.',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        related: {
            description: "An array of IRIs of Concepts of the same type from this Profile version that are close to this Concept's meaning. related MUST only be used on Concepts that are deprecated to indicate possible replacement Concepts in the same Profile, if there are any.",
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        relatedMatch: {
            description: 'An array of IRIs of Concepts of the same type from a different Profile or a different version of the same Profile that has a related meaning that is not clearly narrower or broader. Useful to establish conceptual links between Profiles that can be used for discovery.',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        exactMatch: {
            description: 'An array of IRIs of Concepts of the same type from a different Profile or a different version of the same Profile that have exactly the same meaning. SHOULD be used rarely, mostly to describe connections to vocabularies that are no longer managed and do not use good URLs. SHOULD be used to connect possible replacement Concepts to removed Concepts from previous versions of the same Profile, and for possible replacement Concepts in other Profiles of deprecated Concepts, as well as other loose relations.',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
    },
    additionalProperties: false,
    description: "Concepts are building blocks for use and reuse in xAPI data and other Profiles. In the case of Verbs, Activity Types, Attachment Usage Types, and Activities, the Concept is 'the thing', and when you use that Concept in xAPI you're using it directly. In the case of Document Resources and Extensions, the Concept is 'the shape of the thing' that the identifier can be used to point at, and will be used with many different values xAPI data.",
    required: ['id', 'type', 'inScheme', 'prefLabel', 'definition'],
};
