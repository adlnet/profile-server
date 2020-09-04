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
const profileVersionModel = require('../ODM/models').profileVersion;
const profileModel = require('../ODM/models').profile;
const organizationModel = require('../ODM/models').organization;
const createIRI = require('../utils/createIRI');
const mongoSanitize = require('mongo-sanitize');


exports.getNewProfileVersion = function (organization, profile, version) {
    if (profile.currentPublishedVersion) {
        version.wasRevisionOf = [profile.currentPublishedVersion];
    }
    version.organization = organization._id;
    version.parentProfile = profile._id;
    version.createdOn = new Date();
    version.updatedOn = new Date();
    version.version += 1;
    if (!version.iri) {
        version.iri = createIRI.profileVersion(profile.iri, version.version);
    }
    delete version._id;
    delete version.state;
    delete version.uuid;

    return new profileVersionModel(version);
};

async function addNewProfileVersion(organizationUuid, profileUuid, version, user) {
    let profileVersion;

    const organization = await organizationModel.findByUuid(organizationUuid);
    const profile = await profileModel.findByUuid(profileUuid);

    if (!(organization && profile)) {
        throw new Error('Organization or profile not found for that profile version');
    }

    // attach user to version update
    version.updatedBy = user;
    profileVersion = exports.getNewProfileVersion(organization, profile, version);

    profile.currentDraftVersion = profileVersion._id;
    profile.updatedOn = new Date();

    await profile.save();
    await profileVersion.save();


    return profileVersion;
}

exports.addNewProfileVersion = addNewProfileVersion;

exports.getProfileVersion = async function (req, res) {
    let profileVersion;
    try {
        profileVersion = await profileVersionModel.findByUuid(req.params.version)
            .populate({ path: 'organization', select: 'uuid name' });

        if (!profileVersion) {
            return res.status(404).send({
                success: false,
                message: 'No profile version found for this uuid',
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        profileVersion: profileVersion,
    });
};

exports.createProfileVersion = async function (req, res) {
    let profileVersion;
    try {
        profileVersion = await addNewProfileVersion(req.params.org, req.params.profile, req.body, req.user);
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        profileVersion: profileVersion,
    });
};

exports.updateProfileVersion = async function (req, res) {
    let profileVersion;
    try {
        profileVersion = await profileVersionModel.findByUuid(req.params.version);

        if (!profileVersion) {
            return res.status(404).send({
                success: false,
                message: 'No profile version was found for this uuid.',
            });
        }

        if (req.body.state === 'published') {
            await profileVersionModel
                .updateMany({ parentProfile: req.body.parentProfile }, { state: 'revised' });
        }

        Object.assign(profileVersion, req.body);
        profileVersion.updatedOn = new Date();
        profileVersion.save();
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        profileVersion: profileVersion,
    });
};
