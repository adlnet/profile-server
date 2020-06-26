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

exports.definition = function (description, translations) {
    return {
        en: description,
        ...translations.reduce((a, v) => {
            if (v.translationDesc) a[v.language] = v.translationDesc;
            return a;
        }, {}),
    };
};
