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
const uuid = require('uuid');
const mongoSanitize = require('mongo-sanitize');
const Hook = mongoose.Schema({
    uuid: {
        type: String,
        default: uuid.v4,
    },
    event: {
        type: String,
        enum: ['profilePublished', 'profileCreated'], // Add other events here
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    signatureMethod: {
        type: String,
        enum: ['sha1', 'sha256', 'none'],
        required: true,
    },
    clientSecret: {
        type: String,
        required: false,
    },
    target: {
        type: String,
        format: 'url',
        required: true,
    },
    description: {
        type: String,
    },
    isEnabled: {
        type: Boolean,
        default: true,
    },
    createdOn: {
        type: Date,
        default: new Date(),
    },
    updatedOn: {
        type: Date,
        default: new Date(),
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
});

module.exports = Hook;
