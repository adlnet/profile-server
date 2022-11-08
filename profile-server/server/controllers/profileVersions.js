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
const harvestDataModel = require('../ODM/models').harvestData;
const createIRI = require('../utils/createIRI');
const mongoSanitize = require('mongo-sanitize');
const harvestStatementConcepts = require('./statements').harvestStatementConcepts;
const metrics = require('./metrics');


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

    delete version.isVerified;
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
    const updatedHarvest = await harvestDataModel.update(
        { parentProfile: profile.currentPublishedVersion }, 
        { $set: { parentProfile: profileVersion._id } }, 
        { multi: true }
    );

    await profile.save();
    await profileVersion.save();

    return profileVersion;
}

exports.addNewProfileVersion = addNewProfileVersion;

exports.getProfileVersion = async function (req, res) {
    let profileVersion;
    try {
        profileVersion = await profileVersionModel.findByUuid(req.params.version)
            .populate({ path: 'organization parentProfile', select: 'uuid name' })
            .populate({ path: 'verificationRequestedBy', select: 'uuid username' })
            .populate({ path: 'harvestDatas', populate: { path: 'match.data.verb.match.model.parentProfile match.data.activity.match.model.parentProfile', model: 'profileVersion', select: 'uuid name' } });

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

    if (profileVersion.moreInformation != undefined && profileVersion.moreInformation.startsWith("javascript:"))
        profileVersion.moreInformation = "";

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

        Object.assign(profileVersion, req.body);

        if (profileVersion.verificationRequest) {
            profileVersion.verificationRequestedBy = req.user;
        }

        profileVersion.updatedBy = req.user;
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

exports.getProfileVersionExportData = async function (req, res, next) {
    const profileToJSONLD = require('./profiles').profileToJSONLD;
    const profile = req.version;

    try {
        await profile
            .populate({ path: 'organization' })
            .populate({
                path: 'parentProfile',
                populate: {
                    path: 'versions',
                    match: { version: { $lte: profile.version } },
                    options: {
                        sort: { createdOn: -1 },
                    },
                    populate: {
                        path: 'wasRevisionOf',
                    },
                },
            })
            .populate({
                path: 'concepts',
                populate: [
                    { path: 'parentProfile', select: 'uuid iri' },
                    { path: 'recommendedTerms' },
                    { path: 'similarTerms.concept' },
                ],
            })
            .populate({ path: 'templates' })
            .populate({ path: 'patterns' })
            .execPopulate();

        metrics.count(profile.parentProfile.uuid, 'profileUIExport');
        const exportData = JSON.stringify(await profileToJSONLD(profile), null, 4);

        res.send({
            success: true,
            exportData: exportData,
        });
    } catch (err) {
        if (console.prodLog) console.prodLog(err.message);
        return next(err);
    }
};

exports.getStatementHarvestData = async function (req, res, next) {
    const STATEMENT_LIMIT = 20;
    try {
        const profileVersion = await req.version.populate('parentProfile').execPopulate();
        const statements = Array.isArray(req.body.statement)
            ? req.body.statement.slice(0, STATEMENT_LIMIT) : [req.body.statement];

        const data = await Promise.all(statements.map(
            async statement => harvestStatementConcepts(statement || [], profileVersion),
        ));

        const harvestData = new harvestDataModel({
            parentProfile: profileVersion._id,
            fileName: req.body.fileName,
            match: {
                data: data,
            },
            createdBy: req.user,
            updatedBy: req.user,
        });
        await harvestData.save({ checkKeys: false });

        harvestData.depopulate('createdBy updatedBy');
        harvestData.populate('parentProfile', 'name uuid');
        res.send({
            success: true,
            harvestData: harvestData,
        });
    } catch (err) {
        if (console.prodLog) console.prodLog(err.message);
        return next(err);
    }
};

exports.updateStatementHarvestData = async function (req, res, next) {
    try {
        delete req.body._id;
        const harvest = req.harvest;
        const harvestData = await harvest.update(req.body);

        res.send({
            sucess: true,
            harvestData: harvestData,
        });
    } catch (err) {
        if (console.prodLog) console.prodLog(err.message);
        return next(err);
    }
};

exports.deleteStatementHarvestData = async function (req, res, next) {
    try {
        const harvestData = req.harvest;
        await harvestData.remove();

        res.send({ sucess: true });
    } catch (err) {
        if (console.prodLog) console.prodLog(err.message);
        return next(err);
    }
};
