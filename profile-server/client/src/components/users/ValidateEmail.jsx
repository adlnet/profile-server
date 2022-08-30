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
import { useHistory } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import ErrorValidation from '../controls/errorValidation';
import { useDispatch, useSelector } from 'react-redux';
import * as user_actions from "../../actions/user";
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';

const recaptchaRef = React.createRef();

export default function ValidateEmail(props) {
    let dispatch = useDispatch();
    let history = useHistory();
    let userData = useSelector((store) => store.userData)
    const [showConfirmation, setShowConfirmation] = useState(false);

    const initialValues = { 
        validationCode: ""
    };

    const validationSchema = Yup.object().shape({
        validationCode: Yup.string().required()
    });

    function goToResend() {
        history.push('./resend');
    }

    function attemptValidation(values) {
        dispatch(user_actions.attemptValidation(values));
    }

    return (
            <>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnchange={false}
                    validateOnMount={true}
                    onSubmit={(values) => {
                        attemptValidation(values);
                    }}
                >
                    {(formikProps) => (
                        <div className="display-flex flex-column flex-align-center margin-top-5">
                            <Form className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                                <div className="grid-row ">
                                    <h2 className="margin-y-05">Email Validation</h2>
                                </div>
                                <div className="grid-row">
                                    <div>You will receive a validation code sent to the email address provided. If you have received a validation code, please enter it below.</div>
                                </div>
                                <fieldset className="usa-fieldset">

                                    <ErrorValidation name="validationCode" type="input">
                                        <label className="usa-label" htmlFor="email"><span className="details-label">Validation Code</span></label>
                                        <Field name="validationCode" type="text" className="usa-input" id="input-validationCode" aria-required="true" />
                                    </ErrorValidation>

                                    <div className="grid-row">
                                        <ValidationControlledSubmitButton errors={formikProps.errors} className="usa-button submit-button" type="submit" >
                                            Submit Validation Code
                                        </ValidationControlledSubmitButton>
                                    </div>
                                    <div className="grid-row">
                                        <p>
                                            Need to <a onClick={() => goToResend()} className="usa-link" type="reset">resend your code?</a>
                                        </p>
                                    </div>
                                </fieldset>
                                {
                                    userData.loginFeedback && <div className="usa-error-message padding-right-1"><p>{userData.loginFeedback}</p></div>
                                }
                            </Form>
                        </div>
                    )}
                </Formik>
            </>
    );
}