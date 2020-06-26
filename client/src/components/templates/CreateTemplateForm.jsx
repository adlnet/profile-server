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
import { withRouter } from "react-router-dom";
import { useDispatch } from 'react-redux';

import { createTemplate } from '../../actions/templates';
import Translations from '../../components/fields/Translations';
import Tags from '../../components/fields/Tags';
import ErrorValidation from '../controls/errorValidation';
import Iri from '../fields/Iri';

function CreateTemplateForm(props) {
    const dispatch = useDispatch();

    function handleCancel() {
        props.history.goBack();
    }

    return (
        <div className="usa-layout-docs usa-layout-docs__main desktop:grid-col-9 usa-prose">
            <header>
                <h2 className="margin-bottom-1">Create Statement Template</h2>
            </header>
            <div>
                A Statement Template describes one way statements following this profile may be structured.
            </div><br />
            <div>
                <label className="text-italic">
                Once the statement template is created you will be able to add concepts, determining properties, and rules to it.
                </label>
            </div>

            <Formik
                initialValues={{ name: '', description: '', 'more-information': '', tags: [], hasIRI: false, iri: '' }}
                validationSchema={Yup.object({
                    name: Yup.string()
                        .required('Required'),
                    description: Yup.string()
                        .required('Required')
                })}
                onSubmit={(values) => {
                    dispatch(createTemplate(values));
                }}
            >
                {(formikProps) => (<>
                    <div className="grid-container border-1px border-base-lighter padding-4 margin-y-2">
                        <h3 className="display-inline padding-right-5">
                            Define Statement Template Details
                        </h3>
                        <span className="text-secondary">*</span><span className="usa-hint text-lowercase text-thin font-sans-3xs"> indicates required field</span>
                        <Form className="usa-form margin-top-3"> {/*style={{maxWidth: 'inherit'}}>*/}
                            <fieldset className="usa-fieldset">
                                <Iri message="This statement template already has an IRI used in xAPI statments" {...formikProps} />

                                <ErrorValidation name="name" type="input">
                                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="name"><span className="text-secondary">*</span><span className="details-label"> statement template name</span></label>
                                    <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                                </ErrorValidation>

                                <ErrorValidation name="description" type="input">
                                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="description"><span className="text-secondary">*</span><span className="details-label"> Description</span></label>
                                    <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
                                </ErrorValidation>

                                <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="translations"><span className="details-label">Translations</span></label>
                                <Field name="translations" component={Translations} id="translations"></Field>

                                <label className="usa-label text-thin font-sans-3xs" htmlFor="tags">
                                    <span className="text-uppercase"><span className="details-label">tags</span></span><br />
                                    <span className="usa-hint text-thin font-sans-3xs">Put a comma between each one. Example: <b>tag 1, tag 2, tag 3</b></span>
                                </label>

                                <Field name="tags" component={Tags} id="tags" />
                            </fieldset>
                        </Form>
                    </div>
                    <button className="usa-button submit-button" type="submit" onClick={formikProps.handleSubmit} >Create Statement Template</button>
                    <button className="usa-button usa-button--unstyled" onClick={handleCancel} type="reset">Cancel</button>
                </>)}
            </Formik>
        </div>
    );
}

export default withRouter(CreateTemplateForm);
