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
const langmaps = require('../utils/langmaps');

const template = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuid.v4,
    },
    iri: { type: String, unique: true },
    name: {
        type: String,
    },
    ...locks(),
    description: {
        type: String,
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
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    parentProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profileVersion',
    },
    verb: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'concept',
    },
    objectActivityType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'concept',
    },
    contextGroupingActivityType: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'concept',
        },
    ],
    contextParentActivityType: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'concept',
        },
    ],
    contextOtherActivityType: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'concept',
        },
    ],
    contextCategoryActivityType: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'concept',
        },
    ],
    attachmentUsageType: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'concept',
        },
    ],
    objectStatementRefTemplate: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'template',
        },
    ],
    contextStatementRefTemplate: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'template',
        },
    ],
    rules: [
        {
            location: {
                type: String,
                required: true,
            },
            selector: String,
            presence: {
                type: String,
                enum: ['included', 'excluded', 'recommended'],
            },
            any: [],
            all: [],
            none: [],
            scopeNote: {},
        },
    ],
    translations: [
        {
            language: String,
            translationDesc: String,
            translationName: String,
        },
    ],
    tags: [String],
    statementExample: String,
    isDeprecated: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { toJSON: { virtuals: true } });

template.statics.findByUuid = function (uuid, callback) {
    return this.findOne({ uuid: uuid }, callback);
};

template.statics.deleteByUuid = async function (uuid) {
    await this.findOneAndUpdate({ uuid: uuid }, { isActive: false });
};

template.virtual('concepts').get(function () {
    const propertyTypes = [
        'verb', 'objectActivityType', 'contextCategoryActivityType', 'contextGroupingActivityType',
        'contextOtherActivityType', 'contextParentActivityType', 'attachmentUsageType',
    ];

    const concepts = propertyTypes.map(prop => this[prop]).filter(p => p).flat(Infinity);
    const conceptUuids = [...new Set(concepts.map(c => c.uuid))];
    return conceptUuids.map(c => concepts.find(d => d.uuid === c));
});

template.methods.export = async function (profileVersionIRI) {
    const t = {
        id: this.iri,
        type: 'StatementTemplate',
        inScheme: profileVersionIRI,
        prefLabel: langmaps.prefLabel(this.name, this.translations),
        definition: langmaps.definition(this.description, this.translations),
        deprecated: this.isDeprecated ? true : undefined,
        verb: this.verb ? (await this.populate('verb', 'iri').execPopulate()).verb.iri : undefined,
    };

    // can't have both objectActivityType and objectStatementRefTemplate
    if (this.objectActivityType) {
        t.objectActivityType = (await this.populate('objectActivityType', 'iri').execPopulate()).objectActivityType.iri;
    } else if (this.objectStatementRefTemplate) {
        t.objectStatementRefTemplate = (await this.populate('objectStatementRefTemplate', 'iri').execPopulate()).objectStatementRefTemplate.map(v => v.iri);
    }

    for (const typeprop of ['contextStatementRefTemplate', 'contextGroupingActivityType', 'contextParentActivityType', 'contextOtherActivityType', 'contextCategoryActivityType', 'attachmentUsageType']) {
        const vals = (await this.populate(typeprop, 'iri').execPopulate())[typeprop].map(v => v.iri);
        if (vals && vals.length) t[typeprop] = vals;
    }

    if (this.rules && this.rules.length) t.rules = this.rules;
    return JSON.parse(JSON.stringify(t));
};

module.exports = template;
