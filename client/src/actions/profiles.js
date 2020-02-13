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
import { CLEAR_TEMPLATE_RESULTS } from "./templates";

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

export function createProfile(organizationId, profile) {
    return async function (dispatch) {
        dispatch({
            type: START_CREATE_PROFILE,
            profile,
        });

        const newProfile = await API.createProfile(organizationId, profile);

        dispatch({
            type: FINISH_CREATE_PROFILE,
            newProfile,
        });

        dispatch(getProfiles(organizationId));

        history.push(`/organization/${organizationId}/profile/${newProfile.uuid}`)
    };
}

export function editProfile(organizationId, profile) {
    return async function (dispatch) {
        dispatch({
            type: START_UPDATE_PROFILE,
            profile,
        });

        const newProfile = await API.editProfile(organizationId, profile);

        dispatch({
            type: FINISH_UPDATE_PROFILE,
            newProfile,
        });

        dispatch(reloadCurrentProfile());
    };
}
export function deleteProfile(orgId, profile) {
    return async function (dispatch) {
        dispatch({
            type: START_DELETE_PROFILE,
            profileId: profile.uuid,
        });

        await API.deleteProfile(orgId, profile);

        dispatch({
            type: FINISH_DELETE_PROFILE,
            profileId: profile.uuid,
        });

        dispatch(getProfiles(orgId));
    };
}

export function removeTemplate(template) {
    return async function (dispatch, getState) {
        let state = getState();
        let orgId = state.application.selectedOrganizationId;
        let profileId = state.application.selectedProfileId;
        let profile = state.application.selectedProfile;

        dispatch({
            type: START_UPDATE_PROFILE,
            profileId: profileId,
        });

        await API.deleteTemplate(orgId, profileId, template);

        dispatch({
            type: FINISH_UPDATE_PROFILE,
            profile: profile,
        });

        dispatch(reloadCurrentProfile());
    };
}

export function removeConcept(concept) {
    return async function (dispatch, getState) {
        let state = getState();
        let orgId = state.application.selectedOrganizationId;
        let profileId = state.application.selectedProfileId;
        let profile = state.application.selectedProfile;

        dispatch({
            type: START_UPDATE_PROFILE,
            profileId: profileId,
        });

        await API.deleteConcept(orgId, profileId, concept);

        dispatch({
            type: FINISH_UPDATE_PROFILE,
            profile: profile,
        });

        dispatch(reloadCurrentProfile())
    };
}

export function reloadCurrentProfile() {
    return async function (dispatch, getState) {
        let state = getState();
        let orgId = state.application.selectedOrganizationId;
        let profileId = state.application.selectedProfileId;
        dispatch({
            type: START_GET_PROFILE,
            profileId: profileId,
        });

        const profile = await API.getProfile(orgId, profileId);

        dispatch({
            type: FINISH_GET_PROFILE,
            profile: profile,
        });
        await dispatch(populateProfile());
        dispatch({
            type: SELECT_PROFILE,
            profile: profile,
        });
    };
}

export function selectProfile(orgId, profileId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_PROFILE,
            profileId: profileId,
        });

        const profile = await API.getProfile(orgId, profileId);

        dispatch({
            type: FINISH_GET_PROFILE,
            profile: profile,
        });

        dispatch({
            type: SELECT_PROFILE,
            profile: profile,
        });
    };
}

export function addSelectedTemplateResults() {
    return async function (dispatch, getState) {
        let state = getState();
        let templates = state.searchResults.selectedTemplates;
        dispatch({
            type: START_UPDATE_PROFILE,
            profileId: state.application.selectedProfileId,
        });

        for (let i of templates)
            await API.createTemplate(state.application.selectedOrganizationId, state.application.selectedProfileId, i);

        dispatch({
            type: FINISH_UPDATE_PROFILE,
            profileId: state.application.selectedProfileId,
        });
        dispatch({
            type: CLEAR_TEMPLATE_RESULTS,
            profileId: state.application.selectedProfileId,
        });
        await dispatch(reloadCurrentProfile());
        // history.push("..")

    };
}

//The o and p allow for the initial bootstrap to work
export function populateProfile(o, p) {
    return async function (dispatch, getState) {
        let state = getState();
        let orgId = o || state.application.selectedOrganizationId;
        let profileId = p || state.application.selectedProfileId;
        if (!orgId || !profileId) return;
        dispatch({
            type: START_POPULATE_PROFILE,
            profileId: profileId,
        });

        const concepts = await API.getConcepts(orgId, profileId);
        const templates = await API.getTemplates(orgId, profileId);
        const patterns = await API.getPatterns(orgId, profileId);

        dispatch({
            type: FINISH_POPULATE_PROFILE,
            profileId: profileId,
            concepts,
            templates,
            patterns
        });
    };
}

export function getProfiles(organizationId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_PROFILES,
            organizationId,
        });

        const profiles = await API.getProfiles(organizationId);

        dispatch({
            type: FINISH_GET_PROFILES,
            profiles,
            organizationId,
        });
    };
}

export function addSelectedPatternResults() {
    return async function (/* dispatch, getState */) {
        // let state = getState();
        // let templates = state.searchResults.selectedTemplates;
        // dispatch({
        //     type: START_UPDATE_PROFILE,
        //     profileId: state.application.selectedProfileId,
        // });

        // for(let i of templates)
        //     await API.createTemplate(state.application.selectedOrganizationId,state.application.selectedProfileId,i);

        // dispatch({
        //     type: FINISH_UPDATE_PROFILE,
        //     profileId: state.application.selectedProfileId,
        // });
        // dispatch({
        //     type: CLEAR_TEMPLATE_RESULTS,
        //     profileId: state.application.selectedProfileId,
        // });
        // await dispatch(reloadCurrentProfile());
        // history.push("..")

    };
}
