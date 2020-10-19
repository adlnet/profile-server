const organization = require('../profileValidator/schemas/organization');

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
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const userModel = require('../ODM/models').user;
const organizationModel = require('../ODM/models').organization;
const profileVersionModel = require('../ODM/models').profileVersion;

const email = require('../utils/email.js');

module.exports.getUsers = async function getUsers(req, res) {
    let query = {};
    if (req.query.search) {
        const reg = new RegExp(escapeRegExp(req.query.search), 'ig');
        query = {
            $or: [
                { email: reg },
                { firstname: reg },
                { lastname: reg },
            ],
        };
    }
    const users = await userModel.find(query).lean().exec();
    res.send({
        success: true,
        users,
    });
};


module.exports.getUser = async function getUsers(req, res) {
    const user = await userModel.findOne({ uuid: req.params.userId }).lean().exec();
    const organizations = await organizationModel.find({ 'members.user': user._id }).lean().exec();
    res.send({
        success: true,
        user,
        organizations,
    });
};

module.exports.updateUser = async function getUsers(req, res) {
    const user = await userModel.findOne({ uuid: req.params.userId }).exec();
    // delegate this to the normal handler
    req.user = user;
    const userController = require('./users.js');
    userController.editAccount(req, res);
};

module.exports.verificationRequests = async function (req, res, next) {
    const requests = await profileVersionModel.find({ isVerified: false, verificationRequest: { $exists: true } }).populate('organization verificationRequestedBy parentProfile').lean().exec();
    res.send({
        success: true,
        requests,
    });
};

module.exports.verify = async function (req, res, next) {
    const version = await (await profileVersionModel.findOne({ uuid: req.params.versionId })).populate('verificationRequestedBy').execPopulate();
    let revoked = false;
    const verifyStatus = req.body;
    if (verifyStatus.approval === 'approve') {
        version.isVerified = true;
    } else {
        revoked = version.isVerified;
        version.isVerified = false;
        version.verificationDenyReason = verifyStatus.reason;
    }
    version.verificationRequest = null;
    await version.save();
    email.sendProfileVerificationResponse(version, revoked);
    res.send({
        success: true,
    });
};
