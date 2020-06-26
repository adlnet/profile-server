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
const profileModel = require('../ODM/models').profile;
const profileVersionModel = require('../ODM/models').profileVersion;
const organizationModel = require('../ODM/models').organization;
const createIRI = require('../utils/createIRI');
const langmaps = require('../utils/langmaps');
const responses = require('../reponseTypes/responses');

const createVersionObject = require('../utils/createVersionObject');
const validationError = require('../errorTypes/validationError');

async function addNewProfile(organizationUuid, profile) {
    let newProfile;
    try {
        const organization = await organizationModel.findByUuid(organizationUuid);

        if (!organization) {
            throw new Error('That organization cannot be found for this profile.');
        }

        newProfile = new profileModel();
        newProfile.organization = organization._id;
        if (!profile.iri) {
            newProfile.iri = createIRI.profile(newProfile.uuid);
        } else {
            newProfile.iri = profile.iri;
        }

        const profileVersion = new profileVersionModel();
        Object.assign(profileVersion, profile);
        profileVersion.organization = organization._id;
        profileVersion.parentProfile = newProfile._id;
        profileVersion.iri = `${newProfile.iri}/v/${profileVersion.version}`;

        newProfile.currentDraftVersion = profileVersion._id;

        await newProfile.save();
        await profileVersion.save();
    } catch (err) {
        throw new Error(err);
    }

    return newProfile;
}

exports.addNewProfile = addNewProfile;

exports.getProfile = async function (req, res) {
    let profile;
    try {
        profile = await profileModel.findByUuid(req.params.profile)
            .populate({
                path: 'versions',
                select: 'uuid iri name version state',
                populate: { path: 'organization', select: 'uuid name' },
            });

        if (!profile) {
            return res.status(404).send({
                success: false,
                message: 'No profile found for this uuid.',
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
        profile: profile,
    });
};

exports.createProfile = async function (req, res) {
    let profile;
    try {
        profile = await addNewProfile(req.params.org, req.body);
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        profile: profile,
    });
};

exports.updateProfile = async function (req, res) {
    let profile;
    try {
        req.body.updatedOn = new Date();
        profile = await profileModel.findOneAndUpdate({ uuid: req.body.uuid }, req.body, { new: true });

        if (!profile) {
            res.status(404).send({
                success: false,
                message: 'A profile could not be found for this uuid.',
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
        profile: profile,
    });
};

exports.deleteProfile = async function (req, res) {
    try {
        await profileModel.deleteByUuid(req.params.profile);
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
    });
};

exports.importProfile = async function (req, res, next) {
    const profileLayer = require('../controllers/importProfile/ProfileLayer').ProfileLayer;

    let profileModel;
    try {
        const profileImporter = new profileLayer(req.organization, req.body);
        profileModel = await (await (await (await profileImporter
            .scanProfileLayer())
            .scanVersionLayer())
            .scanProfileComponentLayer())
            .save();
    } catch (err) {
        return next(err);
    }

    return res.send(
        responses.profileImport(
            true,
            {
                url: createIRI.profile(profileModel.uuid),
                id: profileModel.iri,
                name: profileModel.currentPublishedVersion.name,
                template_count: profileModel.currentPublishedVersion.templates.length,
                concept_count: profileModel.currentPublishedVersion.concepts.length,
                pattern_count: profileModel.currentPublishedVersion.patterns.length,
                updated: profileModel.upDatedOn,
                status: profileModel.currentPublishedVersion.status,
                working_group: {
                    url: createIRI.workinggroup(profileModel.organization.name),
                    name: profileModel.organization.name,
                },
            },
        ),
    );
};

exports.exportProfile = async function (req, res) {
    const profile = req.profile;

    const concepts = await Promise.all(profile.concepts.map(c => c.export(profile.iri)));
    const templates = await Promise.all(profile.templates.map(t => t.export(profile.iri)));
    const patterns = await Promise.all(profile.patterns.map(p => p.export(profile.iri)));

    const exportedProfile = {
        id: profile.parentProfile.iri,
        '@context': 'https://w3id.org/xapi/profiles/context',
        type: 'Profile',
        conformsTo: 'https://w3id.org/xapi/profiles#1.0',
        prefLabel: langmaps.prefLabel(profile.name, profile.translations),
        definition: langmaps.definition(profile.description, profile.translations),
        seeAlso: profile.moreInformation,
        versions: createVersionObject(profile.parentProfile.versions),
        author: { type: 'Organization', name: profile.organization.name, url: profile.organization.collaborationLink },
        concepts: (concepts && concepts.length) ? concepts : undefined,
        templates: (templates && templates.length) ? templates : undefined,
        patterns: (patterns && patterns.length) ? patterns : undefined,
    };

    res.json(exportedProfile);
};

exports.validateProfile = function (asMiddleware) {
    return function (req, res, next) {
        const profileSchema = require('../profileValidator/schemas/profile');
        const concept = require('../profileValidator/schemas/concept');
        const document = require('../profileValidator/schemas/document');
        const extension = require('../profileValidator/schemas/extension');
        const validator = require('../profileValidator/validator');

        const valid = validator.validate(req.body, profileSchema);

        // got errors.. try for better errors, then send
        if (valid.errors.length) {
            let valid2;
            for (const i in valid.errors) {
                if (valid.errors[i].name === 'oneOf') {
                    const ins = valid.errors[i].instance;
                    if (ins.type === 'ResultExtension' || ins.type === 'ContextExtension' || ins.type === 'ActivityExtension') {
                        valid2 = validator.validate(ins, extension);
                    }

                    if (ins.type === 'Verb' || ins.type === 'ActivityType' || ins.type === 'AttachmentUsageType') {
                        valid2 = validator.validate(ins, concept);
                    }

                    if (ins.type === 'StateResource' || ins.type === 'AgentProfileResource' || ins.type === 'ActivityProfileResource') {
                        valid2 = validator.validate(ins, document);
                    }
                }
            }
            if (valid2 && valid2.errors.length) {
                valid.errors.push(...valid2.errors);
            }

            return next(new validationError(
                ['Errors in the profile: ' + valid.errors.length, ...valid.errors.map(i => i.stack)].join('\n'),
            ));
        }

        if (asMiddleware) {
            req.profileValidationSuccess = true;
            next();
        } else {
            return res.send(responses.validation(true, 'Validation successful.'));
        }
    };
};

exports.middleware = {
    populateProfile: async function (req, res, next) {
        try {
            const profileUUID = req.params.profile;
            let profile = await profileVersionModel
                .findByUuid(profileUUID);

            if (!profile) {
                profile = await profileModel
                    .findByUuid(profileUUID)
                    .populate({
                        path: 'currentPublishedVersion',
                    });
                profile = profile.currentPublishedVersion;

                if (!profile) {
                    return res.status(404).send({
                        success: false,
                        message: 'The profile was not found',
                    });
                }
            }

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

            req.profile = profile;
        } catch (err) {
            return next(err);
        }

        next();
    },
};
