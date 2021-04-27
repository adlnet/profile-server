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
    id: '#Activity',
    properties: {
        id: {
            description: 'The IRI of the activity',
            type: 'string',
            format: 'iri',
        },
        type: {
            description: 'Activity',
            type: 'string',
            enum: ['Activity'],
        },
        inScheme: {
            description: 'The IRI of the specific Profile version currently being described',
            type: 'string',
            format: 'iri',
        },
        deprecated: {
            description: 'A boolean. If true, this Concept is deprecated.',
            type: 'boolean',
        },
        activityDefinition: {
            description: 'An Activity Definition as in xAPI, plus a @context, as in the table below.',
            $ref: '#Definition',
        },

    },
    additionalProperties: false,
    description: "These Concepts are just literal xAPI Activity definitions the Profile wants to provide for use. This is the Profile's canonical version of the Activity.",
    required: ['id', 'type', 'inScheme', 'activityDefinition'],
};




