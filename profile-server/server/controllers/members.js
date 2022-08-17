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
const User = require('../ODM/models').user;
const mongoSanitize = require('mongo-sanitize');

function removePrivateNames(members) {
    for (let member of members) {

        if (member == undefined || member.user == undefined)
            continue;

        if (!member.user.publicizeName) {
            delete member.user.fullname;
            delete member.user.firstname;
            delete member.user.lastname;
        }
    }
}

module.exports.getMembers = async function (req, res, next) {
    await req.resource.populate({ path: 'members.user', select: 'uuid firstname lastname fullname username _created publicizeName' }).execPopulate();
    const members = req.resource.toObject({ virtuals: true }).members;

    console.prodLog("Pre-Clean Members:", members);

    removePrivateNames(members);

    console.prodLog("Post-Clean Members:", members);

    res.send({
        success: true,
        members,
    });
};


module.exports.addMember = async function (req, res, next) {
    // member must exist;
    const member = await User.findOne(mongoSanitize(mongoSanitize({ _id: req.body.user.id })));
    if (!member) { return next(new Error('User not found in add member')); }

    for (const i in req.resource.members) {
        if (req.resource.members[i].user.toString() == req.body.user.id) {
            await req.resource.populate({ path: 'members.user', select: 'uuid firstname lastname fullname username _created publicizeName' }).execPopulate();
            const members = req.resource.toObject({ virtuals: true }).members;

            removePrivateNames(members);

            return res.send({
                success: false,
                message: 'User already in org',
                members,
            });
        }
    }

    req.resource.members.push({
        level: req.body.level,
        user: req.body.user.id,
    });
    await req.resource.save();
    await req.resource.populate({ path: 'members.user', select: 'uuid firstname lastname fullname username _created publicizeName' }).execPopulate();
    const members = req.resource.toObject({ virtuals: true }).members;

    removePrivateNames(members);

    return res.send({
        success: true,
        members: members,
    });
};

module.exports.updateMember = async function (req, res, next) {
    // member must exist;
    const member = await User.findOne({ _id: mongoSanitize(req.body.user.id) });
    if (!member) { return next(new Error('User not found in add member')); }

    for (const i in req.resource.members) {
        if (req.resource.members[i].user.toString() == req.body.user.id) {
            req.resource.members[i].level = req.body.level;
            await req.resource.save();
            await req.resource.populate({ path: 'members.user', select: 'uuid firstname lastname fullname username _created publicizeName' }).execPopulate();
            const members = req.resource.toObject({ virtuals: true }).members;

            removePrivateNames(members);

            return res.send({
                success: true,
                members: members,
            });
        }
    }

    removePrivateNames(members);

    return res.send({
        success: false,
        message: 'member not found in org',
    });
};

module.exports.removeMember = async function (req, res, next) {
    // member must exist;
    const member = await User.findOne(mongoSanitize({ _id: req.params.memberId }));
    if (!member) { return next(new Error('User not found in add member')); }
    let idx = -1;
    for (const i in req.resource.members) {
        if (req.resource.members[i].user.toString() == req.params.memberId) {
            idx = i;
        }
    }
    if (idx === -1) {
        return res.send({
            success: false,
            message: 'member not found in org',
        });
    }
    req.resource.members.splice(idx, 1);
    await req.resource.save();
    await req.resource.populate({ path: 'members.user', select: 'uuid firstname lastname fullname username _created publicizeName' }).execPopulate();
    const members = req.resource.toObject({ virtuals: true }).members;

    removePrivateNames(members);

    return res.send({
        success: true,
        members,
    });
};
