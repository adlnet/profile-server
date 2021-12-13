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
import { selectProfile, selectProfileVersion } from './profiles';
import { created, deprecated, DEPRECATED, EDITED, edited } from './successAlert';



export const SELECT_CONCEPT = 'SELECT_CONCEPT';
export const START_GET_CONCEPT = 'START_GET_CONCEPT';
export const FINISH_GET_CONCEPT = 'FINISH_GET_CONCEPT';
export const ERROR_GET_CONCEPT = 'ERROR_GET_CONCEPT';

export const START_CREATE_CONCEPT = 'START_CREATE_CONCEPT';
export const FINISH_CREATE_CONCEPT = 'FINISH_CREATE_CONCEPT';
export const ERROR_CREATE_CONCEPT = 'ERROR_CREATE_CONCEPT';

export const START_GET_CONCEPTS = 'START_GET_CONCEPTS';
export const FINISH_GET_CONCEPTS = 'FINISH_GET_CONCEPTS';
export const ERROR_GET_CONCEPTS = 'ERROR_GET_CONCEPTS';

export const START_SEARCH_CONCEPTS = 'START_SEARCH_CONCEPTS';
export const ERROR_SEARCH_CONCEPT = 'ERROR_SEARCH_CONCEPT';
export const FINISH_SEARCH_CONCEPTS = 'FINISH_SEARCH_CONCEPTS';

export const SELECT_CONCEPT_RESULT = 'SELECT_CONCEPT_RESULT';
export const DESELECT_CONCEPT_RESULT = 'DESELECT_CONCEPT_RESULT';
export const CLEAR_CONCEPT_RESULTS = 'CLEAR_CONCEPT_RESULTS';

export const START_EDIT_CONCEPT = 'START_EDIT_CONCEPT';
export const FINISH_EDIT_CONCEPT = 'FINISH_EDIT_CONCEPT';
export const ERROR_EDIT_CONCEPT = 'ERROR_EDIT_CONCEPT';

export const START_REMOVE_CONCEPT_LINK = 'START_REMOVE_CONCEPT_LINK';
export const REMOVE_CONCEPT_LINK = 'REMOVE_CONCEPT_LINK';
export const ERROR_REMOVE_CONCEPT_LINK = 'ERROR_REMOVE_CONCEPT_LINK';
export const FINISH_REMOVE_CONCEPT_LINK = 'FINISH_REMOVE_CONCEPT_LINK';

export const START_DELETE_CONCEPT = 'START_DELETE_CONCEPT';
export const DELETE_CONCEPT = 'DELETE_CONCEPT';
export const ERROR_DELETE_CONCEPT = 'ERROR_DELETE_CONCEPT';
export const FINISH_DELETE_CONCEPT = 'FINISH_DELETE_CONCEPT';

export const START_CLAIM_CONCEPT = 'START_CLAIM_CONCEPT';
export const CLAIM_CONCEPT = 'CLAIM_CONCEPT';
export const ERROR_CLAIM_CONCEPT = 'ERROR_CLAIM_CONCEPT';
export const FINISH_CLAIM_CONCEPT = 'FINISH_CLAIM_CONCEPT';

export const START_LOAD_EXTERNAL_CONCEPTS = 'START_LOAD_EXTERNAL_CONCEPTS';
export const FINISH_LOAD_EXTERNAL_CONCEPTS = 'FINISH_LOAD_EXTERNAL_CONCEPTS';

export const SELECT_INFOPANEL_CONCEPT = 'SELECT_INFOPANEL_CONCEPT';

export function loadProfileConcepts(profileVersionId) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;

        dispatch({
            type: START_GET_CONCEPTS,
        });

        let concepts = [];
        try {
            concepts = await API.getConcepts(organizationId, profileId, profileVersionId);
        } catch (err) {
            dispatch({
                type: ERROR_GET_CONCEPTS,
                errorType: 'concepts',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_CONCEPTS,
                concepts: concepts,
            });
        }
    }
}

export function createConcept(concept) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;

        dispatch({
            type: START_CREATE_CONCEPT,
        });

        const selectedProfileVersion = state.application.selectedProfileVersion;
        let profileVersionId = selectedProfileVersion.uuid;
        try {
            if (selectedProfileVersion.state === 'published') {
                let newVersion = {
                    tags: selectedProfileVersion.tags,
                    concepts: selectedProfileVersion.concepts,
                    externalConcepts: selectedProfileVersion.externalConcepts,
                    templates: selectedProfileVersion.templates,
                    patterns: selectedProfileVersion.patterns,
                    translations: selectedProfileVersion.translations,
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
            const newConcept = await API.createConcept(organizationId, profileId, profileVersionId, concept);

            dispatch(selectConcept(organizationId, profileId, profileVersionId, newConcept.uuid));
            dispatch(selectProfile(organizationId, profileId));
            dispatch(selectProfileVersion(organizationId, profileId, profileVersionId));
            dispatch(loadProfileConcepts(profileVersionId));
            dispatch(created(concept.name));
        } catch (err) {
            dispatch({
                type: ERROR_CREATE_CONCEPT,
                errorType: 'concepts',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_CREATE_CONCEPT,
            });
        }
    };
}

export function editConcept(concept, actualAction) {
    return async function (dispatch, getState) {
        let state = getState();
        dispatch({
            type: START_EDIT_CONCEPT,
        });

        try {
            const newConcept = await API.editConcept(
                state.application.selectedOrganizationId, state.application.selectedProfileId,
                state.application.selectedProfileVersion.uuid, concept
            );

            dispatch(selectConcept(
                state.application.selectedOrganizationId, state.application.selectedProfileId,
                state.application.selectedProfileVersion.uuid, newConcept.uuid)
            );
            if (!actualAction || actualAction === EDITED) {
                dispatch(edited());
            } else if (actualAction === DEPRECATED) {
                dispatch(deprecated(concept.name));
            }
        } catch (err) {
            dispatch({
                type: ERROR_EDIT_CONCEPT,
                errorType: 'concepts',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_EDIT_CONCEPT,
            });
        }
    }
}

export function deleteConcept(organizationId, profileId, versionId, conceptId) {
    return async function (dispatch) {
        dispatch({
            type: START_DELETE_CONCEPT,
        });

        try {
            const concept = await API.deleteConcept(organizationId, profileId, versionId, conceptId);

            dispatch({
                type: DELETE_CONCEPT,
                concept: concept,
            });
        } catch (err) {
            dispatch({
                type: ERROR_DELETE_CONCEPT,
                errorType: 'concepts',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_DELETE_CONCEPT,
            });
        }
    }
}

export function claimConcept(organizationId, profileId, versionId, conceptId) {
    return async function (dispatch) {
        dispatch({
            type: START_CLAIM_CONCEPT,
        });

        try {
            const concept = await API.claimConcept(organizationId, profileId, versionId, conceptId);

            dispatch({
                type: CLAIM_CONCEPT,
                concept: concept,
            });
        } catch (err) {
            dispatch({
                type: ERROR_CLAIM_CONCEPT,
                errorType: 'concepts',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_CLAIM_CONCEPT,
            });
        }
    }
}


export function selectConcept(organizationId, profileId, versionId, conceptId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_CONCEPT,
        });

        try {
            const concept = await API.getConcept(organizationId, profileId, versionId, conceptId);

            dispatch({
                type: SELECT_CONCEPT,
                concept: concept,
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_CONCEPT,
                errorType: 'concepts',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_GET_CONCEPT,
            });
        }
    }
}

export function removeConceptLink(organizationId, profileId, versionId, conceptId) {
    return async function (dispatch) {
        dispatch({
            type: START_REMOVE_CONCEPT_LINK,
        });

        try {
            await API.removeConceptLink(organizationId, profileId, versionId, conceptId);

            dispatch({
                type: REMOVE_CONCEPT_LINK,
            });
        } catch (err) {
            dispatch({
                type: ERROR_REMOVE_CONCEPT_LINK,
                errorType: 'concepts',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_REMOVE_CONCEPT_LINK,
            });
        }
    }
}

export function selectInfopanelConcept(conceptId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_CONCEPT,
        });

        try {
            const infopanelConcept = await API.getConcept(null, null, null, conceptId);

            dispatch({
                type: SELECT_INFOPANEL_CONCEPT,
                infopanelConcept: infopanelConcept,
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_CONCEPT,
                errorType: 'templates',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_CONCEPT,
            });
        }
    };
}

export function selectConceptResult(concept) {
    return {
        type: SELECT_CONCEPT_RESULT,
        concept: concept,
    }
}

export function deselectConceptResult(concept) {
    return {
        type: DESELECT_CONCEPT_RESULT,
        concept: concept,
    }
}

export function clearConceptResults() {
    return function (dispatch) {
        dispatch({
            type: CLEAR_CONCEPT_RESULTS,
        });
    }
}

export function searchConcepts(search, limit, page, sort, filter) {
    return async function (dispatch) {

        dispatch({
            type: START_SEARCH_CONCEPTS,
        });
        let concepts;
        try {
            concepts = await API.searchConcepts(search, limit, page, sort, filter);
        } catch (err) {
            dispatch({
                type: ERROR_SEARCH_CONCEPT,
                errorType: 'concepts',
                error: err.message,
            });
        }


        dispatch({
            type: FINISH_SEARCH_CONCEPTS,
            concepts: concepts,
        });
    };
}
