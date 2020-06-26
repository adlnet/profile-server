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
const locks = require('./locks');
const profileVersion = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuid.v4,
    },
    iri: {
        type: String,
        unique: true,
    },
    parentProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profile',
    },
    ...locks(),
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    moreInformation: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
    },
    tags: [String],
    translations: [
        {
            language: String,
            translationDesc: String,
            translationName: String,
        },
    ],
    concepts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'concept',
        },
    ],
    externalConcepts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'concept',
        },
    ],
    templates: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'template',
        },
    ],
    patterns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'pattern',
        },
    ],
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
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    wasRevisionOf: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'profileVersion',
        },
    ],
    version: {
        type: Number,
        default: 1,
    },
    state: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { toJSON: { virtuals: true } });

profileVersion.statics.findByUuid = function (uuid, callback) {
    return this.findOne({ uuid: uuid }, callback);
};

profileVersion.methods.publish = async function (user) {
    if (this.state !== 'draft') return;
    this.state = 'published';

    const parent = (await this.populate('parentProfile').execPopulate()).parentProfile;
    parent.currentDraftVersion = null;
    parent.currentPublishedVersion = this._id;
    parent.updatedOn = new Date();
    // parent.updatedBy = user._id;
    await parent.save();

    return this.save();
};

module.exports = profileVersion;
