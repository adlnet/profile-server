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
import { useDispatch, useSelector } from 'react-redux';
import api from "../../api";
import * as user_actions from "../../actions/user";
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';
import ReCAPTCHA from 'react-google-recaptcha';

const recaptchaRef = React.createRef();

export default function SelectUsername(props) {
    let dispatch = useDispatch();
    let userData = useSelector((store) => store.userData)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const alreadyHasUsername = userData.user.usernameChosen;

    async function setUsername(setRequest) {
        dispatch(user_actions.setUsername(setRequest));
    }

    const initialValues = { 
        username: "", 
        recaptcha: ""
    };

    const validationDefinition = {
        username: Yup.string().required(),
        recaptcha: Yup.string().required()
    }

    if (process.env.REACT_APP_SKIP_RECAPTCHA) {
        delete initialValues.recaptcha;
        delete validationDefinition.recaptcha;
    }

    const validationSchema = Yup.object().shape(validationDefinition);

    return (

        alreadyHasUsername ? 
            <div className="display-flex flex-column flex-align-center margin-top-5">
                <div className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                    <div className="grid-row ">
                        <h2 className="margin-y-05">Username Already Chosen</h2>
                    </div>
                    <div className="grid-row margin-top-4">
                        <div>
                            You have already chosen your username, this can only be done once.
                        </div>
                    </div>
                </div>
            </div>
            :

        showConfirmation ?
            <div className="display-flex flex-column flex-align-center margin-top-5">
                <div className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                    <div className="grid-row ">
                        <h2 className="margin-y-05">Select Username</h2>
                    </div>
                    <div className="grid-row margin-top-4">
                        <div>
                            Thanks for choosing your username!
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
                    onSubmit={async(values) => {
                        setUsername(values);
                    }}
                >
                    {(formikProps) => (
                        <div className="display-flex flex-column flex-align-center margin-top-5">
                            <Form className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "30em" }}>
                                <div className="grid-row ">
                                    <h2 className="margin-y-05">Select Username</h2>
                                </div>
                                <div className="grid-row">
                                    <div>This service has recently implemented usernames.  Please enter the username you would like to have.</div>
                                    <br/>
                                    <div>You can only set this <b>*once*</b>, so do pick carefully.</div>
                                </div>
                                <fieldset className="usa-fieldset">

                                    <ErrorValidation name="username" type="input">
                                        <label className="usa-label" htmlFor="username"><span className="details-label">Username</span></label>
                                        <Field name="username" type="text" className="usa-input" id="input-username" aria-required="true" />
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
                                            Request Username
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