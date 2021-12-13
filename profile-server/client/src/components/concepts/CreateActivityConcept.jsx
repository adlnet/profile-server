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

import BaseConceptFields from './BaseConceptFields';
import { Detail } from '../DetailComponents';
import { useSelector } from 'react-redux';
import CancelButton from '../controls/cancelButton';
import { isValidIRI } from '../fields/Iri';
import DeprecateButton from '../controls/deprecateButton';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';
import ErrorValidation from '../controls/errorValidation';
import DeleteButton from '../controls/DeleteButton';

export default function ActivityConcept({ initialValues, onCreate, onCancel, isPublished, onDeprecate, importedConcept, onDelete }) {
    const currentProfileVersion = useSelector(state => state.application.selectedProfile);

    const generatedIRIBase = currentProfileVersion.iri + "/activity/";

    const formValidation = (values) => {
        const errors = {};
        if (!values.name) errors.name = 'Required';
        if (!values.description) errors.description = 'Required';

        if (!initialValues || !initialValues.iri) {
            if (values.iriType === 'external-iri') {
                if (!values.extiri.trim()) errors.extiri = 'Required';
                if (!isValidIRI(values.extiri)) errors.extiri = 'IRI did not match expected format.';
            } else {
                if (!values.geniri.trim()) errors.geniri = 'Required';
                const geniri = generatedIRIBase + values.geniri;
                if (!isValidIRI(geniri)) errors.geniri = 'IRI did not match expected format.';
            }
        }

        if (!values.activityType) errors.activityType = 'Required';
        if (values.activityType && !isValidIRI(values.activityType)) errors.activityType = 'IRI did not match expected format.';
        return errors;
    }

    // check to see if importedConcept has a new concept from an import 'create new concept' history push
    if (importedConcept && !initialValues) {
        initialValues = importedConcept.concept.model;
    }
    return (
        <Formik
            initialValues={initialValues || {
                conceptType: 'Activity',
                type: 'Activity',
                iri: '',
                extiri: '',
                geniri: '',
                iriType: "external-iri",
                name: '',
                description: '',
                translations: [],
                activityType: ''
            }}
            validate={formValidation}
            validateOnMount={true}
            onSubmit={values => {
                if (!values.iri) {
                    values.iri = values.extiri.trim();
                    if (values.iriType === 'generated-iri')
                        values.iri = `${generatedIRIBase}${values.geniri.trim()}`;
                }

                onCreate(values);
            }}
        >
            {(props) => (<>
                <div className="grid-container border-1px border-base-lighter padding-bottom-4 padding-left-4 margin-bottom-2">
                    <div className="grid-row">
                        <h2 className="grid-col-5">Define Activity Details</h2>
                        <div className="grid-col">
                            <div className="margin-top-3">
                                <span className="text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                            </div>
                        </div>
                    </div>
                    <form className="usa-form" style={{ maxWidth: "none" }}>
                        <BaseConceptFields {...props} isEditing={initialValues} isPublished={isPublished} generatedIRIBase={generatedIRIBase} />
                        {
                            isPublished ?
                                <Detail title='activity type'>
                                    {props.values.activityType}
                                </Detail>
                                : <ErrorValidation name="activityType" type="input">
                                    <label className="usa-label" htmlFor="activityType">
                                        <span className="text-secondary-dark">*</span> <span className="details-label">activity type</span>
                                    </label>
                                    <Field name="activityType" type="text" className="usa-input" id="activityType" aria-required="true" />
                                </ErrorValidation>
                        }
                    </form>
                </div>
                <div className="grid-row">
                    <div className="grid-col-2">
                        <ValidationControlledSubmitButton errors={props.errors} className="usa-button submit-button" style={{ margin: 0 }} type="submit" onClick={props.handleSubmit}>
                            {(initialValues && !importedConcept) ? 'Save Changes' : 'Add to Profile'}
                        </ValidationControlledSubmitButton>
                    </div>
                    <div className="grid-col">
                        <CancelButton className="usa-button usa-button--unstyled" style={{ marginLeft: "2em", marginTop: "0.6em" }} type="reset" cancelAction={onCancel} />
                    </div>
                    {(initialValues && !importedConcept) &&
                        <div className="grid-col display-flex flex-column flex-align-end">
                            <DeprecateButton
                                className="usa-button usa-button--unstyled text-secondary-dark text-bold"
                                style={{ marginTop: "0.6em" }}
                                type="reset"
                                onClick={onDeprecate}
                                componentType="concept"
                            />
                            <DeleteButton 
                                className="usa-button usa-button--unstyled text-secondary-dark text-bold"
                                style={{ marginTop: "0.6em" }}
                                type="reset"
                                onConfirm={onDelete}
                                componentType="concept"
                            />
                        </div>
                    }
                </div>
            </>)}
        </Formik>
    )
}
