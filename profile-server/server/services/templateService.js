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
const patternModel = require('../ODM/models').pattern;
const profileVersionModel = require('../ODM/models').profileVersion;
const profileComponentService = require('../services/profileComponentService');
const mongoose = require('mongoose');

module.exports.hasPatternReferences = async function(oid) {
    if (!oid) throw new Error('templateId not provided');
    if (typeof oid !== 'object') oid = mongoose.Schema.Types.ObjectId(oid);

    // const template = await templateModel.findOne({ _id: oid});

    const templates = await patternModel.find({
        $or:
        [
            { optional: oid },
            { oneOrMore: oid },
            { zeroOrMore: oid },
            { sequence: { $in: [oid] }},
            { alternates: { $in: [oid] }},
        ]
    });

    const externalReferences = await profileVersionModel.find({
        $and:
        [
            { templates: { $in: [oid] }}
            // { parentProfile: { $nin: [template.parentProfile] }}
        ]
    });

    return ((templates.length > 1) || (externalReferences.length > 1));
}

module.exports.moveToOrphanContainer = async function(user, organizationId, template) {
    const orphanProfile = await profileComponentService.getOrphanProfile(organizationId, user);

    if (!orphanProfile || (orphanProfile && !orphanProfile.currentPublishedVersion)) 
        throw new Error('Orphan profile is not published');

    // Remove template from current profileversion
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: template.parentProfile},
        {
            $pull: {
                templates: template._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Add template to orphan profileversion
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: orphanProfile.currentPublishedVersion},
        {
            $push: {
                templates: template._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Change template parent to be the orphan container
    await new Promise((resolve, reject) => {
        templateModel.updateOne({ uuid: template.uuid},
            {
                parentProfile: orphanProfile.currentPublishedVersion
            },
            (err, affected, resp) => {
                if (err) reject(err);
                else resolve();
            });
    });
}

module.exports.claimDeleted = async function(template, orphanProfileVersion, newProfileVersion) {

    // Remove template from orphan profile version
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: orphanProfileVersion._id},
        {
            $pull: {
                templates: template._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Add template to desired profile version
    await new Promise((resolve, reject) => {
        profileVersionModel.updateOne({ _id: newProfileVersion._id},
        {
            $addToSet: {
                templates: template._id
            }
        },
        (err, affected, resp) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Change template parent to be the desired profile version
    await new Promise((resolve, reject) => {
        templateModel.updateOne({ uuid: template.uuid},
            {
                parentProfile: newProfileVersion._id
            },
            (err, affected, resp) => {
                if (err) reject(err);
                else resolve();
            });
    });
}