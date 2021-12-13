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
import history from '../history';
import { created, deprecated, DEPRECATED, EDITED, edited } from './successAlert';

import { CLEAR_TEMPLATE_RESULTS } from './templates';
import { selectProfile, selectProfileVersion } from './profiles';


export const SELECT_PATTERN = 'SELECT_PATTERN';

export const START_GET_PATTERNS = 'START_GET_PATTERNS';
export const FINISH_GET_PATTERNS = 'FINISH_GET_PATTERNS';
export const ERROR_GET_PATTERNS = 'ERROR_CREATE_PATTERN';

export const START_CREATE_PATTERN = 'START_CREATE_PATTERN';
export const FINISH_CREATE_PATTERN = 'FINISH_CREATE_PATTERN';
export const ERROR_CREATE_PATTERN = 'ERROR_CREATE_PATTERN';

export const START_EDIT_PATTERN = 'START_EDIT_PATTERN';
export const FINISH_EDIT_PATTERN = 'FINISH_EDIT_PATTERN';
export const ERROR_EDIT_PATTERN = 'ERROR_EDIT_PATTERN';

export const START_DELETE_PATTERN = 'START_DELETE_PATTERN';
export const FINISH_DELETE_PATTERN = 'FINISH_DELETE_PATTERN';
export const ERROR_DELETE_PATTERN = 'ERROR_DELETE_PATTERN';

export const START_CLAIM_PATTERN = 'START_CLAIM_PATTERN';
export const ERROR_CLAIM_PATTERN = 'ERROR_CLAIM_PATTERN';
export const FINISH_CLAIM_PATTERN = 'FINISH_CLAIM_PATTERN';

export const START_GET_PATTERN = 'START_GET_PATTERN';
export const FINISH_GET_PATTERN = 'FINISH_GET_PATTERN';
export const ERROR_GET_PATTERN = 'ERROR_GET_PATTERN';

export const START_SEARCH_PATTERNS = 'START_SEARCH_PATTERNS';
export const FINISH_SEARCH_PATTERNS = 'FINISH_SEARCH_PATTERNS';

export const START_SEARCH_COMPONENTS = 'START_SEARCH_COMPONENTS';
export const FINISH_SEARCH_COMPONENTS = 'FINISH_SEARCH_COMPONENTS';
export const SELECT_COMPONENT = 'SELECT_COMPONENT';
export const DESELECT_COMPONENT = 'DESELECT_COMPONENT';
export const UPDATE_SELECTED_COMPONENTS = 'UPDATE_SELECTED_COMPONENTS';

export const SELECT_PATTERN_RESULT = 'SELECT_PATTERN_RESULT';
export const DESELECT_PATTERN_RESULT = 'DESELECT_PATTERN_RESULT';
export const CLEAR_PATTERN_RESULTS = 'CLEAR_PATTERN_RESULTS';
export const CLEAR_SELECTED_COMPONENTS = 'CLEAR_SELECTED_COMPONENTS';

export const SELECT_INFOPANEL_PATTERN = 'SELECT_INFOPANEL_PATTERN';
export const ERROR_SEARCH_PATTERN = 'ERROR_SEARCH_PATTERN';


export function loadProfilePatterns(profileVersionId) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;

        dispatch({
            type: START_GET_PATTERNS,
        });

        let patterns = [];
        try {
            patterns = await API.getPatterns(organizationId, profileId, profileVersionId);
        } catch (err) {
            dispatch({
                type: ERROR_GET_PATTERNS,
                errorType: 'patterns',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_PATTERNS,
                patterns: patterns,
            });
        }
    }
}

export function createPattern(pattern) {
    return async function (dispatch, getState) {
        let state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;

        dispatch({
            type: START_CREATE_PATTERN,
        });

        const selectedProfileVersion = state.application.selectedProfileVersion;
        let profileVersionId = selectedProfileVersion.uuid;
        try {
            if (state.application.selectedProfileVersion.state === 'published') {
                let newVersion = {
                    tags: selectedProfileVersion.tags,
                    concepts: selectedProfileVersion.concepts,
                    externalConcepts: selectedProfileVersion.externalConcepts,
                    templates: selectedProfileVersion.templates,
                    translations: selectedProfileVersion.translations,
                    patterns: selectedProfileVersion.patterns,
                    name: selectedProfileVersion.name,
                    description: selectedProfileVersion.description,
                    moreInformation: selectedProfileVersion.moreInformation,
                    version: selectedProfileVersion.version
                };
                const newProfileVersion = await API.createProfileVersion(
                    state.application.selectedOrganizationId, state.application.selectedProfileId,
                    newVersion);
                profileVersionId = newProfileVersion.uuid;
            }
            const newPattern = await API.createPattern(organizationId, profileId, profileVersionId, pattern);

            dispatch(selectPattern(newPattern.uuid));
            dispatch(selectProfile(organizationId, profileId));
            dispatch(selectProfileVersion(organizationId, profileId, profileVersionId));
            dispatch(loadProfilePatterns(profileVersionId));
            dispatch(created(pattern.name));
        } catch (err) {
            dispatch({
                type: ERROR_CREATE_PATTERN,
                errorType: 'patterns',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_CREATE_PATTERN,
            });
        }
    };
}

export function selectPattern(patternId) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;
        const profileVersionId = state.application.selectedProfileVersionId;

        dispatch({
            type: START_GET_PATTERN,
        });

        try {
            const pattern = await API.getPattern(organizationId, profileId, profileVersionId, patternId);

            dispatch({
                type: SELECT_PATTERN,
                pattern: pattern,
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_PATTERN,
                errorType: 'patterns',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_GET_PATTERN,
            });
        }
    }
}

export function selectInfopanelPattern(patternId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_PATTERN,
        });

        try {
            const infopanelPattern = await API.getPattern(null, null, null, patternId);

            dispatch({
                type: SELECT_INFOPANEL_PATTERN,
                infopanelPattern: infopanelPattern,
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_PATTERN,
                errorType: 'patterns',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_GET_PATTERN,
            });
        }
    }
}

export function editPattern(pattern, actualAction) {
    return async function (dispatch, getState) {
        let state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;
        const profileVersionId = state.application.selectedProfileVersionId;

        dispatch({
            type: START_EDIT_PATTERN,
        });

        try {
            const newPattern = await API.editPattern(organizationId, profileId, profileVersionId, pattern);

            dispatch(selectPattern(newPattern.uuid));
            if (!actualAction || actualAction === EDITED) {
                dispatch(edited());
            } else if (actualAction === DEPRECATED) {
                dispatch(deprecated(pattern.name));
            }
        } catch (err) {
            dispatch({
                type: ERROR_EDIT_PATTERN,
                errorType: 'patterns',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_EDIT_PATTERN,
            });
            dispatch({
                type: CLEAR_PATTERN_RESULTS,
                profileId: state.application.selectedProfileId,
            })

            dispatch({
                type: CLEAR_TEMPLATE_RESULTS,
                profileId: state.application.selectedProfileId,
            });
        }
    };
}

export function deletePattern(pattern) {
    return async function (dispatch, getState) {
        let state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;

        dispatch({
            type: START_DELETE_PATTERN,
        });

        try {
            let profileVersionId = state.application.selectedProfileVersionId;
            // if (state.application.selectedProfileVersion.state === 'published') {
            //     const newProfileVersion = await API.createProfileVersion(
            //         state.application.selectedOrganizationId, state.application.selectedProfileId,
            //         Object.assign({}, state.application.selectedProfileVersion))
            //     profileVersionId = newProfileVersion.uuid;
            // }

            await API.deletePattern(organizationId, profileId, profileVersionId, pattern.uuid);

            // Allow current loop to finish first before reload.
            setTimeout(() => {
                dispatch(selectProfile(organizationId, profileId));
                dispatch(selectProfileVersion(organizationId, profileId, profileVersionId));
                dispatch(loadProfilePatterns(profileVersionId));
            });
        } catch (err) {
            dispatch({
                type: ERROR_DELETE_PATTERN,
                errorType: 'patterns',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_DELETE_PATTERN,
            });
        }
    }
}

export function searchPatterns(search) {
    return async function (dispatch) {

        dispatch({
            type: START_SEARCH_PATTERNS,
        });

        let patterns;
        try {
            patterns = await API.searchPatterns(search);
        } catch (err) {
            dispatch({
                type: ERROR_SEARCH_PATTERN,
                errorType: 'patterns',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_SEARCH_PATTERNS,
                patterns: patterns,
            });
        }
    };
}

export function clearPatternResults() {
    return {
        type: CLEAR_PATTERN_RESULTS,
    }
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

export function selectComponent(component, componentType) {
    let c = { ...component, componentType }
    return async function (dispatch) {
        dispatch({
            type: SELECT_COMPONENT,
            component: c,
        })
    };
}

export function deselectComponent(component) {
    return async function (dispatch) {
        dispatch({
            type: DESELECT_COMPONENT,
            component: component,
        })
    };
}

export function clearSelectedComponents() {
    return async function (dispatch) {
        dispatch({
            type: CLEAR_SELECTED_COMPONENTS,
        });
    }
}

export function updateSelectedComponents(components) {
    return async function (dispatch) {
        dispatch({
            type: UPDATE_SELECTED_COMPONENTS,
            components: components,
        })
    }
}

export function claimPattern(organizationId, profileId, versionId, patternId) {
    return async function (dispatch) {

        dispatch({
            type: START_CLAIM_PATTERN,
        });

        let patterns;
        try {
            patterns = await API.claimPattern(organizationId, profileId, versionId, patternId);
        } catch (err) {
            dispatch({
                type: ERROR_CLAIM_PATTERN,
                errorType: 'pattern',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_CLAIM_PATTERN,
                patterns: patterns,
            });
        }
    };
}
