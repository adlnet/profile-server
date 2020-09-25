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
import * as Yup from 'yup';

import BaseConceptFields from './BaseConceptFields';
import ErrorValidation from '../controls/errorValidation';
import Schemas from '../fields/Schemas';
import { Detail } from '../DetailComponents';
import { useSelector } from 'react-redux';

export default function DocumentConcept({ initialValues, onCreate, onCancel, isPublished }) {
    const currentProfileVersion = useSelector(state => state.application.selectedProfile);

    const generatedIRIBase = currentProfileVersion.iri + "/document/";

    let startingValues;
    if (initialValues) {
        // it's possible that the iri was external and still match, but this is what 
        // the system will use to generate the base of the concept iri, so we'll call it 
        // generated
        startingValues = { ...initialValues };
        startingValues.iriType = initialValues.iri.startsWith(generatedIRIBase) ? 'generated-iri' : 'external-iri'
        startingValues.iri = initialValues.iri.replace(generatedIRIBase, "");
    }

    return (
        <Formik
            initialValues={startingValues || {
                conceptType: 'Document',
                type: '',
                iri: '',
                iriType: "external-iri",
                name: '',
                description: '',
                mediaType: '',
                schemaType: '',
                inlineSchema: '',
                schemaString: '',
            }}
            validationSchema={Yup.object({
                iri: Yup.string()
                    .required('Required'),
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required'),
                type: Yup.string()
                    .required('Required'),
                mediaType: Yup.string()
                    .required('Required'),
                schemaType: Yup.string()
                    .required('Required'),
                inlineSchema: Yup.string()
                    .when('schemaType', {
                        is: (schemaType) => schemaType === 'inlineSchema' || !schemaType,
                        then: Yup.string().required('Required'),
                    }),
                schemaString: Yup.string()
                    .when('schemaType', {
                        is: (schemaType) => schemaType === 'schemaString' || !schemaType,
                        then: Yup.string().required('Required'),
                    }),
            })}
            onSubmit={values => {
                if (values.iriType === 'generated-iri')
                    values.iri = `${generatedIRIBase}${values.iri}`;
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
                        <BaseConceptFields {...props} isPublished={isPublished} generatedIRIBase={generatedIRIBase} />

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
                                        <ErrorValidation name="mediaType" type="input">
                                            <label className="usa-label" htmlFor="mediaType"><span className="text-secondary">*</span>
                                                <span className="details-label">Media Type</span>
                                            </label>
                                            <Field
                                                name="mediaType" component="select" value={props.values.mediaType} onChange={props.handleChange} rows="3"
                                                className="usa-select" id="mediaType" aria-required="true"
                                            >
                                                <option value="" disabled defaultValue>- Select Media Type -</option>
                                                <option value="JSON">JSON</option>
                                                <option value="Text">text</option>
                                                <option value="audio">audio</option>
                                                <option value="video">video</option>
                                                <option value="multipart">multipart</option>
                                            </Field>
                                        </ErrorValidation>
                                }
                            </div>
                        </div>
                        {
                            isPublished ?
                                <Detail title='context iri'>
                                    {props.values.contextIri}
                                </Detail>
                                :
                                <>
                                    <label className="usa-label" htmlFor="contextIri">
                                        <span className="details-label">context iri</span>
                                    </label>
                                    <Field name="contextIri" type="text" className="usa-input" id="contextIri" aria-required="true" />
                                </>
                        }

                        <Schemas isRequired={true} {...props} isPublished={isPublished} />

                    </form>
                </div>
                <button className="usa-button submit-button" type="submit" onClick={props.handleSubmit}>
                    {initialValues ? 'Save Changes' : 'Add to Profile'}
                </button>
                <button className="usa-button usa-button--unstyled" type="reset" onClick={onCancel}><b>Cancel</b></button>
            </>)}
        </Formik>
    )
}
