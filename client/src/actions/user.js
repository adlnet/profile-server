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
import { batch } from 'react-redux';

export const START_LOGIN = 'START_LOGIN';
export const FINISH_LOGIN = 'FINISH_LOGIN';
export const ERROR_LOGIN = 'ERROR_LOGIN';

export const START_LOGOUT = 'START_LOGOUT';
export const FINISH_LOGOUT= 'FINISH_LOGOUT';
export const ERROR_LOGOUT = 'ERROR_LOGOUT';

export const START_CREATE = 'START_CREATE';
export const FINISH_CREATE= 'FINISH_CREATE';
export const ERROR_CREATE = 'ERROR_CREATE';

export const START_CHECK = 'START_CHECK';
export const FINISH_CHECK= 'FINISH_CHECK';
export const ERROR_CHECK = 'ERROR_CHECK';


export function logout() {
    return async function (dispatch) {
        dispatch({
            type: START_LOGOUT,
        });

        await API.logout();

        dispatch({
            type: FINISH_LOGOUT,
        });
        window.location.reload();
        //checkStatus()(dispatch);
    };
}
export function checkStatus() {
    return async function (dispatch) {
        dispatch({
            type: START_CHECK,
        });

        let user = await API.getUserStatus();

        dispatch({
            type: FINISH_CHECK,
            user: user.user,
        });
        return user.loggedIn;
    };
}

export function login(loginRequest) {
    return async function (dispatch) {
        dispatch({
            type: START_LOGIN,
        });

        let loginResult = await API.login(loginRequest);
        if(!loginResult.success)
        {
            return batch(() => { 
                dispatch({
                    type: ERROR_LOGIN,
                    err: loginResult.err,
                });

                dispatch({
                    type: FINISH_LOGIN,
                });
            });
        }
        let loggedIn = await checkStatus()(dispatch);
        if(loggedIn)
            history.push('/')
        else
            return dispatch({
                type: ERROR_LOGIN,
                err: "Somehow, the cookie is not set",
            });

        dispatch({
            type: FINISH_LOGIN,
        });
    };
}



export function createAccount(createRequest) {
    return async function (dispatch) {
        dispatch({
            type: START_CREATE,
        });

        let createResult = await API.createUser(createRequest);
        if(!createResult.success)
        {
            return batch(() => { 
                dispatch({
                    type: ERROR_CREATE,
                    err: createResult.err,
                });

                dispatch({
                    type: FINISH_CREATE,
                });
            });
        }
        dispatch({
            type: FINISH_CREATE,
        });
        
        history.push('./login')
      
    };
}
