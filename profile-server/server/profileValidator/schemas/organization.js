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
    id: '#Organization',
    properties: {
        type: {
            description: 'Organization or Person',
            type: 'string',
            enum: ['Organization', 'Person'],
        },
        name: {
            description: 'A string with the name of the organization or person',
            type: 'string',
        },
        url: {
            description: 'A URL for the Person or Group.',
            type: 'string',
            format: 'url',
        },
    },
    required: ['type', 'name'],
    description: 'Use one of these in the author property to indicate the author of this Profile version.',
};
