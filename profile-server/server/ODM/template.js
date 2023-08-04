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
            languageName: String,
            translationDesc: String,
            translationName: String,
        },
    ],
    tags: [String],
    statementExample: String,
    deprecatedReason: {
        reason: String,
        reasonLink: String,
    },
    isDeprecated: {
        type: Boolean,
        default: false,
    },
}, { toJSON: { virtuals: true } });

template.plugin(uniqueValidator);

template.statics.findByUuid = function (uuid, callback) {
    return this.findOne(mongoSanitize({ uuid: uuid }), callback);
};

template.statics.deleteByUuid = async function (uuid) {
    await this.findOneAndDelete(mongoSanitize({ uuid: uuid }));
};

template.statics.buildBaseModelFromDocument = function (document) {
    const JsonLdToModel = require('../controllers/importProfile/JsonLdToModel').JsonLdToModel;
    const jsonLdToModel = new JsonLdToModel();

    const model = this({
        iri: document.id,
        name: jsonLdToModel.toName(document.prefLabel),
        description: jsonLdToModel.toDescription(document.definition),
        translations: jsonLdToModel.toTranslations(document.prefLabel, document.definition),
        isDeprecated: document.deprecated,
        rules: document.rules,
    });

    return model;
};

template.virtual('concepts', { localField: 'id', foreignField: '_id' }).get(function () {
    const propertyTypes = [
        'verb', 'objectActivityType', 'contextCategoryActivityType', 'contextGroupingActivityType',
        'contextOtherActivityType', 'contextParentActivityType', 'attachmentUsageType',
    ];

    // make sure there are no dups.. have to do this because the === comparison of the same objects wasn't working
    const concepts = propertyTypes.map(prop => this[prop]).filter(p => p).flat(Infinity).reduce((p, obj) => {
        if (!p.find(e => e._id.toString() === obj._id.toString())) p.push(obj);
        return p;
    }, []);

    return concepts;
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
        let populatedObject = await this.populate('objectActivityType', 'iri').execPopulate();
        let populatedActivityType = populatedObject.objectActivityType;

        try {
            t.objectActivityType = populatedActivityType.iri;
        }
        catch (err) {
            console.prodLog("Could not locate IRI for Template.");
            console.prodLog("Searched for this.objectActivityType with", this.objectActivityType);
            t.objectActivityType = "error:not-found";
        }

    } else if (this.objectStatementRefTemplate && this.objectStatementRefTemplate.length) {
        let populatedObject = await this.populate('objectStatementRefTemplate', 'iri').execPopulate();
        let templateIRIs = populatedObject.objectStatementRefTemplate.map(v => v.iri);

        t.objectStatementRefTemplate = templateIRIs;
    }

    for (const typeprop of ['contextStatementRefTemplate', 'contextGroupingActivityType', 'contextParentActivityType', 'contextOtherActivityType', 'contextCategoryActivityType', 'attachmentUsageType']) {
        const type = (await this.populate(typeprop, 'iri').execPopulate())[typeprop];
        if (type) {
            const vals = (await this.populate(typeprop, 'iri').execPopulate())[typeprop].map(v => v.iri);
            if (vals && vals.length) t[typeprop] = vals;
        }
    }

    if (this.rules && this.rules.length) {
        t.rules = this.rules.map(v => {
            const ret = {
                location: v.location,
                selector: v.selector,
                presence: v.presence,
                scopeNote: v.scopeNote,
            };
            
            if (v.any && v.any.length) ret.any = v.any;
            if (v.all && v.all.length) ret.all = v.all;
            if (v.none && v.none.length) ret.none = v.none;
            
            return ret;
        });
    }
    return JSON.parse(JSON.stringify(t));
};

module.exports = template;
