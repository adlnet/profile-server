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
import React from 'react'
import { useParams } from 'react-router-dom';
import { Formik, Field } from 'formik';
import { useSelector } from 'react-redux';

import BaseConceptFields from './BaseConceptFields';
import SimilarTerms from '../fields/SimilarTerms';
import CancelButton from '../controls/cancelButton';
import { isValidIRI } from '../fields/Iri';
import DeprecateButton from '../controls/deprecateButton';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';
import DeleteButton from '../controls/DeleteButton';

export default function SemanticallyRelatableConcept({ startingValues, onCreate, onCancel, isPublished, onDeprecate, importedConcept, onDelete }) {
    const { conceptType } = useParams();
    const currentProfile = useSelector(state => state.application.selectedProfile);
    const currentProfileVersion = useSelector(state => state.application.selectedProfileVersion);

    const generatedIRIBase = `${currentProfile.iri}/${conceptType.toLowerCase()}/`;
    let initialValues;
    if (startingValues) {
        initialValues = { ...startingValues }
    }

    const formValidation = (values) => {
        const errors = {};
        if (!values.name) errors.name = 'Required';
        if (!values.description) errors.description = 'Required';

        if (values.similarTerms) {
            let err = [];
            for (const entry of values.similarTerms) {
                if (!entry.relationType) err.push(`${entry.concept.name} does not have a relation type`);
            }
            if (err.length) errors.similarTerms = err;
        }

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
        return errors;
    }

    // check to see if importedConcept has a new concept from an import
    if (importedConcept && !initialValues) { 
        initialValues = importedConcept.concept.model;
    }

    if (initialValues && initialValues.similarTerms) {
        initialValues.similarTerms = initialValues.similarTerms.map(term => {
            let reterm = { ...term };
            if (reterm.relationType === 'relatedMatch') reterm.relationType = 'related'
            else if (reterm.relationType === 'broadMatch') reterm.relationType = 'broader'
            else if (reterm.relationType === 'narrowMatch') reterm.relationType = 'narrower'
            return reterm;
        })
    }

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues || {
                conceptType: conceptType,
                type: conceptType,
                iri: '',
                extiri: '',
                geniri: '',
                iriType: "external-iri",
                name: '',
                description: '',
                similarTerms: [],
            }}
            validate={formValidation}
            // validateOnMount={true}
            onSubmit={values => {
                if (!values.iri) {
                    values.iri = values.extiri.trim();
                    if (values.iriType === 'generated-iri')
                        values.iri = `${generatedIRIBase}${values.geniri.trim()}`;
                }

                values.similarTerms = values.similarTerms.map(term => {
                    if (term.concept.parentProfile.parentProfile.uuid !== currentProfile.uuid) {
                        if (term.relationType === 'related') term.relationType = 'relatedMatch';
                        else if (term.relationType === 'broader') term.relationType = 'broadMatch';
                        else if (term.relationType === 'narrower') term.relationType = 'narrowMatch';
                    }
                    return term
                })

                onCreate(values);
            }}
        >
            {(props) => (<>
                <div className="grid-container border-1px border-base-lighter padding-bottom-4 padding-left-4 margin-bottom-2">
                    <div className="grid-row">
                        <h2 className="grid-col-5">Define <span style={{ textTransform: 'capitalize' }}>{conceptType}</span> Details</h2>
                        <div className="grid-col">
                            <div className="margin-top-3">
                                <span className="text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                            </div>
                        </div>
                    </div>
                    <form className="usa-form" style={{ maxWidth: "none" }}>
                        <BaseConceptFields {...props} isEditing={initialValues} isPublished={isPublished} generatedIRIBase={generatedIRIBase} />
                        <div className={`usa-form-group ${props.errors.similarTerms && props.touched.relationType ? "usa-form-group--error" : ""}`}  >
                            <label className="usa-label" htmlFor="similarTerms"><span className="details-label">tag similar terms</span></label>
                            {props.errors.similarTerms && props.touched.relationType && <span className="usa-error-message" id="input-error-message" role="alert">{props.errors.similarTerms}</span>}
                            <Field name="similarTerms" component={SimilarTerms} id="similarTerms" isPublished={isPublished} conceptType={conceptType} profileVersion={currentProfileVersion}></Field>
                        </div>
                    </form>
                </div>
                <div className="grid-row">
                    <div className="grid-col-2">
                        <ValidationControlledSubmitButton errors={props.errors} className="usa-button submit-button" style={{ margin: 0 }} type="submit" onClick={props.handleSubmit}>
                            {initialValues ? 'Save Changes' : 'Add to Profile'}
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
