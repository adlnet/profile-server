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
import { Formik, Field } from 'formik';

import BaseConceptFields from './BaseConceptFields';
import ErrorValidation from '../controls/errorValidation';
import Schemas from '../fields/Schemas';
import { Detail } from '../DetailComponents';
import { useSelector } from 'react-redux';
import { Autocomplete, TextField } from '@cmsgov/design-system';
import mimeTypes from '../fields/data/mime-types.json'
import { useState } from 'react';
import CancelButton from '../controls/cancelButton';
import { isValidIRI } from '../fields/Iri';
import { isValidInlineSchema } from '../fields/Schemas';
import DeprecateButton from '../controls/deprecateButton';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';
import DeleteButton from '../controls/DeleteButton';

export default function DocumentConcept({ initialValues, onCreate, onCancel, isPublished, onDeprecate, importedConcept, onDelete }) {
    const currentProfileVersion = useSelector(state => state.application.selectedProfile);

    const generatedIRIBase = currentProfileVersion.iri + "/document/";
    const [mimetypes, setTypes] = useState(mimeTypes);

    const formValidation = (values) => {
        const errors = {};
        if (!values.name) errors.name = 'Required';
        if (!values.description) errors.description = 'Required';
        if (!values.type) errors.type = 'Required';
        if (!values.mediaType) errors.mediaType = 'Required';
        if (!values.schemaType) errors.schemaType = 'Required';
        if (values.schemaType === 'inlineSchema') {
            try {
                if (!values.inlineSchema) errors.inlineSchema = 'Required'
                else if (!isValidInlineSchema(JSON.parse(values.inlineSchema))) errors.inlineSchema = 'Schema String did not match expected format.'
            } catch (err) {
                errors.inlineSchema = 'Not a valid json string.'
            }
        }
        if (values.schemaType === 'schemaString') {
            if (!values.schemaString) errors.schemaString = 'Required'
            else if (!isValidIRI(values.schemaString)) errors.schemaString = 'IRI did not match expected format.'
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

        if (values.contextIri && values.contextIri.trim()) {
            if (!isValidIRI(values.contextIri)) errors.contextIri = 'IRI did not match expected format.'
        }
        return errors;
    }

    // check to see if importedConcept has a new concept from an import 'create new concept' history push
    if (importedConcept && !initialValues) {
        initialValues = importedConcept.concept.model;
    }

    return (
        <Formik
            initialValues={initialValues || {
                conceptType: 'Document',
                type: '',
                iri: '',
                extiri: '',
                geniri: '',
                iriType: "external-iri",
                name: '',
                description: '',
                mediaType: '',
                schemaType: '',
                inlineSchema: '',
                schemaString: '',
                contextIri: ''
            }}
            validate={formValidation}
            onSubmit={values => {
                if (!values.iri) {
                    values.iri = values.extiri.trim();
                    if (values.iriType === 'generated-iri')
                        values.iri = `${generatedIRIBase}${values.geniri.trim()}`;
                }
                // wanna wipe out the one that wasn't selected
                if (values.schemaType === 'inlineSchema')
                    values.schemaString = '';
                else
                    values.inlineSchema = '';

                if (values.contextIri) values.contextIri = values.contextIri.trim();
                onCreate(values);
            }}
        >
            {(props) => (<>
                <div className="grid-container border-1px border-base-lighter padding-bottom-4 padding-left-4 margin-bottom-2">
                    <div className="grid-row">
                        <h2 className="grid-col-5">Define Document Details</h2>
                        <div className="grid-col">
                            <div className="margin-top-3">
                                <span className="text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                            </div>
                        </div>
                    </div>
                    <form className="usa-form" style={{ maxWidth: "none" }}>
                        <BaseConceptFields {...props} isEditing={initialValues} isPublished={isPublished} generatedIRIBase={generatedIRIBase} />

                        <div className="grid-row">
                            <div className="grid-col-6">
                                {
                                    isPublished ?
                                        <Detail title='Document Resource Type' className='usa-label'>
                                            {props.values.type}
                                        </Detail>
                                        :
                                        <ErrorValidation name="type" type="input">
                                            <label className="usa-label" htmlFor="type"><span className="text-secondary">*</span>
                                                <span className="details-label">Document Resource Type</span>
                                            </label>
                                            <Field
                                                name="type" component="select" value={props.values.type} onChange={props.handleChange} rows="3"
                                                className="usa-select" id="type" aria-required="true"
                                            >
                                                <option value="" disabled defaultValue>- Select Type -</option>
                                                <option value="StateResource">StateResource</option>
                                                <option value="AgentProfileResource">AgentProfileResource</option>
                                                <option value="ActivityProfileResource">ActivityProfileResource</option>
                                            </Field>
                                        </ErrorValidation>
                                }
                                {
                                    isPublished ?
                                        <Detail title='Media Type'>
                                            {props.values.mediaType}
                                        </Detail>
                                        :
                                        <div className={`usa-form-group ${props.errors.mediaType && props.touched.mediaType ? "usa-form-group--error" : ""}`}  >
                                            <Autocomplete
                                                items={mimetypes}
                                                loadingMessage="Loading"
                                                noResultsMessage="No results found"
                                                initialInputValue={(initialValues && initialValues.mediaType) || ''}
                                                clearSearchButton={false}
                                                onChange={(selectedItem) => {
                                                    props.setFieldValue('mediaType', selectedItem.id);
                                                }}
                                                onInputValueChange={(val) => setTypes(mimeTypes.filter(type => type.name.match(new RegExp(`.*${val}.*`, 'i'))))}
                                            >
                                                <TextField
                                                    label={getMediaTypeLabel(props)}
                                                    name="mediaType"
                                                    id="mediaType"
                                                    style={{ border: "1px solid #000000", borderRadius: "0" }}
                                                    onBlur={() => props.setFieldTouched('mediaType', true)}
                                                    className={`${props.errors.mediaType && props.touched.mediaType ? "usa-text--error" : ""}`}
                                                />
                                            </Autocomplete>
                                        </div>
                                }
                            </div>
                        </div>
                        {
                            isPublished ?
                                <Detail title='context iri'>
                                    {props.values.contextIri}
                                </Detail>
                                :
                                <ErrorValidation name="contextIri" type="input">
                                    <label className="usa-label" htmlFor="contextIri">
                                        <span className="details-label">context iri</span>
                                    </label>
                                    <Field name="contextIri" type="text" className="usa-input" id="contextIri" aria-required="true" />
                                </ErrorValidation>
                        }

                        <Schemas isRequired={true} {...props} isPublished={isPublished} />

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

function getMediaTypeLabel(props) {
    return (
        <>
            <label className={`details-label ${props.errors.mediaType && props.touched.mediaType ? "usa-text--error" : ""}`} htmlFor="mediaType">
                <span className="text-secondary">*</span>Media Type</label>
            {props.errors.mediaType && props.touched.mediaType && <span className="usa-error-message" id="input-error-message" role="alert">{props.errors.mediaType}</span>}
        </>
    )
}
