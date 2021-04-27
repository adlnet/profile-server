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
import { useHistory } from "react-router-dom";

import ErrorValidation from '../controls/errorValidation';
import CancelButton from '../controls/cancelButton';
import { isValidIRI } from '../fields/Iri';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';

export default function CreateOrgForm({ initialValues, onSubmit }) {
    const history = useHistory();

    const formValidation = (values) => {
        const errors = {};
        if (!values.name) errors.name = 'Required';
        if (!values.collaborationLink) errors.collaborationLink = 'Required';
        if (values.collaborationLink) {
            if (!isValidIRI(values.collaborationLink)) errors.collaborationLink = 'Collaboration link needs to be a URL.';
        }
        return errors;
    }

    return (
        <Formik
            initialValues={initialValues || { name: '', description: '', collaborationLink: '' }}
            validate={formValidation}
            validateOnMount={true}
            onSubmit={(values) => {
                onSubmit(values);
            }}
        >
            {(props) => (<>
                <div className="grid-container border-1px border-base-lighter padding-bottom-4 padding-left-4 margin-bottom-2">
                    <div className="grid-row">
                        <h2 className="grid-col-5 margin-bottom-0">Working Group Details</h2>
                        <div className="grid-col">
                            <div className="margin-top-3">
                                <span className="text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                            </div>
                        </div>
                    </div>
                    <form className="usa-form">
                        <fieldset className="usa-fieldset">
                            <ErrorValidation name="name" type="input">
                                <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span> <span className="details-label">Working group Name</span></label>
                                <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                            </ErrorValidation>

                            <label className="usa-label" htmlFor="description"><span className="details-label"> Description</span></label>
                            <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />

                            <ErrorValidation name="collaborationLink" type="input">
                                <label className="usa-label" htmlFor="collaborationLink">
                                    <span className="text-secondary">*</span>
                                    <span className="details-label"> Link to where this group collaborates</span>
                                </label>
                                <Field name="collaborationLink" component="textarea" rows="3" className="usa-input" id="input-collaborationLink" aria-required="true" />
                            </ErrorValidation>

                        </fieldset>
                    </form>
                </div>
                <ValidationControlledSubmitButton errors={props.errors} className="usa-button submit-button" type="button" onClick={props.handleSubmit}>{initialValues ? 'Save Changes' : 'Create Working Group'}</ValidationControlledSubmitButton>
                <CancelButton className="usa-button usa-button--unstyled" type="reset" cancelAction={() => history.goBack()} />
            </>)}
        </Formik>
    );
}
