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
const definition = {
    id: '#Definition',
    type: 'object',
    dependencies: {
        correctResponsesPattern: ['interactionType'],
        choices: ['interactionType'],
        source: ['interactionType'],
        target: ['interactionType'],
        steps: ['interactionType'],
        scale: ['interactionType'],
    },
    properties: {
        name: {
            $ref: '#LanguageMap',
        },
        description: {
            $ref: '#LanguageMap',
        },
        type: {
            type: 'string',
            format: 'uri',
        },
        moreInfo: {
            type: 'string',
            format: 'uri',
        },
        extensions: {
            type: 'object',
        },
        interactionType: {
            type: 'string',
            enum: ['true-false', 'choice', 'fill-in', 'long-fill-in', 'likert', 'matching', 'performance', 'sequencing', 'numeric', 'other'],
        },
        correctResponsesPattern: {
            type: 'array',
            items: {
                type: 'string',
                chance: {
                    word: null,
                },
            },
        },
        choices: {
            $ref: '#InteractionData',
        },
        steps: {
            $ref: '#InteractionData',
        },
        target: {
            $ref: '#InteractionData',
        },
        source: {
            $ref: '#InteractionData',
        },
        scale: {
            $ref: '#InteractionData',
        },
        '@context': {
            description: 'SHOULD be https://w3id.org/xapi/profiles/activity-context and MUST contain this URI if array-valued.',
            oneOf: [
                {
                    type: 'string',
                    enum: ['https://w3id.org/xapi/profiles/activity-context'],
                },
                {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    contains: {
                        type: 'string',
                        enum: ['https://w3id.org/xapi/profiles/activity-context'],
                    },
                },
            ],
        },
    },
    additionalProperties: false,
    description: 'Except for @context, the activityDefinition in this Concept MUST be a legal xAPI Activity Definition.',
};
module.exports = definition;
