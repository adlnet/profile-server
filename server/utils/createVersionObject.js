const v = require('../profileValidator/validator');
const profile = require('../ODM/profile');

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
 * Converts an array of profile version objects into the format used
 * in the jsonld.
 *
 * @param {array} profileVersions Array of profile version objects
 */
module.exports = function (profileVersions, maxVersion) {
    if (!profileVersions) return;

    const sigh = profileVersions.filter(v => v.version <= maxVersion).map((v) => ({
        id: v.iri,
        wasRevisionOf: v.wasRevisionOf.length > 0 ? v.wasRevisionOf.map(v => v.iri) : undefined,
        generatedAtTime: v.createdOn,
    }));

    return sigh;
};
