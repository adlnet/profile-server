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
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import ErrorValidation from '../controls/errorValidation';
import { useDispatch, useSelector } from 'react-redux';
import * as user_actions from "../../actions/user";

export default function CreateAccount(props) {
    let dispatch = useDispatch();
    let userData = useSelector((store) => store.userData)
    const history = useHistory();
    const [showPassword, setShowPassword] = useState(false);

    async function createAccount(createRequest) {
        dispatch(user_actions.createAccount(createRequest))
    }

    function login() {
        history.push('./login')
    }


    return (<>
        <Formik
            initialValues={{ firstname: '', lastname: '', email: '', password: '', password2: '' }}
            validationSchema={Yup.object({
                firstname: Yup.string()
                    .required('Required'),
                lastname: Yup.string()
                    .required('Required'),
                email: Yup.string()
                    .required('Required'),
                password: Yup.string()
                    .required('Required'),
                password2: Yup.string()
                    .oneOf([Yup.ref('password'), null], "Passwords don't match")
                    .required('Required'),
            })}
            onSubmit={(values) => {
                createAccount(values);
            }}
        >
            {(formikProps) => (
                <div className="display-flex flex-column flex-align-center margin-top-5">
                    <Form className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                        <div className="grid-row ">
                            <h2 className="margin-y-05">Create Account</h2>
                        </div>
                        <div className="grid-row">
                            <div>
                                Already have an account? <button className="usa-button usa-button--unstyled" style={{ marginTop: 0 }} type="button" onClick={() => login()}>Sign in</button></div>
                        </div>
                        <fieldset className="usa-fieldset">

                            <ErrorValidation name="firstname" type="input">
                                <label className="usa-label" htmlFor="firstname"><span className="details-label">first name</span></label>
                                <Field name="firstname" type="text" className="usa-input" id="input-firstname" aria-required="true" />
                            </ErrorValidation>

                            <ErrorValidation name="lastname" type="input">
                                <label className="usa-label" htmlFor="lastname"><span className="details-label">last name</span></label>
                                <Field name="lastname" type="text" className="usa-input" id="input-lastname" aria-required="true" />
                            </ErrorValidation>

                            <ErrorValidation name="email" type="input">
                                <label className="usa-label" htmlFor="email"><span className="details-label">Email address</span></label>
                                <Field name="email" type="text" className="usa-input" id="input-email" aria-required="true" />
                            </ErrorValidation>

                            <ErrorValidation name="password" type="input">
                                <label className="usa-label" htmlFor="password"><span className="details-label">Password</span></label>
                                <Field name="password" type={showPassword ? "text" : "password"} className="usa-input" id="input-password" aria-required="true" />
                            </ErrorValidation>

                            <ErrorValidation name="password2" type="input">
                                <label className="usa-label" htmlFor="password2"><span className="details-label">Re-enter new Password</span></label>
                                <Field name="password2" type={showPassword ? "text" : "password"} className="usa-input" id="input-password" aria-required="true" />
                            </ErrorValidation>
                            <div className="display-flex flex-column flex-align-end">
                                <button onClick={() => setShowPassword(!showPassword)} className="usa-button usa-button--unstyled" style={{ marginTop: "0.5em" }} type="button">Show password</button>
                            </div>
                            <button className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>
                                Create Account
                            </button>
                        </fieldset>
                    </Form>
                </div>
            )}

        </Formik>
        {
            userData.createFeedback && <div className="usa-error-message padding-right-1"><p>{userData.createFeedback}</p></div>
        }
    </>
    );
}