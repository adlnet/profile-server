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
const Hook = require('../ODM/models').hook;
const Profile = require('../ODM/models').profile;
const ProfileVersions = require('../ODM/models').profileVersion;

const organizationModel = require('../ODM/models').organization;
const mongoSanitize = require('mongo-sanitize');
const EventBus = require('../utils/eventBus.js');
require('../utils/webhooks');
module.exports.getHooks = async function(req, res, next) {
    const hooks = await Hook.find({ createdBy: req.user }).exec();
    return res.send({
        success: true,
        hooks,
    });
};

module.exports.getHookSubjects = async function(req, res, next) {
    const subjects = await Profile.find({ currentPublishedVersion: { $exists: true } }).exec();
    const profileVersions = await ProfileVersions.find({ parentProfile: { $in: subjects.map(i => i.id) } }).exec();
    return res.send({
        success: true,
        subjects: profileVersions,
    });
};

module.exports.getHook = async function(req, res, next) {
    const hook = await Hook.findOne({ createdBy: req.user._id, uuid: req.params.hook });
    if (!hook) {
        return res.send({
            success: false,
        });
    }

    return res.send({
        success: true,
        hook,
    });
};

module.exports.createHook = async function(req, res, next) {
    try {
        const newHook = new Hook();
        newHook.uuid = require('uuid').v4();
        newHook.event = req.body.event;
        newHook.signatureMethod = req.body.signatureMethod;
        newHook.clientSecret = req.body.clientSecret;
        newHook.target = req.body.target;
        newHook.description = req.body.description;
        newHook.createdOn = new Date();
        newHook.createdBy = req.user;
        newHook.subject = req.body.subject;
        newHook.updatedOn = new Date();
        newHook.updatedBy = req.user;

        await newHook.save();
        res.send({
            success: true,
            hook: newHook,
        });
    } catch (err) {
        throw new Error(err);
    }
};

module.exports.updateHook = async function(req, res, next) {
    const hook = await Hook.findOne({ createdBy: req.user._id, uuid: req.params.hook });
    if (!hook) {
        return res.send({
            success: false,
        });
    }
    hook.event = req.body.event;
    hook.signatureMethod = req.body.signatureMethod;
    hook.clientSecret = req.body.clientSecret;
    hook.target = req.body.target;
    hook.subject = req.body.subject;
    hook.description = req.body.description;
    hook.updatedOn = new Date();
    hook.updatedBy = req.user;
    await hook.save();
    res.send({
        success: true,
        hook: hook,
    });
};

module.exports.deleteHook = async function(req, res, next) {
    const hook = await Hook.findOne({ createdBy: req.user._id, uuid: req.params.hook });
    if (!hook) {
        return res.send({
            success: false,
        });
    }
    await hook.remove();
    return res.send({
        success: true,
    });
};

