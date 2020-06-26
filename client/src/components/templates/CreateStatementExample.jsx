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
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ConceptResultView from '../concepts/ConceptResultView';

export default function CreateStatementExample({ initialValues, onSubmit, onCancelClick }) {
    return (<>
        <Formik
            initialValues={initialValues ? {statementExample: initialValues} : {statementExample: ""}}
            validationSchema={Yup.object({
                statementExample: Yup.string()
                    .required('Required')
                    // .test("json", "Invalid JSON.", function(val) {
                        
                    //     try {
                    //         JSON.parse(JSON.stringify(val));
                    //     } catch(e) {
                    //         console.log(e);
                    //         return true;
                    //     }
                    //     return false;
                    // }),
            })}
            onSubmit={(values) => {
                onSubmit(values);
            }}
        >
            <Form>
                <div className="grid-row">
                    <div className="grid-col display-flex flex-align-center">
                        <span className="font-sans-3xs text-base-light ">            
                            It is highly recommended that an example be added to this template for...
                        </span>
                    </div>
                    <div className="grid-col display-flex flex-column flex-align-end">
                        <div>
                        <button 
                                className="usa-button usa-button--unstyled margin-105"
                                type="button"
                                onClick={onCancelClick}
                        >
                            <b>Cancel</b>
                        </button>
                        <button 
                                className="usa-button margin-top-2" style={{margin: '0'}}
                                type="submit"
                        >
                            Add to Statement Template
                        </button>
                        </div>
                    </div>
                </div>
                <div className="grid-row margin-top-2">
                    <ErrorMessage name="statementExample" />
                    <Field 
                        name="statementExample" 
                        component="textarea"
                        className="font-sans-xs border-1px border-base-lighter minh-mobile maxh-mobile width-full padding-1 overflow-auto"
                        style={{lineHeight: '1.5'}}
                        id="statementExample"
                        aria-required="true"
                    />
                </div>
            </Form>
        </Formik>
    </>);
}
