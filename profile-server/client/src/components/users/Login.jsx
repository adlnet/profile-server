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
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import ErrorValidation from '../controls/errorValidation';
import { useDispatch, useSelector } from 'react-redux';
import * as user_actions from "../../actions/user";
import api from "../../api";
import { useState } from 'react';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';

var CryptoJS = require("crypto-js");

export default function Login(props) {
    let dispatch = useDispatch();
    let userData = useSelector((store) => store.userData)
    const history = useHistory();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    function forgotPassword() {
        history.push('./forgotpassword')
    }
    function createAccount() {
        history.push('./create')
    }
    function goToResendPage() {
        history.push('./resend')
    }

    async function signIn(values) {
        let salt = await api.getSalt(values.email);
        salt = CryptoJS.enc.Utf8.parse(salt);
        var key512Bits = CryptoJS.PBKDF2(values.password, salt, { hasher: CryptoJS.algo.SHA256, keySize: 4, iterations: 10000 });
        values.password = key512Bits.toString(CryptoJS.enc.Hex)

        dispatch(user_actions.login(values, location));
    }

    return (<>
        <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={Yup.object({
                email: Yup.string().email().required('Required'),
                password: Yup.string().required('Required'),
            })}

            onSubmit={(values) => {
                signIn(values);
            }}
        >
            {(formikProps) => (
                <div className="display-flex flex-column flex-align-center margin-top-5">
                    <Form className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                        <div className="grid-row ">
                            <h2 className="margin-y-05">Sign In</h2>
                        </div>
                        <div className="grid-row">
                            <div>or <button className="usa-button usa-button--unstyled" style={{ marginTop: 0 }} type="button" onClick={() => createAccount()}>create an account</button></div>
                        </div>
                        <fieldset className="usa-fieldset">

                            <ErrorValidation name="email" type="input">
                                <label className="usa-label" htmlFor="email"><span className="text-secondary">*</span> <span className="details-label">Email Address</span></label>
                                <Field name="email" type="text" className="usa-input" id="input-email" aria-required="true" />
                            </ErrorValidation>

                            <ErrorValidation name="password" type="input">
                                <label className="usa-label" htmlFor="password"><span className="text-secondary">*</span> <span className="details-label">Password</span></label>
                                <Field name="password" type={showPassword ? "text" : "password"} className="usa-input" id="input-password" aria-required="true" />
                            </ErrorValidation>
                            <div className="display-flex flex-column flex-align-end">
                                <button onClick={() => setShowPassword(!showPassword)} className="usa-button usa-button--unstyled" style={{ marginTop: "0.5em" }} type="button">Show password</button>
                            </div>
                            <div className="grid-row">
                                <ValidationControlledSubmitButton errors={formikProps.errors} className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>
                                    Sign in
                                </ValidationControlledSubmitButton>
                            </div>
                            <div className="grid-row">
                                <p>
                                    <a onClick={() => forgotPassword()} className="usa-link" type="reset">Forgot your password?</a>
                                    &nbsp; Need to &nbsp;
                                    <a onClick={() => goToResendPage()} className="usa-link" type="reset">validate your email?</a>
                                </p>
                            </div>
                        </fieldset>
                    </Form>
                </div>
            )}

        </Formik>
        {
            userData.loginFeedback &&
            <div className="display-flex flex-column flex-align-center margin-top-5">
                <div className="usa-error-message padding-x-4"><p>{userData.loginFeedback}</p></div>
            </div>
        }
    </>
    );
}