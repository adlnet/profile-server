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
import API from '../api';
import history from '../history'
import { CLEAR_TEMPLATE_RESULTS, loadCurrentProfileTemplates } from "./templates";
import { selectOrganization } from './organizations';

export const START_GET_PROFILE = 'START_GET_PROFILE';
export const START_GET_PROFILES = 'START_GET_PROFILES';
export const START_CREATE_PROFILE = 'START_CREATE_PROFILE';
export const START_UPDATE_PROFILE = 'START_UPDATE_PROFILE';
export const START_DELETE_PROFILE = 'START_DELETE_PROFILE';
export const START_POPULATE_PROFILE = 'START_POPULATE_PROFILE';

export const FINISH_CREATE_PROFILE = 'FINISH_CREATE_PROFILE';
export const FINISH_GET_PROFILE = 'FINISH_GET_PROFILE';
export const FINISH_GET_PROFILES = 'FINISH_GET_PROFILES';
export const FINISH_UPDATE_PROFILE = 'FINISH_UPDATE_PROFILE';
export const FINISH_DELETE_PROFILE = 'FINISH_DELETE_PROFILE';
export const FINISH_POPULATE_PROFILE = 'FINISH_POPULATE_PROFILE';

export const ERROR_CREATE_PROFILE = 'ERROR_CREATE_PROFILE';
export const ERROR_GET_PROFILE = 'ERROR_GET_PROFILE';
export const ERROR_GET_PROFILES = 'ERROR_GET_PROFILES';
export const ERROR_UPDATE_PROFILE = 'ERROR_UPDATE_PROFILE';
export const ERROR_DELETE_PROFILE = 'ERROR_DELETE_PROFILE';

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

export function publishProfileVersion(profileVersion) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profile = state.application.selectedProfile;

        dispatch({
            type: START_PUBLISH_PROFILE,
        });

        const newProfileVersion = Object.assign({}, profileVersion, { state: 'published' });
        const newProfile = Object.assign({}, profile, {
            currentDraftVersion: null,
            currentPublishedVersion: newProfileVersion,
        });

        try {
            await API.editProfileVersion(organizationId, profile.uuid, newProfileVersion);
            await API.editProfile(organizationId, newProfile);

            dispatch(reloadCurrentProfile());
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

export function createNewProfileDraft(profileVersion) {
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

export function editProfileVersion(profileVersion) {
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
        } catch(err) {
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

            // history.push(
            //     `/organization/${organizationId}/profile/${newProfile.uuid}/version/${newProfile.currentDraftVersion.uuid}`
            // );
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

            dispatch(selectOrganization(orgId));
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
