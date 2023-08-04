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
const profileService = require('../services/profileService');
const profileComponentService = require('../services/profileComponentService');
const organizationModel = require('../ODM/models').organization;
const createIRI = require('../utils/createIRI');
const langmaps = require('../utils/langmaps');
const responses = require('../reponseTypes/responses');
const uuid = require('uuid');

const mongoSanitize = require('mongo-sanitize');
const EventBus = require('../utils/eventBus.js');
const createVersionObject = require('../utils/createVersionObject');
const { conflictError, validationError, notFoundError, preconditionFailedError, preconditionRequiredError } = require('../errorTypes/errors');
const authorizationError = require('../errorTypes/authorizationError');
const models = require('../ODM/models');
const metrics = require('./metrics');
const pattern = require('../ODM/pattern');

/**
 * Adds a new profile to the system by creating a new profile and profile
 * version.
 * @param {uuid} organizationUuid The organization / working group that created this profile
 * @param {Object} profile The profile to be saved
 */
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
        profileVersion.iri = createIRI.profileVersion(newProfile.iri, profileVersion.version);
        profileVersion.state = 'draft';

        profileVersion.moreInformation = profile.moreInformation;
        profileVersion.translations = profile.translations;
        profileVersion.tags = profile.tags;

        await profileVersion.save();

        newProfile.currentDraftVersion = profileVersion._id;
        await newProfile.save();
        
        EventBus.emit('profileCreated', organization._id, newProfile);
    } catch (err) {
        throw new Error(err);
    }

    return newProfile;
}

exports.addNewProfile = addNewProfile;

/**
 * Returns the root profile from the database.
 * @param {uuid} profileuuid The uuid of the profile
 */
async function getProfileFromDB(profileuuid) {
    return profileModel
        .findByUuid(profileuuid)
        .populate({
            path: 'versions',
            select: 'uuid iri name version state isShallowVersion isVerified',
            populate: { path: 'organization', select: 'uuid name' },
        })
        .populate('organization')
        .populate('currentPublishedVersion');
}

/**
 * Retrieves the profile in the system associated with the provided
 * profile uuid. Expects req.params.profile to contain the uuid.
 * Sends a JSON response back.
 *
 * @param {object} req express request object
 * @param {object} res express response object
 */
exports.getProfile = async function (req, res) {
    let profile;
    try {
        profile = await getProfileFromDB(req.params.profile);

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
/**
 * Returns the latest published or draft profiles
 * @param {boolean} published boolean value that determines all published profile should be returned
 * @param {boolean} draft boolean value that determines all published profile should be returned
 * @param {number} limit number value that limits how many records should be returned
 */
exports.getProfiles = async function (req, res) {
    let profiles;

    try {
        const { published, draft, limit } = req.query;
        const query = {};

        if (published === 'true') {
            query.currentPublishedVersion = { $exists: true };
        }
        if (draft === 'true') {
            query.currentDraftVersion = { $exists: true };
        }

        // use passed limit or default to all
        const count = Number(limit) || 0;

        profiles = await profileModel
            .find(query)
            .sort('-createdOn')
            .limit(count)
            .populate({
                path: 'organization',
            })
            .populate('currentPublishedVersion')
            .populate('currentDraftVersion');
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: err.message,
        });
    }

    res.send({
        success: true,
        profiles,
    });
};




exports.getPublishedProfilesPage = async function (req, res) {
    const profiles = await profileModel.find({ currentPublishedVersion: { $exists: true } });
    const profileIds = profiles.map(i => i.currentPublishedVersion.toString());
    const query = { _id: { $in: profileIds } };
    if (req.query.verified) {
        query.isVerified = true;
    }
    const profileVersions = await profileVersionModel.find(query)
        .populate({ path: 'parentProfile', select: 'uuid' })
        .populate({ path: 'organization', select: 'uuid name' });
    res.send({
        success: true,
        profiles: profileVersions,
    });
};
/**
 * Used by the UI to retrieve the requested profile version, the root profile
 * and organization from just the uuid. The incoming uuid might be of a
 * root profile, or a version of a profile.
 *
 * req.params.profile contains the uuid of a profile
 *
 * returns the requested profile version (or the version the user is allowed to see
 * if the uuid passed in was a root profile), the root profile and the organization.
 * If it can't get those 3 resources it returns a 404 no profile found
 */
exports.resolveProfile = async function (req, res) {
    let profile;
    let profileVersion;
    let organization;
    try {
        profile = await getProfileFromDB(req.params.profile);

        if (!profile) {
            profileVersion = await profileVersionModel
                .findByUuid(req.params.profile)
                .populate({ path: 'parentProfile', select: 'uuid' })
                .populate({ path: 'organization', select: 'uuid name' })
                .populate({ path: 'harvestDatas', populate: { path: 'match.data.verb.match.model.parentProfile match.data.activity.match.model.parentProfile', model: 'profileVersion', select: 'uuid name' } });

            if (profileVersion) {
                profile = await getProfileFromDB(profileVersion.parentProfile.uuid);
            }
        }

        if (!profile) {
            return res.status(404).send({
                success: false,
                message: 'No profile found for this uuid.',
            });
        }

        organization = await organizationModel
            .findByUuid(profile.organization.uuid)
            .populate({
                path: 'members.user',
                select: 'uuid',
            });

        if (req.user && organization
            && organization.members.find(member => member.user.uuid === req.user.uuid)) {
            if (profile.currentDraftVersion) {
                profileVersion = await profileVersionModel
                    .findById(profile.currentDraftVersion)
                    .populate({ path: 'parentProfile', select: 'uuid' })
                    .populate({ path: 'organization', select: 'uuid name' })
                    .populate({ path: 'harvestDatas', populate: { path: 'match.data.verb.match.model.parentProfile match.data.activity.match.model.parentProfile', model: 'profileVersion', select: 'uuid name' } });
            } else if (profile.currentPublishedVersion) {
                profileVersion = await profileVersionModel
                    .findByUuid(profile.currentPublishedVersion.uuid)
                    .populate({ path: 'parentProfile', select: 'uuid' })
                    .populate({ path: 'organization', select: 'uuid name' })
                    .populate({ path: 'harvestDatas', populate: { path: 'match.data.verb.match.model.parentProfile match.data.activity.match.model.parentProfile', model: 'profileVersion', select: 'uuid name' } });
            }
        } else if (profile.currentPublishedVersion) {
            profileVersion = await profileVersionModel
                .findByUuid(profile.currentPublishedVersion.uuid)
                .populate({ path: 'parentProfile', select: 'uuid' })
                .populate({ path: 'organization', select: 'uuid name' });
        }

        if (!profileVersion) {
            return res.status(404).send({
                success: false,
                message: 'No profile found for this uuid.',
            });
        }

        const metrics = require('./metrics');
        if (profileVersion.parentProfile && profileVersion.parentProfile.uuid) {
            metrics.count(profileVersion.parentProfile.uuid, 'profileUIView');
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
        profile,
        profileVersion,
        organization,
    });
};

/**
 * Responds to server requests for profiles. If a query string param of 'iri'
 * was provided it will return the requested profile, otherwise it will return
 * and array of metadata about all published profiles.
 *
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
exports.getPublishedProfiles = async function (req, res, next) {
    const iri = mongoSanitize(req.query.iri);
    if (!iri && !req.query.verified) return exports.getAllPublishedProfiles(req, res, next);


    let prof = await profileModel.findOne({ iri: iri });
    if (!prof) { prof = await profileVersionModel.findOne({ iri: iri, state: 'published' }); }
    if (!prof) return next(new notFoundError('Profile not found'));

    req.profile = await exports.getProfilePopulated(prof.uuid);

    exports.exportProfile(req, res, next);
};

/**
 * Responds to server requests with metadata about all published profiles.
 * Can accept 'workinggroup', 'limit', and 'page' query params.
 *
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
exports.getAllPublishedProfiles = async function (req, res, next) {
    const settings = require('../settings');
    try {
        const wg = mongoSanitize(req.query.workinggroup);
        const limit = parseInt(
            mongoSanitize(req.query.limit) || settings.QUERY_RESULT_LIMIT,
            10,
        );
        const page = mongoSanitize(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const query = { currentPublishedVersion: { $exists: true } };

        if (wg) {
            const wgmodel = await organizationModel.findOne({ uuid: wg });
            if (wgmodel && wgmodel._id) query.organization = wgmodel._id;
            else {
                // if we didn't find a working group, just return an empty array
                return res.send({
                    success: true,
                    profiles: [],
                });
            }
        }

        const allprofiles = await profileModel
            .find(query)
            .limit(limit)
            .skip(skip)
            .populate({ path: 'currentPublishedVersion' })
            .exec();

        const profilemeta = await Promise.all(
            allprofiles.map(async (profile) => profile.currentPublishedVersion.getMetadata()),
        );
        // const profilemeta = allprofiles;
        return res.send({
            success: true,
            metadata: profilemeta,
        });
    } catch (e) {
        return next(e);
    }
};

/**
 * Creates a profile based on the body of the request. Requires a URL
 * param of 'org' containing the uuid of the organization/working group
 * creating this profile.
 *
 * @param {*} req express request object
 * @param {*} res express response object
 */
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

/**
 * Updates a profile based on the body of the request
 * @param {*} req express request object
 * @param {*} res express response object
 */
exports.updateProfile = async function (req, res) {
    let profile;
    try {
        req.body.updatedOn = new Date();
        profile = await profileModel.findOneAndUpdate(
            mongoSanitize({ uuid: req.body.uuid }),
            mongoSanitize(req.body),
            { new: true },
        );

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

/**
 * Publishes the profile version associated with the uuid provided
 * in the url param 'profile'
 * If a body exists, see if the parentiri prop contains a new iri for the parent profile
 * Responds with a JSON object containing the newly published profile
 * version ('profile') and the root profile ('parentProfile')
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
exports.publishProfile = async function (req, res, next) {
    let profile;
    let parentProfile;

    try {
        const res = await profileService.publish(req.params.profile, req.user, req.body.parentiri);
        profile = res.profile;
        parentProfile = res.parentProfile;
        EventBus.emit('profilePublished', profile);
    } catch (err) {
        console.log(err);
        next(err);
    }

    res.send({
        success: true,
        profile,
        parentProfile,
    });
};

/**
 * Deletes a profile. The provided api key must be of the organization that owns the profile.
 *
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
exports.deletePublishedProfile = async function (req, res, next) {
    let meta = {};
    try {
        req.profile = req.resource;
        const profile = req.profile;
        if (req.validationScope === 'public') return res.status(401).send(responses.unauthorized('Not Authorized'));
        await profileService.deletePublishedProfile(req.user, req.params.org, profile);
    } catch (err) {
        return next(err);
    }

    res.send(responses.metadata(true, meta));
};

/**
 * Deletes a profile draft. The provided api key must be of the organization that owns the profile.
 *
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
 exports.deleteProfileDraft = async function (req, res, next) {
    let meta = {};
    try {
        req.profile = req.resource;
        const profile = req.profile;
        if (req.validationScope === 'public') return res.status(401).send(responses.unauthorized('Not Authorized'));
        if (profile.state !== 'draft') return res.status(405).send(responses.notAllowed('Not Allowed: Only drafts can be deleted.'));

        await profileService.deleteProfileDraft(profile);
    } catch (err) {
        return next(err);
    }

    res.send(responses.metadata(true, meta));
};

exports.getOrphanContainer = async function (req, res, next) {
    let orphanProfile = {};
    let orgUuid = '';
    let profileVersionUuid = '';
    try {
        let org = await organizationModel.findOne();
        if (!org) {
            // Create an org
            organization = new organizationModel({
                name: 'Default',
                description: 'Default generated organization',
                collaborationLink: 'http://',
                orphanContainer: true
            });
            await organization.save();

            org = await organizationModel.findOne();
        }
        orphanProfile = await profileComponentService.getOrphanProfile(org.uuid, req.user);

        let profileVersion = await profileVersionModel.findOne({ _id: orphanProfile.currentPublishedVersion});
        // Add supplemental data
        orgUuid = org.uuid;
        profileVersionUuid = profileVersion.uuid;
    }
    catch (err) {
        return next(err);
    }
    
    res.send({
        success: true,
        orphanProfile: orphanProfile,
        organizationUuid: orgUuid,
        currentPublishedVersionUuid: profileVersionUuid
    });
}

/**
 * Imports the profile (jsonld) from the body of the request and
 * publishes it.
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
exports.importProfile = async function (req, res, next) {
    const profileLayer = require('./importProfile/ProfileLayer')
        .ProfileLayer;
    const profileDocument = req.body.profile;
    if (!profileDocument) {
        throw new validationError('The profile document is missing.');
    }

    let published;
    let verificationRequest;
    if (!('status' in req.body)) {
        published = true;
    } else if (!('published' in req.body.status)) {
        published = true;
        verificationRequest = req.body.status.verificationRequest;
    } else {
        published = req.body.status.published;
        verificationRequest = req.body.status.verificationRequest;
    }

    let profileModel;
    try {
        const profileImporter = new profileLayer(
            req.organization, req.user, profileDocument, published, verificationRequest,
            req.draftProfile, req.draftVersion,
        );
        profileModel = await (await (await (await profileImporter
            .scanProfileLayer())
            .scanVersionLayer())
            .scanProfileComponentLayer())
            .save();

        await profileModel
            .populate('currentPublishedVersion')
            .populate('currentDraftVersion')
            .execPopulate();

        const metadata = published
            ? await profileModel.currentPublishedVersion.getMetadata()
            : await profileModel.currentDraftVersion.getMetadata();

        const lastModified = published
            ? profileModel.currentPublishedVersion.updatedOn
            : profileModel.currentDraftVersion.updatedOn;

        res.header('Last-Modified', lastModified);
        return res.send(responses.profileImport(true, metadata));
    } catch (err) {
        return next(err);
    }
};

/**
 * Converts the internal rep of a profil into the spec define xapi profile jsonld format
 * @param {object} profile the profile from the system to be converted to xapi profile format
 */
exports.profileToJSONLD = async function (profile) {
    const concepts = await Promise.all(
        profile.concepts.map((c) => c.export(profile.iri)),
    );
    const templates = await Promise.all(
        profile.templates.map((t) => t.export(profile.iri)),
    );
    const patterns = await Promise.all(
        profile.patterns.map((p) => p.export(profile.iri)),
    );

    const exportedProfile = {
        id: profile.parentProfile.iri,
        '@context': 'https://w3id.org/xapi/profiles/context',
        type: 'Profile',
        conformsTo: 'https://w3id.org/xapi/profiles#1.0',
        prefLabel: langmaps.prefLabel(profile.name, profile.translations),
        definition: langmaps.definition(profile.description, profile.translations),
        seeAlso: profile.moreInformation,
        versions: createVersionObject(profile.parentProfile.versions, profile.version),
        author: {
            type: 'Organization',
            name: profile.organization.name,
            url: profile.organization.collaborationLink,
        },
        concepts: concepts && concepts.length ? concepts : undefined,
        templates: templates && templates.length ? templates : undefined,
        patterns: patterns && patterns.length ? patterns : undefined,
    };

    return exportedProfile;
};

/**
 * Responds to requests to get an xapi profile
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
exports.exportProfile = async function (req, res, next) {
    const profile = req.profile;
    if (!profile || (profile.state === 'draft' && req.validationScope === 'public')) { return next(new notFoundError('Profile not found')); }

    metrics.recordMetric('profileAPIView', profile.parentProfile.uuid, req);
    metrics.recordMetric('profileAPIExport', profile.parentProfile.uuid, req);

    const exportedProfile = await exports.profileToJSONLD(profile);

    res.header('Last-Modified', profile.updatedOn);
    res.json(exportedProfile);
};

/**
 * Responds to requests to get metadata about a specified profile
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
exports.getMetadata = async function (req, res, next) {
    try {
        if (req.validationScope === 'public') { return next(new authorizationError('Not Authorized')); }

        res.header('Last-Modified', req.profile.updatedOn);
        res.send(responses.metadata(true, await req.profile.getMetadata()));
    } catch (e) {
        next(e);
    }
};

/**
 * Responds to requests to update a profile's status (publish or request verification).
 * @param {*} req express request object
 * @param {*} res express response object
 * @param {*} next express next function
 */
exports.updateStatus = async function (req, res, next) {
    try {
        if (req.validationScope === 'public') { return next(new authorizationError('Not Authorized')); }
        if (!req.body) {
            throw new validationError('The body of the request did not contain a status');
        }

        const profile = req.profile;
        const statusreq = mongoSanitize(req.body);

        if (statusreq.verificationRequest && !(profile.verificationRequest || profile.isVerified)) {
            profile.verificationRequest = statusreq.verificationRequest;
            profile.verificationRequestedBy = req.user;
            profile.updatedOn = Date.now();
        }
        if (statusreq.published && profile.state === 'draft') {
            profile.updatedOn = Date.now();
            profile.publish(req.user);

            EventBus.emit('profilePublished', { ...profile, parentProfile: profile.parentProfile._id });
        }
        profile.save();
        res.send(responses.status(true, (await profile.getMetadata()).status));
    } catch (e) {
        next(e);
    }
};

/**
 * Runs profile validation on the provided profile. Can be used as route
 * middleware - passing true will cause the function to call next()
 * @param {*} asMiddleware indicates if this function should call the express next function
 */
exports.validateProfile = function (asMiddleware) {
    return function (req, res, next) {
        const profileSchema = require('../profileValidator/schemas/profile');
        const concept = require('../profileValidator/schemas/concept');
        const document = require('../profileValidator/schemas/document');
        const extension = require('../profileValidator/schemas/extension');
        const validator = require('../profileValidator/validator');

        try {
            let profileDocument = req.body;
            if (asMiddleware) profileDocument = req.body.profile;
            if (!profileDocument) { throw new validationError('Profile document missing.'); }

            const valid = validator.validate(profileDocument, profileSchema);

            // got errors.. try for better errors, then send
            if (valid.errors.length) {
                let valid2;
                for (const i in valid.errors) {
                    if (valid.errors[i].name === 'oneOf') {
                        const ins = valid.errors[i].instance;
                        if (
                            ins.type === 'ResultExtension'
                            || ins.type === 'ContextExtension'
                            || ins.type === 'ActivityExtension'
                        ) {
                            valid2 = validator.validate(ins, extension);
                        }

                        if (
                            ins.type === 'Verb'
                            || ins.type === 'ActivityType'
                            || ins.type === 'AttachmentUsageType'
                        ) {
                            valid2 = validator.validate(ins, concept);
                        }

                        if (
                            ins.type === 'StateResource'
                            || ins.type === 'AgentProfileResource'
                            || ins.type === 'ActivityProfileResource'
                        ) {
                            valid2 = validator.validate(ins, document);
                        }
                    }
                }
                if (valid2 && valid2.errors.length) {
                    valid.errors.push(...valid2.errors);
                }

                throw new validationError(
                    [
                        'Errors in the profile: ' + valid.errors.length,
                        ...valid.errors.map((i) => i.stack),
                    ].join('\n'),
                );
            }
        } catch (err) {
            if (console.prodLog) console.prodLog(err);
            return next(err);
        }

        if (asMiddleware) {
            req.profileValidationSuccess = true;
            next();
        } else {
            return res.send(responses.validation(true, 'Validation successful.'));
        }
    };
};

/**
 * Fully populates the profile
 * @param {uuid} profileUUID the uuid of the profile
 */
exports.getProfilePopulated = async function (profileUUID) {
    let profile = await profileVersionModel.findByUuid(profileUUID);

    if (!profile) {
        profile = await profileModel.findByUuid(profileUUID).populate({
            path: 'currentPublishedVersion',
        });

        profile = profile.currentPublishedVersion;
        if (!profile) {
            return null;
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
    return profile;
};

exports.middleware = {
    /**
  * Middleware that takes the profile uuid provided in the url and attaches
  * the fully populated profile to the req object as 'req.profile'
  * @param {*} req express request object
  * @param {*} res express response object
  * @param {*} next express next function
  */
    populateProfile: async function (req, res, next) {
        try {
            const profileUUID = req.params.profile;
            const profile = await exports.getProfilePopulated(profileUUID);
            // test if the requested resource is a draft but the key isn't from the profile's working group
            if (!profile) {
                throw new notFoundError(
                    `There was no profile found with uuid ${req.params.profile}`,
                );
            }
            req.profile = profile;
        } catch (err) {
            if (console.prodLog) console.prodLog(err);
            return next(err);
        }

        next();
    },
    /**
     * Middleware that takes the public api request object and populates it
     * with values that the lock and unlock functions want.
     */
    prepForLock: async function (req, res, next) {
        try {
            req.resource = req.profile;
        } catch (err) {
            if (console.prodLog) console.prodLog(err);
            return next(err);
        }
        next();
    },
    /**
     * Middleware that tests the existence of an If-Unmodified-Since header property
     * and test its value against req.profile.updatedOn.
     * @param {*} req express request object
     * @param {*} res express response object
     * @param {*} next express next function
     */
    testIfUnmodifiedSince: function (req, res, next) {
        const profile = req.profile;
        const ifUnmodifiedSince = req.get('If-Unmodified-Since');
        try {
            if (!profile) {
                throw new Error('The profile is missing.');
            }
            if (!ifUnmodifiedSince) {
                throw new preconditionRequiredError('This request requires a value for the If-Unmodified-Since header property.');
            }

            let updatedOn = profile.updatedOn.toString();
            let headerDate = ifUnmodifiedSince instanceof Date
                ? ifUnmodifiedSince.toString() : ifUnmodifiedSince;
            headerDate = new Date(headerDate).getTime();
            updatedOn = new Date(updatedOn).getTime();
            if (updatedOn > headerDate) {
                throw new preconditionFailedError('This profile was modified since the If-Unmodified-Since date.');
            }
            if (updatedOn < headerDate) {
                throw new preconditionFailedError('This profile was modified before the If-Unmodified-Since date.');
            }
        } catch (err) {
            if (console.prodLog) console.prodLog(err);
            return next(err);
        }

        next();
    },
    /**
     * Checks if profileVersion model found in req.profile can be updated.
     * If it can, attach the root profile model and teh version model to the
     * request to be imported.
     * @param {*} req express request object
     * @param {*} res express response object
     * @param {*} next express next function
     */
    checkUpdateDraftProfile: async function (req, res, next) {
        try {
            const profileVersion = req.profile;
            if (!profileVersion) {
                throw new Error('The profile version model is missing from the request.');
            }

            const profileDocument = req.body.profile;
            if (!profileDocument) {
                throw new validationError('The profile document is missing from the request.');
            }

            if (profileVersion.state !== 'draft') {
                throw new conflictError('Cannot update a profile version that is not in a draft state.');
            }

            const parentProfile = (await profileVersion.populate('parentProfile').execPopulate()).parentProfile;
            if (!parentProfile) {
                throw new conflictError('Profile version does not a have a root profile.');
            }

            if (!parentProfile.currentDraftVersion) {
                throw new conflictError('Cannot update a profile that is not in a draft state.');
            }

            if (parentProfile.currentDraftVersion._id.toString() !== profileVersion._id.toString()) {
                throw new conflictError('Cannot update a profile that is not in a draft state.');
            }

            req.draftProfile = parentProfile;
            req.draftVersion = profileVersion;
        } catch (err) {
            if (console.prodLog) console.prodLog(err);
            return next(err);
        }

        next();
    },
};
