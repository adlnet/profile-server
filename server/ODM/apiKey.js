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
const apiKey = mongoose.Schema({
    uuid: {
        type: String,
        default: uuid.v4,
    },
    scope: {
        type: String,
        enum: ['organization'],
        required: true,
    },
    scopeObject: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'scope',
        required: true,
    },
    description: {
        type: String,
    },
    readPermission: {
        type: Boolean,
        default: false,
    },
    writePermission: {
        type: Boolean,
        default: false,
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

apiKey.statics.deleteByUuid = async function (uuid) {
    const toBeDeleted = await this.findOneAndDelete({ uuid: uuid });

    if (!toBeDeleted) throw new Error('Api Key does not exist.');
};

apiKey.statics.createNew = async function (scope, scopeObject, user, apiKey) {
    if (scopeObject) {
        const org = await this.model('organization').findOne({ uuid: scopeObject.uuid });
        if (!org) throw new Error('Organization does not exist.');
    }

    if (user) {
        const _user = await this.model('user').findOne({ uuid: user.uuid });
        if (!_user) throw new Error('User does not exist.');
    }

    const model = new this({
        scope: scope,
        scopeObject: scopeObject,
        createdBy: user,
        updatedBy: user,
        ...apiKey,
    });
    await model.save();

    return model;
};

apiKey.statics.findByUuid = function (uuid, callback) {
    return this.findOne(mongoSanitize({ uuid: uuid }), callback);
};

module.exports = apiKey;
