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
import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import ErrorValidation from '../controls/errorValidation';
import { useDispatch, useSelector } from 'react-redux';
import * as user_actions from "../../actions/user"
import api from "../../api";
import { useState } from 'react';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';

var CryptoJS = require("crypto-js");

export default function ResetPassword(props) {
    let dispatch = useDispatch();
    let userData = useSelector((store) => store.userData)
    const history = useHistory();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [errorType, setErrorType] = useState("user");

    const [error, setError] = useState();

    useEffect(async () => {
        var urlParams = new URLSearchParams(window.location.search);
        let key = urlParams.get("key");
        let keyValid = await api.checkResetKey(key);
        if (!keyValid) {
            setError("The reset key you provided is no longer valid");
            setErrorType("block")
        }
    }, [])

    async function signIn(loginRequest) {
        let salt = await api.getSalt(loginRequest.email);
        salt = CryptoJS.enc.Utf8.parse(salt);
        var key512Bits = CryptoJS.PBKDF2(loginRequest.password, salt, { hasher: CryptoJS.algo.SHA256, keySize: 4, iterations: 10000 });
        loginRequest.password = key512Bits.toString(CryptoJS.enc.Hex)

        dispatch(user_actions.login(loginRequest, location));
    }

    return (
        error && errorType === "block" ?
            <div className="display-flex flex-column flex-align-center margin-top-5">
                <div className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                    <div className="grid-row ">
                        <h2 className="margin-y-05">There was an error</h2>
                    </div>
                    <div className="grid-row margin-top-4">
                        <div>
                            {error}
                        </div>
                    </div>
                </div>
            </div>
            :
            <>
                <Formik
                    initialValues={{ password: '', password2: '' }}
                    validationSchema={Yup.object({
                        password: Yup.string()
                            .required('Required'),
                        password2: Yup.string()
                            .oneOf([Yup.ref('password'), null], "Passwords don't match")
                            .required('Required'),
                    })}
                    validateOnMount={true}
                    onSubmit={async (values) => {
                        var urlParams = new URLSearchParams(window.location.search);
                        values.key = urlParams.get("key");

                        let res = await api.postJSON("/app/user/reset", values);
                        if (res.success) {
                            history.push("/user/login")
                        } else {

                            setError(res.message);
                            setErrorType("user")
                        }
                    }}
                >
                    {(formikProps) => (
                        <div className="display-flex flex-column flex-align-center margin-top-5">
                            <Form className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                                <div className="grid-row ">
                                    <h2 className="margin-y-05">Reset Password</h2>
                                </div>
                                <fieldset className="usa-fieldset">
                                    <ErrorValidation name="password" type="input">
                                        <label className="usa-label" htmlFor="password"><span className="text-secondary">*</span> <span className="details-label">New Password</span></label>
                                        <Field name="password" type={showPassword ? "text" : "password"} className="usa-input" id="input-password" aria-required="true" />
                                    </ErrorValidation>
                                    <ErrorValidation name="password2" type="input">
                                        <label className="usa-label" htmlFor="password2"><span className="text-secondary">*</span> <span className="details-label">Re-enter new Password</span></label>
                                        <Field name="password2" type={showPassword ? "text" : "password"} className="usa-input" id="input-password" aria-required="true" />
                                    </ErrorValidation>
                                    <div className="display-flex flex-column flex-align-end">
                                        <button onClick={() => setShowPassword(!showPassword)} className="usa-button usa-button--unstyled" style={{ marginTop: "0.5em" }} type="button">Show my typing</button>
                                    </div>
                                    <div className="grid-row">
                                        <ValidationControlledSubmitButton errors={formikProps.errors} className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>
                                            Reset password
                                        </ValidationControlledSubmitButton>
                                    </div>
                                </fieldset>
                            </Form>
                        </div>
                    )}

                </Formik>
                {
                    error && errorType === "user" && <div className="usa-error-message padding-right-1"><p>{error}</p></div>
                }
            </>
    );
}