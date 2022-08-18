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
const express = require('express');
const searchRouter = express.Router();
module.exports = searchRouter;

function escapeRegExp(string) {
    if (string == undefined)
        string = "";
    
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const models = {
    profiles: require('../ODM/models').profileVersion,
    concepts: require('../ODM/models').concept,
    templates: require('../ODM/models').template,
    patterns: require('../ODM/models').pattern,
};

searchRouter.get('/:type', async (req, res, next) => {
    let published = await models.profiles.find({ state: { $ne: 'draft' } }, { select: '_id' }).exec();
    published = published.map(i => i._id);

    const model = models[req.params.type];
    if (!model) {
        return res.status(400).send({
            success: false,
            message: 'unknown model type',
        });
    }
    const fields = model.schema.paths;
    const subfields = model.schema.subPaths;

    const allFields = {
        ...fields,
        ...subfields,
    };

    const regex = new RegExp(escapeRegExp(req.query.search), 'ig');
    const query = {
        $or: [],
    };
    if (req.params.type !== 'profiles') {
        query.parentProfile = {
            $in: published,
        };
    } else {
        let published = await (require('../ODM/models').profile).find({ currentPublishedVersion: { $ne: undefined } }).lean().exec();
        published = published.map(i => i.currentPublishedVersion);
        query._id = {
            $in: published,
        };
    }

    for (const i in allFields) {
        if (req.query.search && allFields[i].instance == 'String') { query.$or.push({ [allFields[i].path]: regex }); }

        if (req.query.search && allFields[i].instance == 'Array' && allFields[i].$embeddedSchemaType.instance == 'String') { query.$or.push({ [allFields[i].path]: regex }); }
        if (allFields[i].path == 'isDeprecated') {
            if (req.query.deprecated === 'true') {

            } else {
                query.isDeprecated = false;
            }
        }

        if (allFields[i].path == 'isVerified') {
            if (req.query.verified === 'true') { query.isVerified = true; }
        }
    }
    if (query.$or.length === 0) { delete query.$or; }
    console.log(query);
    const total = await model.find(query).count();
    const results = await model.find(query).skip(parseInt(req.query.page * 10)).limit(10)
        .populate('parentProfile organization')
        .populate('parentProfile.organization')
        .lean()
        .exec();

    await Promise.all(results.map(async i => {
        const o = await (require('../ODM/models').organization).findOne({ _id: i.parentProfile.organization.toString() }).lean();
        i.parentProfile.organization = o;
    }));

    if (req.params.type === 'profiles') {
        const mongoose = require('mongoose');
        for (const result of results) {
            result.similarProfiles = [];
            const profiles = await models.profiles.find({
                parentProfile: { $exists: true, $ne: result.parentProfile._id },
                $or: [
                    {
                        $or: [
                            { concepts: { $in: result.concepts.map(v => mongoose.Types.ObjectId(v)) } },
                            { concepts: { $in: result.externalConcepts.map(v => mongoose.Types.ObjectId(v)) } }],
                    },
                    {
                        $or: [
                            { externalConcepts: { $in: result.concepts.map(v => mongoose.Types.ObjectId(v)) } },
                            { externalConcepts: { $in: result.externalConcepts.map(v => mongoose.Types.ObjectId(v)) } }],
                    },
                    { patterns: { $in: result.patterns.map(v => mongoose.Types.ObjectId(v)) } },
                    { templates: { $in: result.templates.map(v => mongoose.Types.ObjectId(v)) } },
                ],
            }, 'parentProfile').populate({ path: 'parentProfile', match: { currentPublishedVersion: { $exists: true } }, select: 'currentPublishedVersion', populate: 'currentPublishedVersion' }).lean()
                .exec();

            const nextStep = (profiles.filter(v => v.parentProfile && v.parentProfile.currentPublishedVersion).map(v => v.parentProfile.currentPublishedVersion));
            for (const item of nextStep) {
                if (!result.similarProfiles.find(v => v.uuid === item.uuid)) result.similarProfiles.push(item);
            }
        }
    }

    res.send({
        success: true,
        results: results,
        total: total,
    });
});
