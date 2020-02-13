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
import { reloadCurrentTemplate, FINISH_UPDATE_TEMPLATE, START_UPDATE_TEMPLATE } from './templates';
import { reloadCurrentProfile, START_UPDATE_PROFILE, FINISH_UPDATE_PROFILE } from './profiles';


export const SELECT_PATTERN = 'SELECT_PATTERN';

export const START_CREATE_PATTERN = 'START_CREATE_PATTERN';
export const FINISH_CREATE_PATTERN = 'FINISH_CREATE_PATTERN';


export const START_SEARCH_PATTERNS = 'START_SEARCH_PATTERNS';
export const FINISH_SEARCH_PATTERNS = 'FINISH_SEARCH_PATTERNS';

export const SELECT_PATTERN_RESULT = 'SELECT_PATTERN_RESULT';
export const DESELECT_PATTERN_RESULT = 'DESELECT_PATTERN_RESULT';
export const CLEAR_PATTERN_RESULTS = 'CLEAR_PATTERN_RESULTS';

export function createPattern(pattern) {
    return async function (dispatch, getState) {
        let state = getState();
        dispatch({
            type: START_CREATE_PATTERN,
        });

        const newPattern = await API.createPattern(state.application.selectedOrganizationId, state.application.selectedProfileId, pattern);

        dispatch({
            type: FINISH_CREATE_PATTERN,
            pattern: newPattern,
        });


        dispatch(reloadCurrentProfile());

        history.push("../../patterns")
    };
}

export function searchPatterns(search) {
    return async function (dispatch) {

        dispatch({
            type: START_SEARCH_PATTERNS,
        });

        const patterns = await API.searchPatterns(search);

        dispatch({
            type: FINISH_SEARCH_PATTERNS,
            patterns: patterns,
        });
    };
}

export function selectPatternResult(pattern) {
    return {
        type: SELECT_PATTERN_RESULT,
        pattern: pattern,
    }
}

export function deselectPatternResult(pattern) {
    return {
        type: DESELECT_PATTERN_RESULT,
        pattern: pattern,
    }
}

export function addSelectedPatternsToTemplate() {
    return async function (dispatch, getState) {
        let state = getState();
        dispatch({
            type: START_UPDATE_TEMPLATE,
        });



        let currentTemplate = state.application.selectedTemplate;
        currentTemplate = JSON.parse(JSON.stringify(currentTemplate));

        if (!currentTemplate.patterns) currentTemplate.patterns = [];

        for (let i of state.searchResults.selectedPatterns)
            currentTemplate.patterns.push(i.uuid);

        await API.editTemplate(state.application.selectedOrganizationId, state.application.selectedProfileId, currentTemplate);
        dispatch({
            type: FINISH_UPDATE_TEMPLATE,

        });

        dispatch(reloadCurrentTemplate());
        dispatch(reloadCurrentProfile());

        history.push("../templates")
    }
}

export function addSelectedPatternsToProfile() {
    return async function (dispatch, getState) {
        let state = getState();
        let currentProfile = state.application.selectedProfile;
        dispatch({
            type: START_UPDATE_PROFILE,
        });

        currentProfile = JSON.parse(JSON.stringify(currentProfile));

        if (!currentProfile.patterns) currentProfile.patterns = [];
        for (let i of state.searchResults.selectedPatterns)
            currentProfile.patterns.push(i.uuid);

        await API.editProfile(state.application.selectedOrganizationId, currentProfile);

        dispatch({
            type: FINISH_UPDATE_PROFILE,

        });


        dispatch(reloadCurrentProfile());

        history.push("../templates")
    }
}

export function createPatternInTemplate(pattern) {
    return async function (dispatch, getState) {
        let state = getState();
        dispatch({
            type: START_CREATE_PATTERN,
        });

        const newPattern = await API.createPattern(state.application.selectedOrganizationId, state.application.selectedProfileId, pattern);
        let currentTemplate = state.application.selectedTemplate;
        currentTemplate = JSON.parse(JSON.stringify(currentTemplate));

        if (!currentTemplate.patterns) currentTemplate.patterns = [];
        currentTemplate.patterns.push(newPattern.uuid);

        await API.editTemplate(state.application.selectedOrganizationId, state.application.selectedProfileId, currentTemplate);
        dispatch({
            type: FINISH_CREATE_PATTERN,
            pattern: newPattern,
        });


        dispatch(reloadCurrentProfile());

        history.push("../templates")
    }
}


