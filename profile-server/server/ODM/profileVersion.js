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
const checkIRI = require("../utils/checkIRI");
const createAPIURL = require('../utils/createAPIURL');
const mongoSanitize = require('mongo-sanitize');
const errors = require('../errorTypes/errors');

const profileVersion = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuid.v4,
    },
    iri: {
        type: String,
        unique: true,
        index: true,
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
    moreInformation: {
        type: String,
        validate: {
            validator: function(value) {
                let valueIsEmpty = value == "";
                let valueIsIRI = checkIRI(value);

                return valueIsEmpty || valueIsIRI;
            }
        }
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
    },
    tags: [String],
    translations: [
        {
            language: String,
            languageName: String,
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
    verificationDenyReason: String,
    verificationRequest: {
        type: Date,
    },
    verificationRequestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    isShallowVersion: {
        type: Boolean,
        default: false,
    },
}, { toJSON: { virtuals: true } });

profileVersion.plugin(uniqueValidator);

profileVersion.virtual('harvestDatas', {
    ref: 'harvestData',
    localField: '_id',
    foreignField: 'parentProfile',
    justOne: false,
});

profileVersion.virtual('url')
    .get(function () { return createAPIURL.profile(this.uuid); });

profileVersion.statics.findByUuid = function (uuid, callback) {
    return this.findOne(mongoSanitize({ uuid: uuid }), callback);
};

profileVersion.methods.deleteDraft = async function () {
    const concept = require('./concept');
    const template = require('./template');
    const pattern = require('./pattern');
    if (this.state !== 'draft') throw new errors.notAllowedError('Not Allowed: Only drafts can be deleted.');
    await mongoose.model('concept', concept).deleteMany({ parentProfile: this._id });
    await mongoose.model('template', template).deleteMany({ parentProfile: this._id });
    await mongoose.model('pattern', pattern).deleteMany({ parentProfile: this._id });
    const profParent = (await this.populate('parentProfile').execPopulate()).parentProfile;
    profParent.currentDraftVersion = null;
    await profParent.save();
    await mongoose.model('profileVersion', profileVersion).findByIdAndDelete(this._id);
};

profileVersion.methods.publish = async function (user, parentiri) {
    if (this.state !== 'draft') throw new errors.notAllowedError('Not Allowed: Only drafts can be published.');
    const updated = new Date();
    this.state = 'published';
    this.updatedOn = updated;
    if (user) this.updatedBy = user._id;

    const parent = (await this.populate('parentProfile').execPopulate()).parentProfile;
    if (parentiri && this.version === 1) {
        if (this.iri.startsWith(parent.iri)) this.iri = this.iri.replace(parent.iri, parentiri);

        await this.populate('concepts').populate('templates').populate('patterns').execPopulate();

        this.concepts.forEach(doc => {
            doc.iri = doc.iri.replace(parent.iri, parentiri);
            doc.save();
        });
        this.templates.forEach(doc => {
            doc.iri = doc.iri.replace(parent.iri, parentiri);
            doc.save();
        });
        this.patterns.forEach(doc => {
            doc.iri = doc.iri.replace(parent.iri, parentiri);
            doc.save();
        });

        parent.iri = parentiri;
    }
    parent.currentDraftVersion = null;
    parent.currentPublishedVersion = this._id;
    parent.updatedOn = updated;
    if (user) parent.updatedBy = user._id;
    await parent.save();

    return this.save();
};

profileVersion.methods.getMetadata = async function () {
    const parent = (await this.populate('parentProfile').execPopulate()).parentProfile;
    const org = (await this.populate({ path: 'organization', select: 'name collaborationLink uuid' }).execPopulate()).organization;
    return {
        profile_url: parent.url,
        profile_id: parent.iri,
        version_url: this.url,
        version_id: this.iri,
        version_uuid: this.uuid,
        name: this.name,
        version: this.version,
        template_count: this.templates.length,
        concept_count: this.concepts.length,
        pattern_count: this.patterns.length,
        updated: this.updatedOn,
        working_group: {
            name: this.organization.name,
            url: this.organization.collaborationLink,
            uuid: this.organization.uuid,
        },
        status: {
            published: this.state === 'published',
            verified: this.isVerified,
            verificationRequest: this.verificationRequest,
        },
    };
};

module.exports = profileVersion;
