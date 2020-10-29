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
const settings = require('../settings');

/**
 * Create the profile's API URL
 *
 * @param {string} uuid The uuid of the profile
 * @returns {string} The profile API URL
 */
exports.profile = function profile(uuid) {
    if (!uuid) throw Error('must include the uuid of the profile');
    return [settings.clientURL, 'profile', uuid].join('/');
};
