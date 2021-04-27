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
const { toLower } = require('lodash');
const validationError = require('../errorTypes/validationError');
const concept = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuid.v4,
    },
    id: String,
    conceptType: {
        type: String,
        enum: [
            'Verb', 'ActivityType', 'AttachmentUsageType', 'Document', 'Extension', 'Activity',
        ],
    },
    iri: { type: String, unique: true },
    createdOn: {
        type: Date,
        default: new Date(),
    },
    updatedOn: {
        type: Date,
        default: new Date(),
    },
    ...locks(),
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
    type: {
        type: String,
        enum: [
            'Verb', 'ActivityType', 'AttachmentUsageType', 'ContextExtension', 'ResultExtension',
            'ActivityExtension', 'StateResource', 'AgentProfileResource', 'ActivityProfileResource',
            'Activity',
        ],
    },
    translations: [
        {
            language: String,
            languageName: String,
            translationDesc: String,
            translationName: String,
        },
    ],
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    moreInformation: {
        type: String,
    },
    activityType: {
        type: String,
    },
    extensions: {
        type: String,
        get: (ext) => {
            if (ext) { return JSON.parse(ext); }
            return ext;
        },
        set: (ext) => JSON.stringify(ext),
    },
    interactionType: {
        type: String,
        enum: [
            'true-false', 'choice', 'fill-in', 'long-fill-in',
            'matching', 'performance', 'sequencing', 'likert',
            'numeric', 'other',
        ],
    },
    correctResponsesPattern: {
        type: [String],
    },
    choices: {
        type: [Object],
    },
    scale: {
        type: [Object],
    },
    source: {
        type: [Object],
    },
    target: {
        type: [Object],
    },
    steps: {
        type: [Object],
    },
    mediaType: {
        type: String,
    },
    contextIri: {
        type: String,
    },
    schemaString: {
        type: String,
    },
    inlineSchema: {
        type: String,
    },
    similarTerms: [
        {
            concept: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'concept',
            },
            relationType: {
                type: String,
                enum: [
                    'related', 'relatedMatch', 'broader', 'broadMatch', 'narrower', 'narrowMatch', 'exactMatch',
                ],
            },
        },
    ],
    recommendedTerms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'concept',
        },
    ],
    deprecatedReason: {
        reason: String,
        reasonLink: String,
    },
    isDeprecated: {
        type: Boolean,
        default: false,
    },
}, { toJSON: { virtuals: true } });

concept.plugin(uniqueValidator);

// concept.virtual('templateCount').get(() => 0);

concept.statics.findByUuid = function (uuid, callback) {
    return this.findOne(mongoSanitize({ uuid: uuid }), callback);
};

concept.statics.deleteByUuid = async function (uuid) {
    await this.findOneAndDelete(mongoSanitize({ uuid: uuid }));
};

concept.statics.buildBaseModelFromDocument = function (document) {
    const JsonLdToModel = require('../controllers/importProfile/JsonLdToModel').JsonLdToModel;
    const jsonLdToModel = new JsonLdToModel();

    const obj = {
        iri: document.id,
        type: document.type,
        isDeprecated: document.deprecated,
    };

    switch (document.type.toLowerCase()) {
        case 'verb':
        case 'activitytype':
        case 'attachmentusagetype':
            obj.conceptType = document.type;
            obj.name = jsonLdToModel.toName(document.prefLabel);
            obj.description = jsonLdToModel.toDescription(document.definition);
            obj.translations = jsonLdToModel.toTranslations(document.prefLabel, document.definition);
            break;
        case 'contextextension':
        case 'resultextension':
        case 'activityextension':
            obj.conceptType = 'Extension';
            obj.name = jsonLdToModel.toName(document.prefLabel);
            obj.description = jsonLdToModel.toDescription(document.definition);
            obj.translations = jsonLdToModel.toTranslations(document.prefLabel, document.definition);
            obj.contextIri = document.context;
            Object.assign(obj, jsonLdToModel.toSchema(document.inlineSchema, document.schema));
            break;
        case 'stateresource':
        case 'agentprofileresource':
        case 'activityprofileresource':
            obj.name = jsonLdToModel.toName(document.prefLabel);
            obj.description = jsonLdToModel.toDescription(document.definition);
            obj.translations = jsonLdToModel.toTranslations(document.prefLabel, document.definition);
            obj.conceptType = 'Document';
            obj.mediaType = document.contentType;
            Object.assign(obj, jsonLdToModel.toSchema(document.inlineSchema, document.schema));
            break;
        case 'activity':
            obj.conceptType = document.type;
            Object.assign(obj, jsonLdToModel.toActivityDefinition(document.activityDefinition));
            break;
        default:
    }

    const model = new this(obj);

    return model;
};

concept.methods.getInteractionComponents = async function () {
    let components;

    if (this.interactionType) {
        components = { interactionType: this.interactionType };
        components.correctResponsesPattern = this.correctResponsesPattern;
        if (components.interactionType === 'choice'
            || components.interactionType === 'sequencing') {
            components.choices = this.choices;
        } else if (components.interactionType === 'likert') {
            components.scale = this.scale;
        } else if (components.interactionType === 'matching') {
            components.source = this.source;
            components.target = this.target;
        } else if (components.interactionType === 'performance') {
            components.steps = this.steps;
        }
    }

    return components;
};

concept.methods.export = async function (currentScheme) {
    const c = {
        id: this.iri,
        type: this.type,
        inScheme: currentScheme,
        prefLabel: langmaps.prefLabel(this.name, this.translations),
        definition: langmaps.definition(this.description, this.translations),
        deprecated: this.isDeprecated ? true : undefined,
    };

    if (this.conceptType === 'Verb'
        || this.conceptType === 'ActivityType'
        || this.conceptType === 'AttachmentUsageType') {
        await this.populate('similarTerms.concept').execPopulate();
        for (const idx in this.similarTerms) {
            if (!c[this.similarTerms[idx].relationType]) c[this.similarTerms[idx].relationType] = [];
            c[this.similarTerms[idx].relationType].push(this.similarTerms[idx].concept.iri);
        }
    } else if (this.conceptType === 'Extension') {
        await this.populate('recommendedTerms').execPopulate();
        c.schema = this.schemaString;
        if (!c.schema) {
            delete c.schema;
            c.inlineSchema = this.inlineSchema;
        }
        c.context = this.contextIri;
        for (const term of this.recommendedTerms) {
            if (this.type === 'ActivityExtension') {
                if (!c.recommendedActivityTypes) c.recommendedActivityTypes = [];
                c.recommendedActivityTypes.push(term.iri);
            } else {
                if (!c.recommendedVerbs) c.recommendedVerbs = [];
                c.recommendedVerbs.push(term.iri);
            }
        }
    } else if (this.conceptType === 'Document') {
        c.contentType = this.mediaType;
        c.context = this.contextIri;
        c.schema = this.schemaString;
        if (!c.schema) {
            delete c.schema;
            c.inlineSchema = this.inlineSchema;
        }
    } else {
        c.activityDefinition = {
            '@context': 'https://w3id.org/xapi/profiles/activity-context',
            name: c.prefLabel,
            description: c.definition,
            type: this.activityType,
            moreInfo: this.moreInformation,
            extensions: this.extensions,
        };
        delete c.prefLabel;
        delete c.definition;
        const interactionComponents = await this.getInteractionComponents();
        c.activityDefinition = Object.assign(c.activityDefinition, interactionComponents);
    }
    return JSON.parse(JSON.stringify(c));
};

module.exports = concept;
