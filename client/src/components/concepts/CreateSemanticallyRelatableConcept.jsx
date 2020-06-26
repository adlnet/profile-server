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
import * as Yup from 'yup';

import BaseConceptFields from './BaseConceptFields';
import SimilarTerms from '../fields/SimilarTerms';

export default function SemanticallyRelatableConcept({ initialValues, onCreate, onCancel }) {
    const { conceptType } = useParams();

    return (
        <Formik
            enableReinitialize
            initialValues={ initialValues || {
                conceptType: conceptType,
                type: conceptType,
                iri: '',
                hasIRI: false,
                name: '',
                description: '',
                similarTerms: [],
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
                similarTerms: Yup.array()
                    .when({
                        is: (similarTerms) => similarTerms.length > 0,
                        then: Yup.array()
                            .of(Yup.object({
                                relationType: Yup.string()
                                    .required('Required'),
                        })),
                    }),
            })}
            onSubmit={values => {
                onCreate(values);
            }}
        >
            {(props) => (<>
                <div className="grid-container border-1px border-base-lighter padding-bottom-4 padding-left-4 margin-bottom-2">
                    <div className="grid-row">
                        <h3 className="grid-col-5">Define <span style={{ textTransform: 'capitalize' }}>{conceptType}</span> Details</h3>
                        <div className="grid-col">
                            <div className="margin-top-3">
                                <span className="text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                            </div>
                        </div>
                    </div>
                    <form className="usa-form">
                        <BaseConceptFields {...props} />

                        <label className="usa-label" htmlFor="similarTerms"><span className="details-label">tag similar terms</span></label>
                        <Field name="similarTerms" component={SimilarTerms} id="similarTerms"></Field>
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
