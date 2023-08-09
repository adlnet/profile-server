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
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import ErrorValidation from '../controls/errorValidation';
import { useSelector } from 'react-redux';
import api from "../../api";
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';
import ReCAPTCHA from 'react-google-recaptcha';

const recaptchaRef = React.createRef();

export default function RequestPasswordReset(props) {
    let userData = useSelector((store) => store.userData)
    const [showConfirmation, setShowConfirmation] = useState(false);

    const initialValues = { 
        email: "", 
        recaptcha: ""
    };

    const validationDefinition = {
        email: Yup.string().required(),
        recaptcha: Yup.string().required()
    }

    if (process.env.REACT_APP_SKIP_RECAPTCHA) {
        delete initialValues.recaptcha;
        delete validationDefinition.recaptcha;
    }

    const validationSchema = Yup.object().shape(validationDefinition);

    return (

        showConfirmation ?
            <div className="display-flex flex-column flex-align-center margin-top-5">
                <div className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                    <div className="grid-row ">
                        <h2 className="margin-y-05">Request password reset</h2>
                    </div>
                    <div className="grid-row margin-top-4">
                        <div>
                            If your email matches an account in our system, an email will be sent to you.
                            Check your email for a link to reset your password.
                        </div>
                    </div>
                </div>
            </div>
            :
            <>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnchange={false}
                    validateOnMount={true}
                    onSubmit={(values) => {
                        //dispatch(... something about request password reset)
                        setShowConfirmation(true);
                        api.postJSON("/app/user/forgot", values);
                    }}
                >
                    {(formikProps) => (
                        <div className="display-flex flex-column flex-align-center margin-top-5">
                            <Form className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                                <div className="grid-row ">
                                    <h2 className="margin-y-05">Request password reset</h2>
                                </div>
                                <div className="grid-row">
                                    <div>Please enter your email address.</div>
                                </div>
                                <fieldset className="usa-fieldset">

                                    <ErrorValidation name="email" type="input">
                                        <label className="usa-label" htmlFor="email"><span className="details-label">Email Address</span></label>
                                        <Field name="email" type="text" className="usa-input" id="input-email" aria-required="true" />
                                    </ErrorValidation>

                                    {
                                        !process.env.REACT_APP_SKIP_RECAPTCHA &&
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                            onChange={(value) => {
                                                formikProps.setFieldValue("recaptcha", value);
                                            }}
                                        />
                                    }

                                    <div className="grid-row">
                                        <ValidationControlledSubmitButton errors={formikProps.errors} className="usa-button submit-button" type="submit" >
                                            Request password reset
                                        </ValidationControlledSubmitButton>
                                    </div>
                                </fieldset>
                            </Form>
                        </div>
                    )}

                </Formik>
                {
                    userData.loginFeedback && <div className="usa-error-message padding-right-1"><p>{userData.loginFeedback}</p></div>
                }
            </>
    );
}