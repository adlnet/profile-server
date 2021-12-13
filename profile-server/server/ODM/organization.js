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
const mongoSanitize = require('mongo-sanitize');
const organization = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
    },
    description: String,
    collaborationLink: String,
    uuid: {
        type: String,
        default: uuid.v4,
    },
    members: [
        {
            level: String,
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
        },
    ],
    memberRequests: [
        {
            requestedOn: {
                type: Date,
                default: new Date(),
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
        },
    ],
    ...locks(),
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
    orphanContainer: {
        type: Boolean,
        default: false
    }
}, { toJSON: { virtuals: true } });

organization.plugin(uniqueValidator);

organization.virtual('profiles', {
    ref: 'profile',
    localField: '_id',
    foreignField: 'organization',
    justOne: false,
});

organization.virtual('apiKeys', {
    ref: 'apiKey',
    localField: '_id',
    foreignField: 'scopeObject',
    justOne: false,
    match: {
        scope: 'organization',
    },
});

organization.statics.findByUuid = function (uuid, callback) {
    return this.findOne(mongoSanitize({ uuid: uuid }), callback);
};

organization.statics.deleteByUuid = async function (uuid) {
    await this.findOneAndDelete(mongoSanitize({ uuid: uuid }));
};

module.exports = organization;
