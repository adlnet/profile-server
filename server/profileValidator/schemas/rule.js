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
    id: '#Rule',
    properties: {
        location: {
            type: 'string',
            description: 'A JSONPath string. This is evaluated on a Statement to find the evaluated values to apply the requirements in this rule to. All evaluated values from location are matchable values.',
        },
        selector: {
            type: 'string',
            description: 'A JSONPath string. If specified, this JSONPath is evaluated on each member of the evaluated values resulting from the location selector, and the resulting values become the evaluated values instead. If it returns nothing on a location, that represents an unmatchable value for that location, meaning all will fail, as will a presence of included. All other values returned are matchable values.',
        },
        presence: {
            description: 'included, excluded, or recommended.',
            type: 'string',
            enum: ['included', 'excluded', 'recommended'],
        },
        scopeNote: {
            description: '	A Language Map describing usage details for the parts of Statements addressed by this rule. For example, a Profile with a rule requiring result.duration might provide guidance on how to calculate it.',
            $ref: '#LanguageMap',
        },
        any: {
            description: 'An array of values that needs to intersect with the matchable values.',
            type: 'array',
        },
        all: {
            description: 'An array of values which all the evaluated values need to be from.',
            type: 'array',
        },
        none: {
            description: "An array of values that can't be in the matchable values.",
            type: 'array',
        },
    },
    additionalProperties: false,
    required: ['location'],
    requiresAtLeastOne: ['presence', 'any', 'all', 'none'],
    description: 'Statement Template Rules describe a location or locations within Statements using JSONPath, then describe the restrictions on the value(s) there, such as inclusion, exclusion, or specific values allowed or disallowed.',
};
