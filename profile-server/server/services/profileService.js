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
const profileVersionModel = require('../ODM/models').profileVersion;

module.exports.publish = async function(profileId, user, parentiri) {
    var profile = await profileVersionModel.findByUuid(profileId).populate('parentProfile');
    await profile.publish(user, parentiri);
    var parentProfile = profile.parentProfile;

    // depopulate
    profile.parentProfile = profile.parentProfile.id;

    return {profile, parentProfile}
}

