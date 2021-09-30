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
const templateModel = require('../ODM/models').template;
const conceptModel = require('../ODM/models').concept;
const profileVersionModel = require('../ODM/models').profileVersion;
const profileComponentService = require('../services/profileComponentService');
const mongoose = require('mongoose');

module.exports.hasTemplateReferences = async function(conceptUuid) {

    let oid = mongoose.Schema.Types.ObjectId(conceptUuid);

    const templates = await templateModel.find({
        $or:
        [
            { verb: oid },
            { objectActivityType: oid },
            { contextGroupingActivityType: { $in: [oid] }},
            { contextParentActivityType: { $in: [oid] }},
            { contextOtherActivityType: { $in: [oid] }},
            { contextCategoryActivityType: { $in: [oid] }},
            { attachmentUsageType: { $in: [oid] }},
            { objectStatementRefTemplate: { $in: [oid] }},
            { contextStatementRefTemplate: { $in: [oid] }}
        ]
    });

    return (templates.length && templates.length > 0)
}

module.exports.moveToOrphanContainer = async function(user, organizationId, conceptId) {
    const orphanProfile = await profileComponentService.getOrphanProfile(organizationId, user);

    if (!orphanProfile || (orphanProfile && !orphanProfile.currentPublishedVersion)) 
        throw new Error('Orphan profile is not published');

    const concept = await conceptModel.findOne({ uuid: conceptId});
    if (!concept) throw new Error('Concept not found');

    // Remove concept from current profileversion
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: concept.parentProfile},
        {
            $pull: {
                concepts: concept._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Add concept to orphan profileversion
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: orphanProfile.currentPublishedVersion},
        {
            $push: {
                concepts: concept._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Change concept parent to be the orphan container
    await new Promise((resolve, reject) => {
        conceptModel.updateOne({ uuid: conceptId},
            {
                parentProfile: orphanProfile.currentPublishedVersion
            },
            (err, affected, resp) => {
                if (err) reject(err);
                else resolve();
            });
    });
}