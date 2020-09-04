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
exports.ProfileComponentLayer = function (versionLayer) {
    return {
        scanProfileComponentLayer: async function () {
            const conceptPartialModels = await Promise.all(versionLayer.conceptLayers.map(
                async c => c.scanProfileComponentLayer(),
            ));
            const templatePartialModels = await Promise.all(versionLayer.templateLayers.map(
                async t => t.scanProfileComponentLayer(),
            ));
            const patternsPartialModels = await Promise.all(versionLayer.patternLayers.map(
                async p => p.scanProfileComponentLayer(),
            ));

            const conceptModels = [];
            for (const layer of versionLayer.conceptLayers) {
                const model = await layer.scanSubcomponentLayer(conceptPartialModels);
                conceptModels.push(model);
            }

            const templateModels = [];
            for (const layer of versionLayer.templateLayers) {
                const model = await layer.scanSubcomponentLayer(conceptPartialModels, templatePartialModels);
                templateModels.push(model);
            }

            for (const layer of versionLayer.patternLayers) {
                await layer.scanSubcomponentLayer(templatePartialModels, patternsPartialModels);
            }

            return {
                save: async function () {
                    const concepts = await Promise.all(conceptModels.map(async c => c.save()));
                    const templates = await Promise.all(templateModels.map(async t => t.save()));
                    const patterns = await Promise.all(versionLayer.patternLayers.map(async p => p.save()));
                    const profileModel = await versionLayer.save(concepts, templates, patterns);
                    return profileModel;
                },
            };
        },
    };
};
