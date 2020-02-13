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
const mongoose = require('mongoose');
const concept = new mongoose.Schema({
    uuid: String,
    id: String,
    iri: String,
    hasIri: Boolean,
    updatedOn: Date,
    createdOn: Date,
    createdBy: String,
    parentProfile: {
        uuid: String,
        name: String,
    },
    type: {
        type: String,
        enum: ['verb', 'activityType', 'attachmentUsage', 'document', 'extension', 'activity'],
    },
    translations: [
        {
            language: String,
            translationDesc: String,
            translationName: String,
        },
    ],
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    moreInfo: {
        type: String,
    },
    activityType: {
        type: String,
    },
    documentResourceType: {
        type: String,
    },
    mediaType: {
        type: String,
    },
    contextIri: {
        type: String,
    },
    extensionType: String,
    _schema: {
        type: {
            type: String,
        },
        iri: String,
        string: String,
    },
});

module.exports = concept;
