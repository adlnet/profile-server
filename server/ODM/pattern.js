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

const pattern = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuid.v4,
    },
    iri: { type: String, unique: true },
    hasIRI: Boolean,
    primary: {
        type: Boolean,
        default: false,
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
            translationDesc: String,
            translationName: String,
        },
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
    sequence: [
        new mongoose.Schema({
            component: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'sequence.componentType',
            },
            componentType: {
                type: String,
                enum: ['template', 'pattern'],
            },
        }, { _id: false, id: false }),
    ],
    alternates: [
        new mongoose.Schema({
            component: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'alternates.componentType',
            },
            componentType: {
                type: String,
                enum: ['template', 'pattern'],
            },
        }, { _id: false, id: false }),
    ],
    oneOrMore: new mongoose.Schema({
        component: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'oneOrMore.componentType',
        },
        componentType: {
            type: String,
            enum: ['template', 'pattern'],
        },
    }, { _id: false, id: false }),
    zeroOrMore: new mongoose.Schema({
        component: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'zeroOrMore.componentType',
        },
        componentType: {
            type: String,
            enum: ['template', 'pattern'],
        },
    }, { _id: false, id: false }),
    optional: new mongoose.Schema({
        component: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'optional.componentType',
        },
        componentType: {
            type: String,
            enum: ['template', 'pattern'],
        },
    }, { _id: false, id: false }),
}, { toJSON: { virtuals: true } });

pattern.statics.findByUuid = function (uuid, callback) {
    return this.findOne({ uuid: uuid }, callback);
};

pattern.statics.deleteByUuid = async function (uuid) {
    await this.findOneAndUpdate({ uuid: uuid }, { isActive: false });
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
        if (this[typeprop]) p[typeprop] = (await this.populate(`${typeprop}.component`, 'iri').execPopulate())[typeprop].component.iri;
    }

    for (const typeprop of ['alternates', 'sequence']) {
        const vals = (await this.populate(`${typeprop}.component`, 'iri').execPopulate())[typeprop].map(v => v && v.component.iri);
        if (vals && vals.length) p[typeprop] = vals;
    }

    return JSON.parse(JSON.stringify(p));
};

module.exports = pattern;
