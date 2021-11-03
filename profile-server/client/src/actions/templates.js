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
import { added, created, edited, removed, deprecated } from './successAlert';
import { ADDED, CREATED, EDITED, REMOVED, DEPRECATED } from './successAlert';
import API from '../api';
import history from '../history'
import { selectProfileVersion, selectProfile } from './profiles';

export const SELECT_TEMPLATE = 'SELECT_TEMPLATE';

export const START_GET_TEMPLATE = 'START_GET_TEMPLATE';
export const FINISH_GET_TEMPLATE = 'FINISH_GET_TEMPLATE';
export const ERROR_GET_TEMPLATE = 'ERROR_GET_TEMPLATE';

export const START_GET_TEMPLATES = 'START_GET_TEMPLATES';
export const FINISH_GET_TEMPLATES = 'FINISH_GET_TEMPLATES'
export const ERROR_GET_TEMPLATES = 'ERROR_GET_TEMPLATES';

export const START_CREATE_TEMPLATE = 'START_CREATE_TEMPLATE';
export const FINISH_CREATE_TEMPLATE = 'FINISH_CREATE_TEMPLATE';
export const ERROR_CREATE_TEMPLATE = 'ERROR_CREATE_TEMPLATE';

export const START_EDIT_TEMPLATE = 'START_EDIT_TEMPLATE';
export const FINISH_EDIT_TEMPLATE = 'FINISH_EDIT_TEMPLATE';
export const ERROR_EDIT_TEMPLATE = 'ERROR_EDIT_TEMPLATE';

export const START_DELETE_TEMPLATE = 'START_DELETE_TEMPLATE';
export const FINISH_DELETE_TEMPLATE = 'FINISH_DELETE_TEMPLATE';
export const ERROR_DELETE_TEMPLATE = 'ERROR_DELETE_TEMPLATE';

export const START_CLAIM_TEMPLATE = "START_CLAIM_TEMPLATE";
export const CLAIM_TEMPLATE = "CLAIM_TEMPLATE";
export const ERROR_CLAIM_TEMPLATE = "ERROR_CLAIM_TEMPLATE";
export const FINISH_CLAIM_TEMPLATE = "FINISH_CLAIM_TEMPLATE";

export const START_SEARCH_TEMPLATES = 'START_SEARCH_TEMPLATES';
export const FINISH_SEARCH_TEMPLATES = 'FINISH_SEARCH_TEMPLATES';
export const ERROR_SEARCH_TEMPLATES = 'ERROR_SEARCH_TEMPLATES';
export const CLEAR_TEMPLATE_RESULTS = 'CLEAR_TEMPLATE_RESULTS';

export const START_UPDATE_TEMPLATE = 'START_UPDATE_TEMPLATE';
export const FINISH_UPDATE_TEMPLATE = 'FINISH_UPDATE_TEMPLATE'

export const SELECT_TEMPLATE_RESULT = 'SELECT_TEMPLATE_RESULT';
export const DESELECT_TEMPLATE_RESULT = 'DESELECT_TEMPLATE_RESULT';

export const START_REMOVE_TEMPLATE_LINK = 'START_REMOVE_TEMPLATE_LINK';
export const REMOVE_TEMPLATE_LINK = 'REMOVE_TEMPLATE_LINK';
export const ERROR_REMOVE_TEMPLATE_LINK = 'ERROR_REMOVE_TEMPLATE_LINK';
export const FINISH_REMOVE_TEMPLATE_LINK = 'FINISH_REMOVE_TEMPLATE_LINK';

export const START_SELECT_EXTERNAL_TEMPLATES = 'START_SELECT_EXTERNAL_TEMPLATES';
export const FINISH_SELECT_EXTERNAL_TEMPLATES = 'FINISH_SELECT_EXTERNAL_TEMPLATES';

export const START_SELECT_DETERMINING_PROPERTIES = 'START_SELECT_DETERMINING_PROPERTIES';
export const FINISH_SELECT_DETERMINING_PROPERTIES = 'FINISH_SELECT_DETERMINING_PROPERTIES';

export const SELECT_INFOPANEL_TEMPLATE = 'SELECT_INFOPANEL_TEMPLATE';


export function loadProfileTemplates(profileVersionId) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;

        dispatch({
            type: START_GET_TEMPLATES,
        });

        let templates = [];
        try {
            templates = await API.getTemplates(organizationId, profileId, profileVersionId);
        } catch (err) {
            dispatch({
                type: ERROR_GET_TEMPLATES,
                errorType: 'templates',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_TEMPLATES,
                templates: templates,
            });
        }
    }
}

export function createTemplate(template) {
    return async function (dispatch, getState) {
        let state = getState();

        dispatch({
            type: START_CREATE_TEMPLATE,
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

            const newTemplate = await API.createTemplate(
                state.application.selectedOrganizationId, state.application.selectedProfileId,
                profileVersionId, template
            );

            dispatch(selectTemplate(newTemplate.uuid));
            dispatch(selectProfile(state.application.selectedOrganizationId, state.application.selectedProfileId));
            dispatch(selectProfileVersion(
                state.application.selectedOrganizationId, state.application.selectedProfileId, profileVersionId));
            dispatch(loadProfileTemplates(profileVersionId));

            dispatch(created(template.name));

            history.push(`../../${profileVersionId}/templates/${newTemplate.uuid}`);
        } catch (err) {
            dispatch({
                type: ERROR_CREATE_TEMPLATE,
                errorType: 'templates',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_CREATE_TEMPLATE,
            });
        }
    };
}

export function editTemplate(template, actualAction, actualThing) {
    return async function (dispatch, getState) {
        let state = getState();
        dispatch({
            type: START_EDIT_TEMPLATE,
        });

        try {
            const newTemplate = await API.editTemplate(
                state.application.selectedOrganizationId, state.application.selectedProfileId,
                state.application.selectedProfileVersionId, template);

            dispatch(selectTemplate(newTemplate.uuid));
            if (actualAction === EDITED) {
                dispatch(edited());
            }
            if (actualAction === CREATED) {
                dispatch(created(actualThing));
            }
            if (actualAction === ADDED) {
                dispatch(added(actualThing));
            }
            if (actualAction === REMOVED) {
                dispatch(removed(actualThing));
            }
            if (actualAction === DEPRECATED) {
                dispatch(deprecated(template.name));
            }
            if (actualAction === ADDED) {
                dispatch(added(actualThing));
            }
        } catch (err) {
            dispatch({
                type: ERROR_EDIT_TEMPLATE,
                errorType: 'templates',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_EDIT_TEMPLATE,
            });
        }
    }
}

export function deleteTemplate(template) {
    return async function (dispatch, getState) {
        let state = getState();
        dispatch({
            type: START_DELETE_TEMPLATE,
        });

        try {
            const selectedProfileVersion = state.application.selectedProfileVersion;
            let profileVersionId = state.application.selectedProfileVersionId
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

            await API.deleteTemplate(
                state.application.selectedOrganizationId, state.application.selectedProfileId,
                profileVersionId, template.uuid
            );

            dispatch(selectProfile(state.application.selectedOrganizationId, state.application.selectedProfileId));
            dispatch(selectProfileVersion(
                state.application.selectedOrganizationId, state.application.selectedProfileId, profileVersionId));
            dispatch(loadProfileTemplates(profileVersionId));
        } catch (err) {
            dispatch({
                type: ERROR_DELETE_TEMPLATE,
                errorType: 'templates',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_DELETE_TEMPLATE,
            });
        }
    }
}

export function selectTemplate(templateId) {
    return async function (dispatch, getState) {
        let state = getState();
        const organizationId = state.application.selectedOrganizationId;
        const profileId = state.application.selectedProfileId;
        const profileVersionId = state.application.selectedProfileVersion.uuid;
        if (!organizationId || !profileId || !profileVersionId || !templateId)
            return;

        dispatch({
            type: START_GET_TEMPLATE,
        });

        try {
            const template = await API.getTemplate(organizationId, profileId, profileVersionId, templateId);

            dispatch({
                type: SELECT_TEMPLATE,
                template: template,
            });

            dispatch(selectDeterminingProperties(template));
        } catch (err) {
            dispatch({
                type: ERROR_GET_TEMPLATE,
                errorType: 'templates',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_TEMPLATE,
            });
        }
    };
}

export function removeTemplateLink(selectedOrganizationId, profileId, selectedProfileVersionId, templateId) {
    return async function (dispatch) {
        dispatch({
            type: START_REMOVE_TEMPLATE_LINK,
        });

        try {
            await API.removeTemplateLink(selectedOrganizationId, profileId, selectedProfileVersionId, templateId);

            dispatch({
                type: REMOVE_TEMPLATE_LINK,
            });

        } catch (err) {
            dispatch({
                type: ERROR_REMOVE_TEMPLATE_LINK,
                errorType: 'templates',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_REMOVE_TEMPLATE_LINK,
            });
        }
    };
}

export function selectInfopanelTemplate(templateId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_TEMPLATE,
        });

        try {
            const infopanelTemplate = await API.getTemplate(null, null, null, templateId);

            dispatch({
                type: SELECT_INFOPANEL_TEMPLATE,
                infopanelTemplate: infopanelTemplate,
            });

            dispatch(selectDeterminingProperties(infopanelTemplate));
        } catch (err) {
            dispatch({
                type: ERROR_GET_TEMPLATE,
                errorType: 'templates',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_TEMPLATE,
            });
        }
    };
}

export function clearTemplateResults() {
    return function (dispatch) {
        dispatch({
            type: CLEAR_TEMPLATE_RESULTS,
        });
    }
}

export function selectTemplateResult(template) {
    return {
        type: SELECT_TEMPLATE_RESULT,
        template: template,
    }
}
export function deselectTemplateResult(template) {
    return {
        type: DESELECT_TEMPLATE_RESULT,
        template: template,
    }
}

export function reloadCurrentTemplate() {
    return async function (dispatch, getState) {
        let state = getState();
        let templateId = state.application.selectedTemplateId;
        if (templateId)
            dispatch(selectTemplate(templateId))
    };
}

export function selectDeterminingProperties(template) {
    return async function (dispatch) {
        dispatch({
            type: START_SELECT_DETERMINING_PROPERTIES,
        });

        const propertyTypes = [
            'verb', 'objectActivityType', 'contextCategoryActivityType', 'contextGroupingActivityType',
            'contextOtherActivityType', 'contextParentActivityType', 'attachmentUsageType'
        ]

        let determiningProperties = propertyTypes
            .filter(propertyType => (template[propertyType] ?
                (Array.isArray(template[propertyType]) ?
                    (template[propertyType].length > 0 ?
                        true : false) : true) : false))
            .map(propertyType => ({ propertyType: propertyType, properties: template[propertyType] }));

        dispatch({
            type: FINISH_SELECT_DETERMINING_PROPERTIES,
            determiningProperties: determiningProperties,
        });
    }
}

export function searchTemplates(search) {
    return async function (dispatch) {

        dispatch({
            type: START_SEARCH_TEMPLATES,
        });

        let templates = [];
        try {
            templates = await API.searchTemplates(search);
        } catch (err) {
            dispatch({
                type: ERROR_SEARCH_TEMPLATES,
                errorType: 'templates',
                error: err.message,
            })
        }
        dispatch({
            type: FINISH_SEARCH_TEMPLATES,
            templates: templates,
        });

    };
}

export function claimTemplate(organizationId, profileId, versionId, templateId) {
    return async function (dispatch) {
        dispatch({
            type: START_CLAIM_TEMPLATE,
        });

        try {
            await API.claimTemplate(organizationId, profileId, versionId, templateId);

            dispatch({
                type: CLAIM_TEMPLATE
            });
        } catch (err) {
            dispatch({
                type: ERROR_CLAIM_TEMPLATE,
                errorType: 'templates',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_CLAIM_TEMPLATE,
            });
        }
    }
}
