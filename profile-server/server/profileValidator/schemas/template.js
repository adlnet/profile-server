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
    id: '#Template',
    properties: {
        id: {
            description: 'Required',
            type: 'string',
            format: 'uri',
        },
        type: {
            description: 'Required',
            type: 'string',
            enum: ['StatementTemplate'],
        },
        inScheme: {
            description: 'Required',
            type: 'string',
            format: 'iri',
        },
        prefLabel: {
            description: 'A Language Map of descriptive names for the Statement Template',
            $ref: '#LanguageMap',
        },
        definition: {
            description: 'A Language Map of descriptions of the purpose and usage of the Statement Template',
            $ref: '#LanguageMap',
        },
        deprecated: {
            description: 'A boolean, default false. If true, this Statement Template is deprecated.',
            type: 'boolean',
        },
        verb: {
            description: 'Verb IRI',
            type: 'string',
            format: 'iri',
        },
        objectActivityType: {
            description: 'Object activity type IRI',
            type: 'string',
            format: 'iri',
        },
        contextGroupingActivityType: {
            description: 'Array of contextActivities grouping activity type IRIs',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        contextParentActivityType: {
            description: 'Array of contextActivities parent activity type IRIs',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        contextOtherActivityType: {
            description: 'Array of contextActivities other activity type IRIs',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        contextCategoryActivityType: {
            description: 'Array of contextActivities category activity type IRIs',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        attachmentUsageType: {
            description: 'Array of attachment usage type IRIs',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        objectStatementRefTemplate: {
            description: 'An array of Statement Template identifiers from this Profile version.',
            type: 'array',
            items: {
                type: 'string',
            },
        },
        contextStatementRefTemplate: {
            description: 'An array of Statement Template identifiers from this Profile version.',
            type: 'array',
            items: {
                type: 'string',
            },
        },
        rules: {
            description: 'Array of Statement Template Rules',
            type: 'array',
            items: {
                $ref: '#Rule',
            },
        },

    },
    additionalProperties: false,
    required: ['id', 'type', 'inScheme', 'prefLabel', 'definition'],
    exclusiveProps: ['objectStatementRefTemplate', 'objectActivityType'],
    description: 'A Statement Template describes one way Statements following the Profile may be structured.',
};
