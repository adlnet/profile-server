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
const profileVersionModel = require('../ODM/models').profileVersion;
const conceptService = require('../services/conceptService');
const templateService = require('../services/templateService');
const patternService = require('../services/patternService');

const conceptModel = require('../ODM/models').concept;
const templateModel = require('../ODM/models').template;
const patternModel = require('../ODM/models').pattern;

module.exports.publish = async function(profileId, user, parentiri) {
    var profile = await profileVersionModel.findByUuid(profileId).populate('parentProfile');
    await profile.publish(user, parentiri);
    var parentProfile = profile.parentProfile;

    // depopulate
    profile.parentProfile = profile.parentProfile.id;

    return {profile, parentProfile}
}

module.exports.deletePublishedProfile = async function(user, organizationId, profile) {
    if (profile.orphanContainer === true) {
        throw new Error('Deleting the orphan profile is not allowed');
    }
    const profileVersion = await profileVersionModel.findOne({ _id: profile.currentPublishedVersion });
    
    // Delete Concepts
    for (let i = 0; i < profileVersion.concepts.length; i++) {
        let concept = await conceptModel.findOne({ _id: profileVersion.concepts[i] });
        if (!concept) continue;

        let hasReferences = await conceptService.isReferencedElsewhere(concept._id);
        if (hasReferences) {
            await conceptService.moveToOrphanContainer(user, organizationId, concept);
        } else {
            await conceptModel.deleteByUuid(concept.uuid);
        }
    }

    // Delete Templates
    for (let i = 0; i < profileVersion.templates.length; i++) {
        let template = await templateModel.findOne({ _id: profileVersion.templates[i] });
        if (!template) continue;

        let hasReferences = await templateService.hasPatternReferences(template._id);
        if (hasReferences) {
            await templateService.moveToOrphanContainer(user, organizationId, template);
        } else {
            await templateModel.deleteByUuid(template.uuid);
        }
    }

    // Delete Patterns
    for (let i = 0; i < profileVersion.patterns.length; i++) {
        let pattern = await patternModel.findOne({ _id: profileVersion.patterns[i] });
        if (!pattern) continue;

        let hasReferences = await patternService.hasProfileReferences(pattern._id);
        if (hasReferences) {
            await patternService.moveToOrphanContainer(user, organizationId, pattern);
        } else {
            await pattern.remove();
        }
    }

    // Delete profile version
    // let parentOid = mongoose.Schema.Types.ObjectId(profileVersion.parentProfile);
    await profileVersionModel.remove({ parentProfile: profileVersion.parentProfile });
    
    // Delete profile
    await profile.remove();
}

module.exports.deleteProfileDraft = async function(profile) {
    if (profile.orphanContainer === true) {
        throw new Error('Deleting the orphan profile is not allowed');
    }
    if (!profile.currentDraftVersion) throw new Error('Profile draft version was not found');

    let draftProfileVersion = await profileVersionModel.findOne({ _id: profile.currentDraftVersion});

    // Delete concept drafts
    await conceptModel.remove( { parentProfile: draftProfileVersion._id} );

    // Delete template drafts
    await templateModel.remove( { parentProfile: draftProfileVersion._id } );

    // Delete pattern drafts
    await patternModel.remove( { parentProfile: draftProfileVersion._id } );

    // Delete profile version draft.
    // There is no need to remove the draft components by their ids from the profileversion because it itself
    // is being deleted here.
    draftProfileVersion.remove();

    profile.currentDraftVersion = null;

    // If there is no published version of the profile, delete it entirely, else save update.
    if (profile.currentPublishedVersion) {
        await profile.save();
    } else {
        await profile.remove();
    }
}