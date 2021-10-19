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
import { added, ADDED, created, EDITED, edited, published, removed, verificationRequested } from './successAlert';
import API from '../api';
import { SELECT_ORG, selectOrganization } from './organizations';

export const START_GET_PROFILE = 'START_GET_PROFILE';
export const START_GET_PROFILES = 'START_GET_PROFILES';
export const START_CREATE_PROFILE = 'START_CREATE_PROFILE';
export const START_UPDATE_PROFILE = 'START_UPDATE_PROFILE';
export const START_DELETE_PROFILE = 'START_DELETE_PROFILE';
export const START_DELETE_PROFILE_DRAFT = 'START_DELETE_PROFILE_DRAFT';
export const START_POPULATE_PROFILE = 'START_POPULATE_PROFILE';
export const START_VERIFICATION_REQUEST = 'START_VERIFICATION_REQUEST';

export const FINISH_CREATE_PROFILE = 'FINISH_CREATE_PROFILE';
export const FINISH_GET_PROFILE = 'FINISH_GET_PROFILE';
export const FINISH_GET_PROFILES = 'FINISH_GET_PROFILES';
export const FINISH_UPDATE_PROFILE = 'FINISH_UPDATE_PROFILE';
export const FINISH_DELETE_PROFILE = 'FINISH_DELETE_PROFILE';
export const FINISH_DELETE_PROFILE_DRAFT = 'FINISH_DELETE_PROFILE_DRAFT';
export const FINISH_POPULATE_PROFILE = 'FINISH_POPULATE_PROFILE';
export const FINISH_VERIFICATION_REQUEST = 'FINISH_VERIFICATION_REQUEST';

export const SET_UPLOADING_STATE = 'SET_UPLOADING_STATE';

export const BEGIN_HARVEST = 'BEGIN_HARVEST';
export const COMPLETED_HARVEST = 'COMPLETED_HARVEST';
export const ERROR_HARVEST = 'ERROR_HARVEST';
export const START_HARVEST_DELETE = 'START_HARVEST_DELETE';
export const FINISH_HARVEST_DELETE = 'FINISH_HARVEST_DELETE';
export const START_HARVEST_PUT = 'START_HARVEST_PUT';
export const FINISH_HARVEST_PUT = 'FINISH_HARVEST_PUT';


export const ERROR_CREATE_PROFILE = 'ERROR_CREATE_PROFILE';
export const ERROR_GET_PROFILE = 'ERROR_GET_PROFILE';
export const ERROR_GET_PROFILES = 'ERROR_GET_PROFILES';
export const ERROR_UPDATE_PROFILE = 'ERROR_UPDATE_PROFILE';
export const ERROR_DELETE_PROFILE = 'ERROR_DELETE_PROFILE';
export const ERROR_DELETE_PROFILE_DRAFT = 'ERROR_DELETE_PROFILE_DRAFT';
export const ERROR_VERIFICATION_REQUEST = 'ERROR_VERIFICATION_REQUEST';

export const SELECT_PROFILE = 'SELECT_PROFILE';

export const START_CREATE_PROFILE_VERSION = 'START_CREATE_PROFILE_VERSION';
export const FINISH_CREATE_PROFILE_VERSION = 'FINISH_CREATE_PROFILE_VERSION';
export const ERROR_CREATE_PROFILE_VERSION = 'ERROR_CREATE_PROFILE_VERSION';

export const START_GET_PROFILE_VERSION = 'START_GET_PROFILE_VERSION';
export const FINISH_GET_PROFILE_VERSION = 'FINISH_GET_PROFILE_VERSION';
export const ERROR_GET_PROFILE_VERSION = 'ERROR_GET_PROFILE_VERSION';

export const SELECT_PROFILE_VERSION = 'SELECT_PROFILE_VERSION';

export const START_UPDATE_PROFILE_VERSION = 'START_UPDATE_PROFILE_VERSION';
export const FINISH_UPDATE_PROFILE_VERSION = 'FINISH_UPDATE_PROFILE_VERSION';
export const ERROR_UPDATE_PROFILE_VERSION = 'ERROR_UPDATE_PROFILE_VERSION';

export const START_PUBLISH_PROFILE = 'START_PUBLISH_PROFILE';
export const FINISH_PUBLISH_PROFILE = 'FINISH_PUBLISH_PROFILE';
export const ERROR_PUBLISH_PROFILE = 'ERROR_PUBLISH_PROFILE';

export const START_RELOAD_PROFILE = 'START_RELOAD_PROFILE';
export const FINISH_RELOAD_PROFILE = 'FINISH_RELOAD_PROFILE';

export const START_LOAD_PROFILE_ROOT_IRI = 'START_LOAD_PROFILE_ROOT_IRI';
export const SELECT_LOAD_PROFILE_ROOT_IRI = 'SELECT_LOAD_PROFILE_ROOT_IRI';
export const ERROR_LOAD_PROFILE_ROOT_IRI = 'ERROR_LOAD_PROFILE_ROOT_IRI';
export const FINISH_LOAD_PROFILE_ROOT_IRI = 'FINISH_LOAD_PROFILE_ROOT_IRI';

export const REMOVE_IMPORT_QUEUE_ITEM = 'REMOVE_IMPORT_QUEUE_ITEM';
export const REMOVE_HARVESTED_QUEUE_ITEM = 'REMOVE_HARVESTED_QUEUE_ITEM';

export const REMOVE_IMPORT_FILE = 'REMOVE_IMPORT_FILE';
export const REMOVE_HARVESTED_FILE = 'REMOVE_IMPORT_FILE';

export const UPDATED_IMPORTED_FILE_INDEX = 'UPDATED_IMPORTED_FILE_INDEX';
export const REMOVE_IMPORTED_FILE = 'REMOVE_IMPORTED_FILE';

export function loadProfileRootIRI() {
    return async function (dispatch) {
        dispatch({
            type: START_LOAD_PROFILE_ROOT_IRI,
        });

        try {
            const iri = await API.loadProfileRootIRI();

            dispatch({
                type: SELECT_LOAD_PROFILE_ROOT_IRI,
                iri: iri,
            });

        } catch (err) {
            dispatch({
                type: ERROR_LOAD_PROFILE_ROOT_IRI,
                errorType: 'profiles',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_LOAD_PROFILE_ROOT_IRI,
            });
        }
    }
}

export function publishProfileVersion(profileVersion, parentiri) {
    return async function (dispatch) {
        dispatch({
            type: START_PUBLISH_PROFILE,
        });

        try {
            await API.publishProfileVersion(profileVersion.uuid, parentiri);

            dispatch(reloadCurrentProfile());
            dispatch(published(profileVersion.name))
        } catch (err) {
            dispatch({
                type: ERROR_PUBLISH_PROFILE,
                errorType: 'profiles',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_PUBLISH_PROFILE,
            });
        }
    }
}

export function createNewProfileDraft(profileVersion, actualAction, actualSubject) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;

        dispatch({
            type: START_CREATE_PROFILE_VERSION,
        });

        try {
            const newProfileVersion = await API.createProfileVersion(organizationId, profileId, profileVersion);

            dispatch(selectProfileVersion(organizationId, profileId, newProfileVersion.uuid));
            dispatch(selectProfile(organizationId, profileId));
            if (!actualAction || actualAction === EDITED) {
                dispatch(edited());
            } else if (actualAction === ADDED) {
                dispatch(added(actualSubject));
            }
        } catch (err) {
            dispatch({
                type: ERROR_CREATE_PROFILE_VERSION,
                errorType: 'profiles',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_CREATE_PROFILE_VERSION,
            });
        }
    }
}

export function editProfileVersion(profileVersion, actualAction, actualSubject) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;

        dispatch({
            type: START_UPDATE_PROFILE_VERSION,
        });

        try {
            await API.editProfileVersion(organizationId, profileId, profileVersion);

            dispatch(reloadCurrentProfile());
            if (!actualAction || actualAction === EDITED) {
                dispatch(edited());
            } else if (actualAction === ADDED) {
                dispatch(added(actualSubject));
            }
        } catch (err) {
            dispatch({
                type: ERROR_UPDATE_PROFILE_VERSION,
                errorType: 'profiles',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_UPDATE_PROFILE_VERSION,
            });
        }
    }
}

export function selectProfileVersion(organizationId, profileId, versionId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_PROFILE_VERSION,
        });

        try {
            const profileVersion = await API.getProfileVersion(organizationId, profileId, versionId);

            dispatch({
                type: SELECT_PROFILE_VERSION,
                profileVersion: profileVersion,
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_PROFILE_VERSION,
                errorType: 'profiles',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_PROFILE_VERSION,
            });
        }
    }
}

export function createProfile(organizationId, profile) {
    return async function (dispatch) {
        dispatch({
            type: START_CREATE_PROFILE,
        });

        try {
            const newProfile = await API.createProfile(organizationId, profile);

            dispatch(selectOrganization(organizationId));
            dispatch(selectProfile(organizationId, newProfile.uuid));
            dispatch(created(profile.name));
        } catch (err) {
            dispatch({
                type: ERROR_CREATE_PROFILE,
                errorType: 'profiles',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_CREATE_PROFILE,
            });
        }
    };
}

export function deleteProfile(orgId, profile) {
    return async function (dispatch) {

        dispatch({
            type: START_DELETE_PROFILE,
        });

        try {
            await API.deleteProfile(orgId, profile);

            // Do next update tick to avoid missing content error
            setTimeout(() => {
                dispatch(selectOrganization(orgId));
            });
        } catch (err) {
            dispatch({
                type: ERROR_DELETE_PROFILE,
                errorType: 'profiles',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_DELETE_PROFILE,
            });
        }
    };
}

export function deleteProfileDraft(orgId, profile) {
    return async function (dispatch) {

        dispatch({
            type: START_DELETE_PROFILE_DRAFT,
        });

        try {
            await API.deleteProfileDraft(orgId, profile);

            // Do next update tick to avoid missing content error
            setTimeout(() => {
                dispatch(selectOrganization(orgId));
            });
        } catch (err) {
            dispatch({
                type: ERROR_DELETE_PROFILE_DRAFT,
                errorType: 'profiles',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_DELETE_PROFILE_DRAFT,
            });
        }
    };
}

export function selectProfile(orgId, profileId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_PROFILE,
            profileId: profileId,
        });

        try {
            const profile = await API.getProfile(orgId, profileId);

            dispatch({
                type: SELECT_PROFILE,
                profile: profile,
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_PROFILE_VERSION,
                errorType: 'profiles',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_PROFILE,
            });
        }
    };
}

/**
 * Sets the profile and profile version
 * @param {uuid} profileId The UUID of a profile or profile version
 */
export function resolveProfile(profileId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_PROFILE,
            profileId
        })

        try {
            const response = await API.resolveProfile(profileId);
            dispatch({
                type: SELECT_PROFILE,
                profile: response.profile,
            });
            dispatch({
                type: SELECT_PROFILE_VERSION,
                profileVersion: response.profileVersion,
            });
            dispatch({
                type: SELECT_ORG,
                organization: response.organization,
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_PROFILE,
                errorType: 'profiles',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_PROFILE,
            });
        }
    }
}

export function reloadCurrentProfile() {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;
        const profileVersionId = state.application.selectedProfileVersion.uuid;

        dispatch({
            type: START_RELOAD_PROFILE,
        });

        dispatch(selectProfileVersion(organizationId, profileId, profileVersionId));
        dispatch(selectProfile(organizationId, profileId));

        dispatch({
            type: FINISH_RELOAD_PROFILE,
        });
    };
}

export function getProfiles(organizationId, published, draft, limit) {
    return async function (dispatch) {

        dispatch({
            type: START_GET_PROFILES,
        });

        let profiles;
        try {
            profiles = await API.getProfiles(organizationId, published, draft, limit);
        } catch (err) {
            dispatch({
                type: ERROR_GET_PROFILES,
                errorType: 'profiles',
                error: err.message,
            });

        } finally {
            dispatch({
                type: FINISH_GET_PROFILES,
                profiles
            });
        }
    };
}

export function requestVerification() {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;
        const profileVersion = state.application.selectedProfileVersion;
        const pVersion = { ...profileVersion, verificationRequest: new Date() }

        dispatch({
            type: START_VERIFICATION_REQUEST,
        });

        try {
            await API.editProfileVersion(organizationId, profileId, pVersion);
            dispatch(verificationRequested());
            dispatch(reloadCurrentProfile());
        } catch (err) {
            dispatch({
                type: ERROR_VERIFICATION_REQUEST,
                errorType: 'profiles',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_VERIFICATION_REQUEST,
            });
        }
    }
}

export function harvest(formData, options){ 
    return async function (dispatch, getState) { 
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;
        const profileVersionId = state.application.selectedProfileVersion;
        
        dispatch({
            type: BEGIN_HARVEST,
        });

        try{
            await API.harvest(organizationId, profileId, profileVersionId, formData, options);
            dispatch(reloadCurrentProfile());
        }catch(err){
            dispatch({
                type: ERROR_HARVEST,
                errorType: 'profiles',
                error: err.message,
            });
        }finally{
            dispatch({
                type: COMPLETED_HARVEST,
            });
        }
    };
}

export function deleteHarvest(formData){ 
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;
        const profileVersionId = state.application.selectedProfileVersion;
        
        dispatch({
            type: START_HARVEST_DELETE,
        });

        try{
            await API.deleteHarvest(organizationId, profileId, profileVersionId, formData);
            dispatch(removed(formData.fileName));
            dispatch(reloadCurrentProfile());
        }catch(err){
            dispatch({
                type: ERROR_HARVEST,
                errorType: 'profiles',
                error: err.message,
            });
        }finally{
            dispatch({
                type: FINISH_HARVEST_DELETE,
            });
        }
    };
}
export function putHarvest(harvestItem){ 
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;
        const profileVersionId = state.application.selectedProfileVersion;

        dispatch({
            type: START_HARVEST_PUT,
        });

        try{
            await API.putHarvest(organizationId, profileId, profileVersionId, harvestItem);
            dispatch(reloadCurrentProfile());
        }catch(err){
            dispatch({
                type: ERROR_HARVEST,
                errorType: 'profiles',
                error: err.message,
            });
        }finally{
            dispatch({
                type: FINISH_HARVEST_PUT,
            });
        }
    };
}