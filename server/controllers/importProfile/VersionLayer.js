const { version } = require('mongoose');

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
const ProfileComponentLayer = require('./ProfileComponentLayer').ProfileComponentLayer;
const ProfileVersionModel = require('../../ODM/models').profileVersion;
const JsonLdToModel = require('./JsonLdToModel').JsonLdToModel;
const ConceptLayerFactory = require('./ConceptLayerFactory').ConceptLayerFactory;
const TemplateLayer = require('./TemplateLayer').TemplateLayer;
const PatternLayer = require('./PatternLayer').PatternLayer;
const { conflictError } = require('../../errorTypes/errors');

exports.VersionLayer = function (profileLayer) {
    const jsonLdToModel = new JsonLdToModel();
    const versionDocument = profileLayer.versionDocument;
    const model = new ProfileVersionModel({
        organization: profileLayer.profileModel.organization,
        parentProfile: profileLayer.profileModel,
        iri: versionDocument.versions[0].id,
        name: jsonLdToModel.toName(versionDocument.prefLabel),
        description: jsonLdToModel.toDescription(versionDocument.definition),
        translations: jsonLdToModel.toTranslations(versionDocument.prefLabel, versionDocument.definition),
        moreInformation: versionDocument.seeAlso,
        state: 'published',
    });
    const conceptDocuments = versionDocument.concepts || [];
    const templateDocuments = versionDocument.templates || [];
    const patternDocuments = versionDocument.patterns || [];

    return {
        scanVersionLayer: async function () {
            const exists = await ProfileVersionModel.findOne({ iri: versionDocument.versions[0].id });
            if (exists) {
                throw new conflictError(`Profile version ${versionDocument.versions[0].id} already exists.`);
            }

            const conceptLayers = conceptDocuments.map(
                c => ConceptLayerFactory({ parentProfile: model, conceptDocument: c }),
            );
            const templateLayers = templateDocuments.map(
                t => new TemplateLayer({ parentProfile: model, templateDocument: t }),
            );
            const patternLayers = patternDocuments.map(
                p => new PatternLayer({ parentProfile: model, patternDocument: p }),
            );

            return new ProfileComponentLayer({
                conceptLayers: conceptLayers,
                templateLayers: templateLayers,
                patternLayers: patternLayers,
                save: async function (concepts, templates, patterns) {
                    model.concepts = concepts;
                    model.templates = templates;
                    model.patterns = patterns;
                    await model.save();
                    const profileModel = await profileLayer.save(model);
                    return profileModel;
                },
            });
        },
    };
};
