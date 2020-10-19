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
const langmaps = require('../utils/langmaps');
const mongoSanitize = require('mongo-sanitize');
const pattern = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuid.v4,
    },
    iri: { type: String, unique: true },
    hasIRI: Boolean,
    primary: {
        type: Boolean,
        // default: false,
    },
    deprecatedReason: {
        reason: String,
        reasonLink: String,
    },
    isDeprecated: {
        type: Boolean,
        default: false,
    },
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
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    parentProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profileVersion',
    },
    type: {
        type: String,
        enum: ['sequence', 'alternates', 'optional', 'oneOrMore', 'zeroOrMore'],
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
    sequence: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'patternComponent',
        },
    ],
    alternates: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'patternComponent',
        },
    ],
    oneOrMore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patternComponent',
    },
    zeroOrMore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patternComponent',
    },
    optional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patternComponent',
    },
}, { toJSON: { virtuals: true } });

pattern.plugin(uniqueValidator);

pattern.statics.findByUuid = function (uuid, callback) {
    return this.findOne(mongoSanitize({ uuid: uuid }), callback);
};

pattern.statics.deleteByUuid = async function (uuid) {
    await this.findOneAndDelete(mongoSanitize({ uuid: uuid }));
};

pattern.statics.buildBaseModelFromDocument = function (document) {
    const JsonLdToModel = require('../controllers/importProfile/JsonLdToModel').JsonLdToModel;
    const jsonLdToModel = new JsonLdToModel();

    const model = this({
        iri: document.id,
        name: jsonLdToModel.toName(document.prefLabel),
        description: jsonLdToModel.toDescription(document.definition),
        translations: jsonLdToModel.toTranslations(document.prefLabel, document.definition, { definition: true }),
        isDeprecated: document.deprecated,
        primary: document.primary,
        type: jsonLdToModel.toPatternType(document),
    });

    return model;
};

pattern.methods.export = async function (profileVersionIRI) {
    const p = {
        id: this.iri,
        type: 'Pattern',
        primary: this.primary,
        inScheme: profileVersionIRI,
        prefLabel: langmaps.prefLabel(this.name, this.translations),
        definition: langmaps.definition(this.description, this.translations),
        deprecated: this.isDeprecated ? true : undefined,
    };

    for (const typeprop of ['optional', 'oneOrMore', 'zeroOrMore']) {
        if (this[typeprop]) {
            if (!this.populated(typeprop)) {
                p[typeprop] = (await this.populate({
                    path: `${typeprop}`,
                    populate: { path: 'component', select: 'iri' },
                }).execPopulate())[typeprop].component.iri;
            } else {
                p[typeprop] = this[typeprop].component.iri;
            }
        }
    }

    for (const typeprop of ['alternates', 'sequence']) {
        let vals;
        if (!this.populated(typeprop)) {
            vals = (await this.populate({
                path: `${typeprop}`,
                populate: { path: 'component', select: 'iri' },
            }).execPopulate())[typeprop].map(v => v && v.component.iri);
        } else {
            vals = this[typeprop].map(v => v && v.component.iri);
        }
        if (vals && vals.length) p[typeprop] = vals;
    }

    return JSON.parse(JSON.stringify(p));
};

module.exports = pattern;
