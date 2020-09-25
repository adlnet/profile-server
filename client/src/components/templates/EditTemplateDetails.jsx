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
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

import Translations from '../../components/fields/Translations';
import Tags from '../../components/fields/Tags';
import ErrorValidation from '../controls/errorValidation';
import Iri from '../fields/Iri';
import { Detail } from '../DetailComponents';

export default function EditTemplateDetails({ initialValues, onSubmit, onCancel, isPublished }) {
    return (<>
        <div className="display-inline padding-right-5">
            <b>Edit Statement Template Details</b>
        </div>
        <span className="text-secondary">*</span><span className="usa-hint text-lowercase text-thin font-sans-3xs"> indicates required field</span>

        <Formik
            initialValues={initialValues ? initialValues : {} || {}}
            validationSchema={Yup.object({
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required')
            })}
            onSubmit={(values) => {
                onSubmit(values);
            }}
        >
            {(formikProps) => (
                <form className="usa-form"> {/*style={{maxWidth: 'inherit'}}>*/}
                    <fieldset className="usa-fieldset">
                        <Iri message="This statement template already has an IRI used in xAPI statments" {...formikProps} isPublished={isPublished} />
                        {
                            isPublished ?
                                <Detail title='statement template name'>
                                    {formikProps.values.name}
                                </Detail>
                                :
                                <ErrorValidation name="name" type="input">
                                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="name"><span className="text-secondary">*</span><span className="details-label"> statement template name</span></label>
                                    <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                                </ErrorValidation>
                        }
                        {
                            isPublished ?
                                <Detail title='description'>
                                    {formikProps.values.description}
                                </Detail>
                                :
                                <ErrorValidation name="description" type="input">
                                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="description"><span className="text-secondary">*</span><span className="details-label"> Description</span></label>
                                    <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
                                </ErrorValidation>
                        }

                        <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="translations"><span className="details-label">Translations</span></label>
                        <Field name="translations" component={Translations} id="translations"></Field>

                        <label className="usa-label text-thin font-sans-3xs" htmlFor="tags">
                            <span className="text-uppercase"><span className="details-label">tags</span></span><br />
                            {!isPublished &&
                                <span className="usa-hint text-thin font-sans-3xs">Put a comma between each one. Example: <b>tag 1, tag 2, tag 3</b></span>
                            }
                        </label>
                        <Field name="tags" component={Tags} id="tags" isPublished={isPublished} />


                        <button className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>Save Changes</button>
                        <button className="usa-button usa-button--unstyled" type="reset" onClick={onCancel}><b>Cancel</b></button>
                        {/* <button className="usa-button usa-button--unstyled" type="reset" onClick={handleCancel}>Deprecate Statement Template</button> */}
                    </fieldset>
                </form>
            )}
        </Formik>
    </>);
}
