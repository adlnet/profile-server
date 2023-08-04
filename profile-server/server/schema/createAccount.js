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
    title: 'createAccount',
    type: 'object',
    properties: {
        username: {
            type: 'string',
            pattern: "^[a-zA-Z0-9]([\-_]*[a-zA-Z0-9])*$",
            customError: "The username must be between 4 and 24 characters.  Hyphens and underscores are allowed, but not as the first or last characters.",
            minLength: 4,
            maxLength: 24,
        },
        email: {
            type: 'string',
            pattern: "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
            customError: "Email format looks incorrect."
        },
        password: {
            type: 'string',
            minLength: 4,
            maxLength: 64,
        },
        password2: {
            type: 'string',
            minLength: 4,
            maxLength: 64,
        },
        disclaimer: {
            type: 'string',
        },
        passwordMatch:
        {
            type: 'string',
        },
        firstname:
        {
            type: 'string',
        },
        lastname:
        {
            type: 'string',
        },
        publicizeName:
        {
            type: 'boolean',
        },
    },
    additionalProperties: false,
    required: ['email', 'password'],
};
