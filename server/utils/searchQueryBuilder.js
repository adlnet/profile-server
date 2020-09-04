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
function setRegex(column, searchArray) {
    return searchArray.map(s => ({ [column]: { $regex: new RegExp(s, 'i') } }));
}

/**
 * Creates a mongo query based on the provided search terms
 * @param {string} searchString The string to search for
 */
exports.buildSearchQuery = function (searchString) {
    const search = searchString.split(' ')
        .map(s => s.trim())
        .filter(s => s);
    return {
        $or: [
            { $or: setRegex('name', search) },
            { $or: setRegex('description', search) },
            { $or: setRegex('uuid', search) },
            { $or: setRegex('iri', search) },
        ],
    };
};
