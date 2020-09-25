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


export const START_GET_WEBHOOKS = 'START_GET_WEBHOOKS';
export const START_GET_WEBHOOK = 'START_GET_WEBHOOK';
export const START_CREATE_WEBHOOK = 'START_CREATE_WEBHOOK';
export const START_UPDATE_WEBHOOK = 'START_UPDATE_WEBHOOK';
export const START_DELETE_WEBHOOK = 'START_DELETE_WEBHOOK';

export const FINISH_GET_WEBHOOKS = 'FINISH_GET_WEBHOOKS';
export const FINISH_GET_WEBHOOK = 'FINISH_GET_WEBHOOK';
export const FINISH_CREATE_WEBHOOK = 'FINISH_CREATE_WEBHOOK';
export const FINISH_UPDATE_WEBHOOK = 'FINISH_UPDATE_WEBHOOK';
export const FINISH_DELETE_WEBHOOK = 'FINISH_DELETE_WEBHOOK';

export const ERROR_GET_WEBHOOKS = 'ERROR_GET_WEBHOOKS';
export const ERROR_GET_WEBHOOK = 'ERROR_GET_WEBHOOK';
export const ERROR_CREATE_WEBHOOK = 'ERROR_CREATE_WEBHOOK';
export const ERROR_UPDATE_WEBHOOK = 'ERROR_UPDATE_WEBHOOK';
export const ERROR_DELETE_WEBHOOK = 'ERROR_DELETE_WEBHOOK';

export const SELECT_WEBHOOK = 'SELECT_WEBHOOK';


export function loadOrgWebHooks() {
    return async function (dispatch) {
        dispatch({
            type: START_GET_WEBHOOKS,
        });

        let webHooks;
        try {
            webHooks = await API.getWebHooks();
        } catch (err) {
            dispatch({
                type: ERROR_GET_WEBHOOKS,
                errorType: 'webHooks',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_WEBHOOKS,
                webHooks: webHooks,
            });
        }
    }
}

export function createWebHook(webHook) {
    return async function (dispatch, getState) {
        const state = getState();
   

        dispatch({
            type: START_CREATE_WEBHOOK,
        });

        try {
            const editedKey = await API.createWebHook( webHook);

            dispatch({
                type: SELECT_WEBHOOK,
                webHook: editedKey,
            });

          
            dispatch(loadOrgWebHooks());
        } catch (err) {
            dispatch({
                type: ERROR_CREATE_WEBHOOK,
                errorType: 'webHook',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_CREATE_WEBHOOK,
            });
        }
    }
}

export function selectWebHook(webHookId) {
    return async function (dispatch, getState) {
        const state = getState();
        
        dispatch({
            type: START_GET_WEBHOOK,
        });

        try {
            const webHook = await API.getWebHook( webHookId);

            dispatch({
                type: SELECT_WEBHOOK,
                webHook: webHook,
                webHookId:webHookId
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_WEBHOOK,
                errorType: 'webHook',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_GET_WEBHOOK,
            });
        }
    }
}

export function editWebHook(webHook) {
    return async function (dispatch, getState) {
        const state = getState();
       

        dispatch({
            type: START_UPDATE_WEBHOOK,
        });

        try {
            const editedKey = await API.editWebHook(webHook);

            dispatch({
                type: SELECT_WEBHOOK,
                webHook: editedKey,
            });

            dispatch(loadOrgWebHooks());
        } catch (err) {
            dispatch({
                type: ERROR_UPDATE_WEBHOOK,
                errorType: 'webHook',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_UPDATE_WEBHOOK,
            });
        }
    }
}

export function deleteWebHook(webHookId) {
    return async function (dispatch, getState) {
        const state = getState();
      

        dispatch({
            type: START_UPDATE_WEBHOOK,
        });

        try {
            await API.deleteWebHook( webHookId);
            
       
            dispatch(loadOrgWebHooks());
        } catch (err) {
            dispatch({
                type: ERROR_UPDATE_WEBHOOK,
                errorType: 'webHook',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_UPDATE_WEBHOOK,
            });
        }
    }
} 
