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
import Schemas from '../fields/Schemas';
import ErrorValidation from '../controls/errorValidation';
import RecommendedTerms from '../fields/RecommendedTerms';

export default function ExtensionConcept({ initialValues, onCreate, onCancel }) {
    return (
        <Formik
            initialValues={initialValues || {
                conceptType: 'Extension',
                type: '',
                iri: '',
                hasIRI: false,
                name: '',
                description: '',
                schemaType: '',
                inlineSchema: '',
                schemaString: '',
                recommendedTerms:[],
            }}
            validationSchema={Yup.object({
                iri: Yup.string()
                    .when('hasIRI', {
                        is: true,
                        then: Yup.string()
                            .required('Required'),
                    }),
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required'),
                type: Yup.string()
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
                onCreate(values);
            }}
        >
            {(props) => (<>
                <div className="grid-container border-1px border-base-lighter padding-bottom-4 padding-left-4 margin-bottom-2">
                    <h3>Define Extension Details</h3>
                    <form className="usa-form">
                        <BaseConceptFields {...props} />

                        <div className="grid-row">
                            <div className="grid-col-6">
                                <ErrorValidation name="type" type="input">
                                    <label className="usa-label" htmlFor="type"><span className="text-secondary">*</span>
                                        <span className="details-label">Extention Type</span>
                                    </label>
                                    <Field
                                        name="type" component="select" value={props.values.type} onChange={props.handleChange} rows="3"
                                        className="usa-select" id="type" aria-required="true"
                                    >
                                        <option value="" disabled defaultValue>- Select Type -</option>
                                        <option value="ActivityExtension">ActivityExtension</option>
                                        <option value="ContextExtension">ContextExtension</option>
                                        <option value="ResultExtension">ResultExtension</option>
                                    </Field>
                                </ErrorValidation>
                            </div>
                        </div>

                        <label className="usa-label" htmlFor="recommendedTerms"><span className="details-label">tag recommended terms</span></label>
                        <Field name="recommendedTerms" component={RecommendedTerms} id="recommendedTerms"></Field>

                        <label className="usa-label" htmlFor="contextIri">
                            <span className="details-label">context iri</span>
                        </label>
                        <Field name="contextIri" type="text" className="usa-input" id="contextIri" aria-required="true" />

                        <Schemas isRequired={true} {...props} />
                    </form>
                </div>
                <button className="usa-button submit-button" type="submit" onClick={props.handleSubmit}>
                    { initialValues ? 'Save Changes' : 'Add to Profile' }
                </button>
                <button className="usa-button usa-button--unstyled" type="reset" onClick={onCancel}><b>Cancel</b></button>
            </>)}
        </Formik>
    )
}
