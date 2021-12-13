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
const patternModel = require('../ODM/models').pattern;
const profileVersionModel = require('../ODM/models').profileVersion;
const profileComponentService = require('../services/profileComponentService');
const mongoose = require('mongoose');

module.exports.hasProfileReferences = async function(oid) {
    if (!oid) throw new Error('patternId not provided');
    if (typeof oid !== 'object') oid = mongoose.Schema.Types.ObjectId(oid);

    // const pattern = await patternModel.findOne({_id: oid});

    const profRefs = await profileVersionModel.find({
        $and:
        [
            { patterns: { $in: [oid] }}
            // { parentProfile: { $nin: [pattern.parentProfile] }}
        ]
    });

    // Needs more than just current profile link to return true.
    return (profRefs.length > 1);
}

module.exports.moveToOrphanContainer = async function(user, organizationId, pattern) {
    const orphanProfile = await profileComponentService.getOrphanProfile(organizationId, user);

    if (!orphanProfile || (orphanProfile && !orphanProfile.currentPublishedVersion)) 
        throw new Error('Orphan profile is not published');

    // Remove pattern from current profileversion
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: pattern.parentProfile},
        {
            $pull: {
                patterns: pattern._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Add pattern to orphan profileversion
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: orphanProfile.currentPublishedVersion},
        {
            $push: {
                patterns: pattern._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Change pattern parent to be the orphan container
    await new Promise((resolve, reject) => {
        patternModel.updateOne({ uuid: pattern.uuid},
            {
                parentProfile: orphanProfile.currentPublishedVersion
            },
            (err, affected, resp) => {
                if (err) reject(err);
                else resolve();
            });
    });
}

module.exports.claimDeleted = async function(pattern, orphanProfileVersion, newProfileVersion) {

    // Remove pattern from orphan profile version
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: orphanProfileVersion._id},
        {
            $pull: {
                patterns: pattern._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Add pattern to desired profile version
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: newProfileVersion._id},
        {
            $addToSet: {
                patterns: pattern._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Change pattern parent to be the desired profile version
    await new Promise((resolve, reject) => {
        patternModel.updateOne({ uuid: pattern.uuid},
            {
                parentProfile: newProfileVersion._id
            },
            (err, affected, resp) => {
                if (err) reject(err);
                else resolve();
            });
    });
}