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
import { Formik, Form, Field } from 'formik';

export default function AddRuleForm() {
    
    return (<>
        <h2>Add Rule</h2>
        <Formik
            initialValues={{stuff:''}}
            onSubmit={({ values }) => {
                console.log(values);
            }}
        >
            <Form  className="usa-form rules-form">
                <fieldset className="usa-fieldset">
                    <label className="usa-label" htmlFor="property"><span className="text-secondary">*</span>Property</label>
                    <Field name="property" component="select" rows="3" className="usa-select" id="property" aria-required="true" >
                        <option value="" selected disabled>Select an option below</option>
                        <option value="genral">General</option>
                        <option value="actor">Actor</option>
                        <option value="verb">Verb</option>
                        <option value="object">Object</option>
                        <option value="result">Result</option>
                        <option value="context">Context</option>
                        <option value="authority">Authority</option>
                        <option value="attachments">Attachments</option>
                        <option value="documents">Documents</option>
                    </Field>
                </fieldset>
                <div className="rules-buttons">
                    <button className="usa-button margin-right-3">Save Rule</button>
                    <button className="usa-button usa-button--unstyled"><b>Cancel</b></button>
                </div>
            </Form>
        </Formik>
    </>);
}

