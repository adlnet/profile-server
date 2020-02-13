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
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { withRouter } from "react-router-dom";
import { useDispatch } from 'react-redux';

import { createTemplate } from '../../actions/templates';
import { Translations } from '../../components/fields/Translations';
import Tags from '../../components/fields/Tags';

function CreateTemplateForm(props) {
    const dispatch = useDispatch();

    function handleCancel() {
        props.history.goBack();
    }

    return (<>
        <h2>
            Create Statement Template
        </h2>
        <p >
            A Statement Template describes one way statements following this profile may be structured.
        </p>
        <p>
            <label className="display-inline text-italic">Once the statement template is created you will be able to add concepts and rules to it.</label>
        </p>
        <br></br>
        <h2 className="display-inline padding-right-5">
            Define Statement Template Details
        </h2>
        <span className="text-secondary">*</span><span className="usa-hint text-lowercase text-thin font-sans-3xs"> indicates required field</span>

        <Formik
            initialValues={{ name: '', description: '', 'more-information': '', tags: '' }}
            validationSchema={Yup.object({
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required')
            })}
            onSubmit={(values) => {
                dispatch(createTemplate(values));
                props.history.goBack();
            }}
        >
            <Form className="usa-form"> {/*style={{maxWidth: 'inherit'}}>*/}
                <fieldset className="usa-fieldset">
                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="name"><span className="text-secondary">*</span> statement template name</label>
                    <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                    <ErrorMessage name="name" />

                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="description"><span className="text-secondary">*</span> Description</label>
                    <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
                    <ErrorMessage name="description" />

                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="translations">Translations</label>
                    <Field name="translations" component={Translations} id="translations"></Field>

                    <label className="usa-label text-thin font-sans-3xs" htmlFor="tags">
                        <span className="text-uppercase">tags</span><br />
                        <span className="usa-hint text-thin font-sans-3xs">Put a comma between each one. Example: <b>tag 1, tag 2, tag 3</b></span>
                    </label>
                    <Field name="tags" component={Tags} id="tags" />


                    <button className="usa-button" type="submit" >Create Statement Template</button>
                    <button className="usa-button usa-button--unstyled" onClick={handleCancel} type="reset">Cancel</button>
                </fieldset>
            </Form>
        </Formik>
    </>);
}

export default withRouter(CreateTemplateForm);
