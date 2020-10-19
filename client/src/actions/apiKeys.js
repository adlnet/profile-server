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
import { selectOrganization } from './organizations'
import { edited } from './successAlert';

export const START_GET_APIKEYS = 'START_GET_APIKEYS';
export const START_GET_APIKEY = 'START_GET_APIKEY';
export const START_CREATE_APIKEY = 'START_CREATE_APIKEY';
export const START_UPDATE_APIKEY = 'START_UPDATE_APIKEY';
export const START_DELETE_APIKEY = 'START_DELETE_APIKEY';

export const FINISH_GET_APIKEYS = 'FINISH_GET_APIKEYS';
export const FINISH_GET_APIKEY = 'FINISH_GET_APIKEY';
export const FINISH_CREATE_APIKEY = 'FINISH_CREATE_APIKEY';
export const FINISH_UPDATE_APIKEY = 'FINISH_UPDATE_APIKEY';
export const FINISH_DELETE_APIKEY = 'FINISH_DELETE_APIKEY';

export const ERROR_GET_APIKEYS = 'ERROR_GET_APIKEYS';
export const ERROR_GET_APIKEY = 'ERROR_GET_APIKEY';
export const ERROR_CREATE_APIKEY = 'ERROR_CREATE_APIKEY';
export const ERROR_UPDATE_APIKEY = 'ERROR_UPDATE_APIKEY';
export const ERROR_DELETE_APIKEY = 'ERROR_DELETE_APIKEY';

export const SELECT_APIKEY = 'SELECT_APIKEY';


export function loadOrgApiKeys(organizationId) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_APIKEYS,
        });

        let apiKeys;
        try {
            apiKeys = await API.getApiKeys(organizationId);
        } catch (err) {
            dispatch({
                type: ERROR_GET_APIKEYS,
                errorType: 'apiKeys',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_APIKEYS,
                apiKeys: apiKeys,
            });
        }
    }
}

export function createApiKey(apiKey) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;

        dispatch({
            type: START_CREATE_APIKEY,
        });

        try {
            const editedKey = await API.createApiKey(organizationId, apiKey);

            dispatch({
                type: SELECT_APIKEY,
                apiKey: editedKey,
            });

            dispatch(selectOrganization(organizationId));
            dispatch(loadOrgApiKeys(organizationId));
        } catch (err) {
            dispatch({
                type: ERROR_CREATE_APIKEY,
                errorType: 'apiKey',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_CREATE_APIKEY,
            });
        }
    }
}

export function selectApiKey(apiKeyId) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;

        dispatch({
            type: START_GET_APIKEY,
        });

        try {
            const apiKey = await API.getApiKey(organizationId, apiKeyId);

            dispatch({
                type: SELECT_APIKEY,
                apiKey: apiKey,
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_APIKEY,
                errorType: 'apiKey',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_APIKEY,
            });
        }
    }
}

export function editApiKey(apiKey) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;

        dispatch({
            type: START_UPDATE_APIKEY,
        });

        try {
            const editedKey = await API.editApiKey(organizationId, apiKey);

            dispatch({
                type: SELECT_APIKEY,
                apiKey: editedKey,
            });

            dispatch(loadOrgApiKeys(organizationId));
            dispatch(edited());
        } catch (err) {
            dispatch({
                type: ERROR_UPDATE_APIKEY,
                errorType: 'apiKey',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_UPDATE_APIKEY,
            });
        }
    }
}

export function deleteApiKey(apiKeyId) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;

        dispatch({
            type: START_UPDATE_APIKEY,
        });

        try {
            await API.deleteApiKey(organizationId, apiKeyId);

            dispatch(selectOrganization(organizationId));
            dispatch(loadOrgApiKeys(organizationId));
        } catch (err) {
            dispatch({
                type: ERROR_UPDATE_APIKEY,
                errorType: 'apiKey',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_UPDATE_APIKEY,
            });
        }
    }
} 
