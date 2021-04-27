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
    id: '#ProfileVersion',
    properties: {
        id: {
            description: 'The IRI of the version ID',
            type: 'string',
            format: 'iri',
        },
        wasRevisionOf: {
            description: 'An array, usually of length one, of IRIs of all Profile versions this version was written as a revision of. MUST be used with all versions that succeed other Profile versions. may sometimes contain multiple Profile versions to support the scenario where a Profile subsumes another. In this case, a new Profile version would be defined with the two (or more) contributing Profiles listed within the wasRevisionOf array.',
            type: 'array',
            items: {
                type: 'string',
                format: 'iri',
            },
        },
        generatedAtTime: {
            description: 'The date this version was created on',
            type: 'string',
            format: 'datetime',
        },
    },
    additionalProperties: false,
    required: ['id', 'generatedAtTime'],
    description: 'Profile version objects make it convenient to track version history for Profiles, following recommendations for SKOS concept schemes and PROV version tracking generally. By using versions this way, it is possible to answer precise questions such as “what version of this Profile was current on the 3rd of January last year?”. Lack of robust versioning is frequently identified as an issue with RDF data.',
};
