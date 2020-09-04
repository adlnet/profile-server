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
/**
 * Create the prefLabel language map out of the values in the model
 * @param {string} name The value in the name property of the model,
 * will be used as the value of the en property in the language map
 * @param {string} translations The  translationName values out of
 * the translations property in the model, will be added to the
 * returned language map
 */
exports.prefLabel = function (name, translations) {
    const out = {
        en: name,
        ...translations.reduce((a, v) => {
            if (v.translationName) a[v.language] = v.translationName;
            return a;
        }, {}),
    };
    return out;
};

/**
 * Create the definition language map out of the values in the model
 * @param {string} description The value in the description property of the model,
 * will be used as the value of the en property in the language map
 * @param {string} translations The translationDesc values out of
 * the translations property in the model, will be added to the returned
 * language map
 */
exports.definition = function (description, translations) {
    return {
        en: description,
        ...translations.reduce((a, v) => {
            if (v.translationDesc) a[v.language] = v.translationDesc;
            return a;
        }, {}),
    };
};
