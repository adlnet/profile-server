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
export const LOGIN_FAILED = 'LOGIN_FAILED';

export const START_LOGOUT = 'START_LOGOUT';
export const FINISH_LOGOUT = 'FINISH_LOGOUT';
export const ERROR_LOGOUT = 'ERROR_LOGOUT';

export const START_CREATE = 'START_CREATE';
export const FINISH_CREATE = 'FINISH_CREATE';
export const ERROR_CREATE = 'ERROR_CREATE';

export const START_VALIDATE = 'START_VALIDATE';
export const FINISH_VALIDATE = 'FINISH_VALIDATE';
export const ERROR_VALIDATE = 'ERROR_VALIDATE';

export const START_SET_USERNAME = 'START_SET_USERNAME';
export const FINISH_SET_USERNAME = 'FINISH_SET_USERNAME';
export const ERROR_SET_USERNAME = 'ERROR_SET_USERNAME';

export const START_CHECK = 'START_CHECK';
export const FINISH_CHECK = 'FINISH_CHECK';
export const ERROR_CHECK = 'ERROR_CHECK';


export function logout() {
    return async function (dispatch) {
        dispatch({
            type: START_LOGOUT,
        });
        try {
            await API.logout();
        } catch (err) {
            dispatch({
                type: ERROR_LOGOUT,
                error: "error logging out",
                errorType: 'user',
            });
        } finally {
            dispatch({
                type: FINISH_LOGOUT,
            });
            window.location.reload();
        }

        //checkStatus()(dispatch);
    };
}
export function checkStatus() {
    return async function (dispatch) {
        dispatch({
            type: START_CHECK,
        });

        let statusResponse;
        try {
            statusResponse = await API.getUserStatus();
        } catch (err) {
            dispatch({
                type: ERROR_CHECK,
                error: err.message,
                errorType: 'user',
            });
        } finally {
            dispatch({
                type: FINISH_CHECK,
                user: statusResponse.user,
            });
        }

        return statusResponse.loggedIn;
    };
}

export function checkUsernameStatus() {
    return async function (dispatch) {
        dispatch({
            type: START_CHECK,
        });

        let statusResponse;
        let usernameChosen = false;
        try {
            statusResponse = await API.getUserStatus();
            usernameChosen = statusResponse.user.usernameChosen;
        } catch (err) {
            dispatch({
                type: ERROR_CHECK,
                error: err.message,
                errorType: 'user',
            });
        } finally {
            dispatch({
                type: FINISH_CHECK,
                user: statusResponse.user,
            });
        }

        return usernameChosen;
    };
}

export function login(loginRequest, redirectto) {
    return async function (dispatch) {
        dispatch({
            type: START_LOGIN,
        });

        let loginResult;
        let loggedIn
        try {
            loginResult = await API.login(loginRequest);

            if (!loginResult.success) {
                return batch(() => {
                    dispatch({
                        type: LOGIN_FAILED,
                        error: loginResult.err,
                    });

                    dispatch({
                        type: FINISH_LOGIN,
                    });
                });
            }
            loggedIn = await checkStatus()(dispatch);
        } catch (err) {
            dispatch({
                type: LOGIN_FAILED,
                error: err.message,
                errorType: 'user'
            });
        }
        if (loggedIn) {

            let hasUsername = await checkUsernameStatus()(dispatch);
            if (hasUsername) {
                history.push(redirectto.originurl || '/')
            }
            else {
                history.push(redirectto.originurl || '/user/username')
            }

            dispatch({
                type: FINISH_LOGIN,
            });
        }
        else
            return dispatch({
                type: LOGIN_FAILED,
                error: "Somehow, the cookie is not set",
            });

    };
}



export function createAccount(createRequest) {
    return async function (dispatch) {
        dispatch({
            type: START_CREATE,
        });

        let createResult;
        try {
            createResult = await API.createUser(createRequest);
            if (!createResult.success) {

                if (window.grecaptcha != undefined && window.grecaptcha.reset != undefined) {
                    window.grecaptcha.reset();
                }

                return batch(() => {
                    dispatch({
                        type: ERROR_CREATE,
                        error: createResult.err,
                    });

                    dispatch({
                        type: FINISH_CREATE,
                    });
                });
            }
        } catch (err) {

            if (window.grecaptcha != undefined && window.grecaptcha.reset != undefined) {
                window.grecaptcha.reset();
            }
            
            return batch(() => {
                dispatch({
                    type: ERROR_CREATE,
                    error: err.message,
                    errorType: 'Create Account'
                });

                dispatch({
                    type: FINISH_CREATE,
                });
            });
        }
        dispatch({
            type: FINISH_CREATE,
        });

        // history.push('./login');
        history.push('./validate');
    };
}

export function resendValidation(values) {
    return async function (dispatch) {
        dispatch({
            type: START_VALIDATE,
        });

        let validateResult;
        try {
            validateResult = await API.resendValidation(values);
            if (!validateResult.success) {

                return batch(() => {
                    dispatch({
                        type: ERROR_VALIDATE,
                        error: validateResult.err,
                    });

                    dispatch({
                        type: FINISH_VALIDATE,
                    });
                });
            }
        } catch (err) {

            return batch(() => {
                dispatch({
                    type: ERROR_VALIDATE,
                    error: err.message,
                    errorType: 'Validate Account'
                });

                dispatch({
                    type: FINISH_VALIDATE,
                });
            });
        }
        dispatch({
            type: FINISH_VALIDATE,
        });

        history.push('./validate');
    };
}

export function attemptValidation(values) {
    return async function (dispatch) {
        dispatch({
            type: START_VALIDATE,
        });

        let loggedIn = false;
        try {
            let validateResult = await API.attemptValidation(values);
            if (!validateResult.success) {

                return batch(() => {
                    dispatch({
                        type: ERROR_VALIDATE,
                        error: validateResult.err,
                    });

                    dispatch({
                        type: FINISH_VALIDATE,
                    });
                });
            }
            loggedIn = await checkStatus()(dispatch);
        } catch (err) {
            return dispatch({
                type: ERROR_VALIDATE,
                error: err.message,
                errorType: 'Account Validation'
            });
        }

        if (loggedIn) {

            history.push('/')
            dispatch({
                type: FINISH_LOGIN,
            });
        }
        else
            return dispatch({
                type: LOGIN_FAILED,
                error: "Validation unsuccessful.",
            });

        dispatch({
            type: FINISH_VALIDATE,
        });
    };
}

export function setUsername(setRequest) {
    return async function (dispatch) {
        dispatch({
            type: START_SET_USERNAME,
        });

        let setResult;
        try {
            setResult = await API.setUsername(setRequest);
            if (!setResult.success) {

                if (window.grecaptcha != undefined && window.grecaptcha.reset != undefined) {
                    window.grecaptcha.reset();
                }

                return batch(() => {
                    dispatch({
                        type: ERROR_SET_USERNAME,
                        error: setResult.err,
                    });

                    dispatch({
                        type: FINISH_SET_USERNAME,
                    });
                });
            }
        } catch (err) {

            if (window.grecaptcha != undefined && window.grecaptcha.reset != undefined) {
                window.grecaptcha.reset();
            }
            
            return batch(() => {
                dispatch({
                    type: ERROR_SET_USERNAME,
                    error: err.message,
                    errorType: 'Set Username'
                });

                dispatch({
                    type: FINISH_SET_USERNAME,
                });
            });
        }
        dispatch({
            type: FINISH_SET_USERNAME,
        });

        history.push('/user/account')
    };
}

