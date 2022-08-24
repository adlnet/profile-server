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
const profileModel = require('../ODM/models').profile;
const profileVersionModel = require('../ODM/models').profileVersion;
const profileService = require('../services/profileService');
const createIRI = require('../utils/createIRI');
const organizationModel = require('../ODM/models').organization;

var orphanProfile = null;

module.exports.ensureOrphanProfileExists = async function(organizationUuid, user) {
    
    let _orphanProfile = await profileModel.findOne({orphanContainer: true});

    if (_orphanProfile) {
        orphanProfile = _orphanProfile;
    } else {
        const organization = await organizationModel.findByUuid(organizationUuid);

        const newProfile = new profileModel();
        newProfile.organization = organization._id;
        newProfile.orphanContainer = true;
        newProfile.iri = 'https://profiles.adlnet.gov/profiles/OrphanProfile';

        const profileVersion = new profileVersionModel();
        profileVersion.organization = organization._id;
        profileVersion.parentProfile = newProfile._id;
        profileVersion.name = 'Orphan Container Profile';
        profileVersion.description = 'Holds deleted profile components that still have references.';
        profileVersion.tags = [];
        profileVersion.iri = createIRI.profileVersion(newProfile.iri, profileVersion.version);
        profileVersion.state = 'draft';

        newProfile.currentDraftVersion = profileVersion._id;

        await newProfile.save();
        const profileVersionResults = await profileVersion.save();
        await profileService.publish(profileVersionResults.uuid, user, newProfile.iri);

        const updatedProfile = await profileModel.findOne({orphanContainer: true});
        orphanProfile = updatedProfile;
    }
}

module.exports.getOrphanProfile = async function(organizationUuid, user) {

    if (orphanProfile) {
        return orphanProfile;
    } else {
        await module.exports.ensureOrphanProfileExists(organizationUuid, user);
        return orphanProfile;
    }
}