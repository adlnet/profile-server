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
import React, { useEffect, useState } from 'react'
import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import ErrorValidation from '../controls/errorValidation';
import api from '../../api';
import CancelButton from '../controls/cancelButton';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';

export default function CreateWebHookForm({ initialValues, onSubmit, onCancel }) {

    let defaults = {
        uuid: require('uuid').v4(),
        target: '',
        event: "profilePublished",
        signatureMethod: "none",
        clientSecret: "",
        isEnabled: true,
        description: '',
    };

    let [subjects, setSubjects] = useState([])
    useEffect(() => {

        api.getWebHookSubjects().then((subjects) => setSubjects(subjects));

        return function cleanup() {

        }
    }, []);

    return (<>
        <Formik
            initialValues={initialValues || defaults}
            validationSchema={Yup.object({
                description: Yup.string()
                    .required('Required'),
            })
                .test(
                    'permissionsTest',
                    null,
                    (obj) => {
                        return true;

                    }
                )}
            validateOnMount={true}
            onSubmit={(values) => {
                onSubmit(values);
            }}
        >
            {(formikProps) => (<>
                <div className="border-1px border-base-lighter padding-bottom-4 padding-left-4">
                    <div className="grid-row">
                        <h3 className="grid-col-5">Webhook Details</h3>
                        <div className="grid-col">
                            <div className="margin-top-3">
                                <span className="text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                            </div>
                        </div>
                    </div>
                    <form className="usa-form">

                        <ErrorValidation name="target" type="input">
                            <label className="usa-label" htmlFor="target">
                                <div className="margin-bottom-05"><span className="text-secondary">*</span><span className="details-label">Webhook Target</span></div>
                                <div className="text-thin text-base font-sans-3xs">The URL where the hook payload will be sent</div>
                            </label>
                            <Field name="target" type="text" className="usa-input" id="input-target" aria-required="true" />
                        </ErrorValidation>

                        <ErrorValidation name="description" type="input">
                            <label className="usa-label" htmlFor="description">
                                <div className="margin-bottom-05"><span className="text-secondary">*</span><span className="details-label">Webhook Description</span></div>
                                <div className="text-thin text-base font-sans-3xs">Enter a descriptive name to help identify this webhook later.</div>
                            </label>
                            <Field name="description" type="text" className="usa-input" id="input-description" aria-required="true" />
                        </ErrorValidation>

                        <label className="usa-label" htmlFor="clientSecret">
                            <div className="margin-bottom-05"><span className="details-label">Client Secret</span></div>
                            <div className="text-thin text-base font-sans-3xs">Some webhook consumers will provide you with a secret value. Place it here.</div>
                        </label>
                        <Field name="clientSecret" type="text" className="usa-input" id="input-clientSecret" aria-required="true" />

                        {false && <div className="grid-row">
                            <div className="grid-col-6">
                                <label className="usa-label details-label" htmlFor="event">
                                    <span>Event</span>
                                </label>
                                <Field
                                    name="event" component="select" value={formikProps.values.event} onChange={formikProps.handleChange} rows="3"
                                    className="usa-select" id="event" aria-required="true"
                                >
                                    <option value="profilePublished">Profile Published</option>
                                    <option value="profileCreated">Profile Created</option>
                                </Field>
                            </div>
                        </div>}

                        <div className="grid-row">
                            <div className="grid-col-6">
                                <label className="usa-label details-label" htmlFor="subject">
                                    <span>Profile</span>
                                </label>
                                <Field
                                    name="subject" component="select" value={formikProps.values.subject} onChange={formikProps.handleChange} rows="3"
                                    className="usa-select" id="subject" aria-required="true"
                                >
                                    <option value=""></option>
                                    {subjects.map((i, j) => <option key={j} value={i.parentProfile}>{i.name}</option>)}
                                </Field>
                            </div>
                        </div>



                        <div className="grid-row">
                            <div className="grid-col-6">
                                <label className="usa-label details-label" htmlFor="signatureMethod">
                                    <span>Signature Method</span>
                                </label>
                                <Field
                                    name="signatureMethod" component="select" value={formikProps.values.signatureMethod} onChange={formikProps.handleChange} rows="3"
                                    className="usa-select" id="signatureMethod" aria-required="true"
                                >
                                    <option value="none">None</option>
                                    <option value="sha1">SHA1</option>
                                    <option value="sha256">SHA256</option>
                                </Field>
                            </div>
                        </div>

                        <div className="grid-row">
                            <div className="grid-col-6">
                                <label className="usa-label details-label" htmlFor="isEnabled">
                                    <span>Status</span>
                                </label>
                                <Field
                                    name="isEnabled" component="select" value={formikProps.values.isEnabled} onChange={formikProps.handleChange} rows="3"
                                    className="usa-select" id="isEnabled" aria-required="true"
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </Field>
                            </div>
                        </div>
                    </form>
                </div>
                <ValidationControlledSubmitButton
                    errors={formikProps.errors}
                    className="usa-button submit-button"
                    type="button"
                    onClick={formikProps.handleSubmit}>
                    {
                        initialValues ? "Save Changes" : "Create Webhook"
                    }
                </ValidationControlledSubmitButton>
                <CancelButton className="usa-button usa-button--unstyled" type="reset" cancelAction={onCancel} />
            </>)}
        </Formik>
    </>
    )
}
