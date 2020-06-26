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
import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import ErrorValidation from '../controls/errorValidation';
import Iri from '../fields/Iri';
import Tags from '../fields/Tags';
import Translations from '../fields/Translations';

export default function CreateProfileForm({ initialValue, handleSubmit, handleCancel }) {


    return (
        <Formik
            initialValues={initialValue || {
                hasIRI: false, iri: '', name: '', description: '', translations: [], moreInformation: '', tags: [],
            }}
            validationSchema={Yup.object({
                hasIRI: Yup.boolean(),
                iri: Yup.string()
                    .when("hasIRI", {
                    is: true,
                    then: Yup.string().required('Required')
                    }),
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required'),
            })}
            onSubmit={(values) => {
                handleSubmit(values);
            }}
        >
            {(formikProps) => (<>
                <div className="grid-container border-1px border-base-lighter padding-bottom-4 padding-left-4">
                    <div className="grid-row">
                        <h2 className="grid-col-5">Profile Details</h2>
                        <div className="grid-col">
                            <div className="margin-top-3">
                                <span className="text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                            </div>
                        </div>
                    </div>
                    <form className="usa-form">
                        <Iri message="This profile already has an IRI that is used in xAPI statements" {...formikProps} />

                        <ErrorValidation name="name" type="input">
                            <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span><span className="details-label"> Name</span></label>
                            <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                        </ErrorValidation>

                        <ErrorValidation name="description" type="input">
                            <label className="usa-label" htmlFor="description"><span className="text-secondary">*</span><span className="details-label"> Description</span></label>
                            <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
                        </ErrorValidation>

                        <label className="usa-label" htmlFor="translations"><span className="details-label">Translations</span></label>
                        <Field name="translations" component={Translations} id="translations" />

                        <label className="usa-label" htmlFor="moreInformation"><span className="details-label">More Information</span></label>
                        <Field name="moreInformation" type="text" className="usa-input" id="input-moreInformation" />

                        <label className="usa-label" htmlFor="tags">
                            <span className="details-label">Tags</span> <br />
                            <span className="usa-hint font-ui-3xs">Put a comma between each one. Example: <strong>tag 1, tag 2, tag 3</strong></span>
                        </label>
                        <Field name="tags" component={Tags} className="usa-input" id="input-tags" />
                    </form>
                </div>
                <button className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>
                    {
                        initialValue ? "Save Changes" : "Create Profile"
                    }
                </button>
                <button onClick={handleCancel} className="usa-button usa-button--unstyled" type="reset"><b>Cancel</b></button>
                    
            </>)}
        </Formik>
    )
}
