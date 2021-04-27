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
const interactionData = {
    type: 'array',
    id: '#InteractionData',
    items: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                chance: {
                    hash: null,
                },
            },
            description: {
                $ref: '#LanguageMap',
            },
        },
        additionalProperties: false,
    },
};
module.exports = interactionData;
