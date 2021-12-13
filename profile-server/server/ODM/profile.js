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
const uniqueValidator = require('mongoose-unique-validator');
const uuid = require('uuid');
const locks = require('./locks');
const createAPIURL = require('../utils/createAPIURL');
const mongoSanitize = require('mongo-sanitize');
const profile = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
    },
    uuid: {
        type: String,
        default: uuid.v4,
    },
    iri: { type: String, unique: true },
    createdOn: {
        type: Date,
        default: new Date(),
    },
    ...locks(),
    updatedOn: {
        type: Date,
        default: new Date(),
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    currentPublishedVersion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profileVersion',
    },
    currentDraftVersion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profileVersion',
    },
    state: {
        type: String,
        default: 'draft',
    },
    orphanContainer: {
        type: Boolean,
        default: false
    }
}, { toJSON: { virtuals: true } });

profile.plugin(uniqueValidator);

profile.virtual('versions', {
    ref: 'profileVersion',
    localField: '_id',
    foreignField: 'parentProfile',
    justOne: false,
});

profile.virtual('url').get(function () { return createAPIURL.profile(this.uuid); });

profile.statics.findByUuid = function (uuid, callback) {
    return this.findOne({ uuid: uuid }, callback);
};

module.exports = profile;
