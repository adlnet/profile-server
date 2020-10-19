
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
const VersionLayer = require('./VersionLayer').VersionLayer;
const ProfileModel = require('../../ODM/models').profile;
const ProfileVersionModel = require('../../ODM/models').profileVersion;
const { conflictError, validationError } = require('../../errorTypes/errors');
const getWasRevisionOfModels = require('./getWasRevisionOfModels');
const jsonLdDiff = require('../../utils/jsonLdDiff');
const { getProfilePopulated, profileToJSONLD } = require('../profiles');

function ProfileLayer (workGroup, user, profileDocument, published, verificationRequest, draftProfileModel, draftVersionModel) {
    // can we add an 'draftUpdate' arguement?
    let model = new ProfileModel({
        iri: profileDocument.id,
        organization: workGroup,
        createdBy: user,
        updatedBy: user,
    });

    return {
        scanProfileLayer: async function () {
            let versionStatus;
            let exists;
            let hasBeenPublished = false;

            // if profileModel was passed in then this is a draft update
            if (draftProfileModel) {
                exists = draftProfileModel;
                versionStatus = 'draft';
            } else {
                exists = await ProfileModel.findOne({ iri: profileDocument.id });
            }

            if (exists) {
                // if we are not updating a draft version then this is a new version.
                if (!versionStatus) versionStatus = 'new';

                if (exists.currentDraftVersion && versionStatus === 'new') {
                    // Cannot create a new version if there is a draft version of this profile.
                    throw new conflictError(`A new version of profile ${profileDocument.id} cannot be created because there is already a draft version.`);
                }

                if (exists.currentPublishedVersion) {
                    hasBeenPublished = true;
                }

                if (versionStatus === 'new' && !hasBeenPublished) {
                    // Cannot create a new version if this profile has never been published.
                    throw new conflictError(`A new version of profile ${profileDocument.id} cannot be created because it has not yet been published.`);
                }

                if (hasBeenPublished) {
                    const currentPublishedVersion = await getProfilePopulated(exists.uuid);
                    if (profileDocument.versions.length < 2 || currentPublishedVersion.iri !== profileDocument.versions[1].id) {
                        throw new conflictError(`A new version of profile ${profileDocument.id} cannot be created because the current published version id does not match the submitted document's previous version id.`);
                    }
                    if (!profileDocument.versions[0].wasRevisionOf || !profileDocument.versions[0].wasRevisionOf.includes(currentPublishedVersion.iri)) {
                        throw new conflictError(`A new version of ${profileDocument.id} cannot be created because the current published version id is not in the submitted document's current version's wasRevisionOf array.`);
                    }

                    const existingJsonLd = await profileToJSONLD(currentPublishedVersion);
                    jsonLdDiff(existingJsonLd, profileDocument, (path, action, value) => {
                        const splitPath = path.split('.');
                        if (!(
                            (action === 'add' && ['prefLabel', 'definition'].some(s => splitPath.includes(s)))
                            || (
                                ['add', 'update', 'delete'].includes(action)
                                && ['seeAlso', 'concepts', 'templates', 'patterns', 'versions', 'url', 'author'].some(s => splitPath.includes(s))
                            )
                        )) {
                            let actionError;
                            if (action === 'add') {
                                actionError = 'added to';
                            } else if (action === 'delete') {
                                actionError = 'deleted from';
                            } else {
                                actionError = 'updated on';
                            }

                            throw new conflictError(
                                `${path} cannot be ${actionError} published profile ${profileDocument.id}`,
                            );
                        }
                    }, ['id']);
                }

                const thisModel = model.toObject();
                delete thisModel._id;
                delete thisModel.createdOn;
                delete thisModel.uuid;
                delete thisModel.createdBy;
                exists.set(thisModel);
                model = exists;
            }

            // This is allowing the situation were the root profile id is in a version's wasRevisionOf array.
            // This will happen occassionally but we don't want to fail on it, so we filter those instances out
            // below so that the getWasrevisionOfModel does not see that there is not a profileVersion whose
            // iri equals the value and creates a shallow, parentless profileVersionModel with the root profile's
            // id as it's iri.
            // if (
            //     profileDocument.versions.map(v => v.wasRevisionOf).filter(v => v).flat(Infinity)
            //         .includes(profileDocument.id)
            // ) {
            //     throw new validationError(
            //         `${profileDocument.id} cannot be a member of a version's wasRevisionOf property because it is the root id of this profile`,
            //     );
            // }

            const profileVersions = [...profileDocument.versions];
            profileVersions.reverse();
            profileVersions.pop();
            const previousVersions = [];
            for (const [index, version] of profileVersions.entries()) {
                let profileVersion = await ProfileVersionModel.findOne({ iri: version.id });
                if (!profileVersion) {
                    let wasRevisionOf;
                    if (version.wasRevisionOf) {
                        wasRevisionOf = await getWasRevisionOfModels(
                            previousVersions, version.wasRevisionOf.filter(w => w !== profileDocument.id),
                        );
                    }

                    profileVersion = new ProfileVersionModel({
                        parentProfile: model,
                        iri: version.id,
                        name: version.id,
                        description: version.id,
                        // wasRevisionOf: wasRevisionOf,
                        version: index,
                        updatedOn: version.generatedAtTime,
                        isShallowVersion: true,
                    });
                    if (wasRevisionOf) profileVersion.wasRevisionOf = wasRevisionOf;
                }
                previousVersions.push(profileVersion);
            }

            await model.validate();

            return new VersionLayer({
                profileModel: model,
                draftVersionModel: draftVersionModel,
                versionDocument: profileDocument,
                previousVersionModels: previousVersions,
                versionStatus: versionStatus,
                hasBeenPublished: hasBeenPublished,
                published: published,
                verificationRequest: verificationRequest,
                save: async function (profileVersion) {
                    if (published) {
                        model.currentPublishedVersion = profileVersion._id;
                        if (versionStatus === 'draft') model.currentDraftVersion = undefined;
                    } else {
                        model.currentDraftVersion = profileVersion._id;
                    }
                    await Promise.all(previousVersions.map(async v => v.save()));
                    await model.save();
                    return model;
                },
            });
        },
    };
}

exports.ProfileLayer = ProfileLayer;
