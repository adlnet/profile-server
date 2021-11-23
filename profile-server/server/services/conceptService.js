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

module.exports.isReferencedElsewhere = async function(oid) {
    if (!oid) throw new Error('conceptId not provided');
    if (typeof oid !== 'object') oid = mongoose.Schema.Types.ObjectId(oid);

    // const concept = await conceptModel.findOne({ _id: oid});

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

    const externalReferences = await profileVersionModel.find({
        $and:
        [
            { externalConcepts: { $in: [oid] }}
            // { parentProfile: { $nin: [concept.parentProfile] }}
        ]
    });

    const directReferences = await profileVersionModel.find({
        $and:
        [
            { concepts: { $in: [oid] }}
            // { parentProfile: { $nin: [concept.parentProfile] }}
        ]
    });

    return ((templates.length > 0) || externalReferences.length > 0 || directReferences > 1);
}

module.exports.moveToOrphanContainer = async function(user, organizationId, concept) {
    const orphanProfile = await profileComponentService.getOrphanProfile(organizationId, user);

    if (!orphanProfile || (orphanProfile && !orphanProfile.currentPublishedVersion)) 
        throw new Error('Orphan profile is not published');

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
        conceptModel.updateOne({ uuid: concept.uuid},
            {
                parentProfile: orphanProfile.currentPublishedVersion
            },
            (err, affected, resp) => {
                if (err) reject(err);
                else resolve();
            });
    });
}

module.exports.claimDeleted = async function(concept, orphanProfileVersion, newProfileVersion) {

    // Remove concept from orphan profile version
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: orphanProfileVersion._id},
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

    // Add concept to desired profile version
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: newProfileVersion._id},
        {
            $addToSet: {
                concepts: concept._id
            },
            $pull: {
                externalConcepts: concept._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Change concept parent to be the desired profile version
    await new Promise((resolve, reject) => {
        conceptModel.updateOne({ uuid: concept.uuid},
            {
                parentProfile: newProfileVersion._id
            },
            (err, affected, resp) => {
                if (err) reject(err);
                else resolve();
            });
    });
}