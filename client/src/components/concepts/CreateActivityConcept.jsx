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

import BaseConceptFields from './BaseConceptFields';
import { Detail } from '../DetailComponents';
import { useSelector } from 'react-redux';

export default function ActivityConcept({ initialValues, onCreate, onCancel, isPublished }) {
    const currentProfileVersion = useSelector(state => state.application.selectedProfile);

    const generatedIRIBase = currentProfileVersion.iri + "/activity/";

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
                conceptType: 'Activity',
                type: 'Activity',
                iri: '',
                iriType: "external-iri",
                name: '',
                description: '',
                translations: [],
            }}
            validationSchema={Yup.object({
                iri: Yup.string()
                    .required('Required'),
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required')
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
                        <h2 className="grid-col-5">Define Activity Details</h2>
                        <div className="grid-col">
                            <div className="margin-top-3">
                                <span className="text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                            </div>
                        </div>
                    </div>
                    <form className="usa-form" style={{ maxWidth: "none" }}>
                        <BaseConceptFields {...props} isPublished={isPublished} generatedIRIBase={generatedIRIBase} />
                        {
                            isPublished ?
                                <Detail title='activity type'>
                                    {props.values.activityType}
                                </Detail>
                                : <>
                                    <label className="usa-label" htmlFor="activityType">
                                        <span className="text-secondary-dark">*</span> <span className="details-label">activity type</span>
                                    </label>
                                    <Field name="activityType" type="text" className="usa-input" id="activityType" aria-required="true" />
                                </>
                        }
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
