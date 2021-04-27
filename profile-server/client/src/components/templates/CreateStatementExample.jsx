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
import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';

import { CodeEditorField } from '../controls/codeEditor';
import CancelButton from '../controls/cancelButton';
import { CREATED, EDITED } from '../../actions/successAlert';


export default function CreateStatementExample({ initialValues, onSubmit, onCancelClick }) {
    const [codeErrors, setCodeErrors] = useState();

    return (<>
        <Formik
            initialValues={initialValues ? { statementExample: initialValues } : { statementExample: "" }}
            validate={(values) => {
                const errors = {};
                if (values.statementExample === undefined || values.statementExample === null) {
                    errors.statementExample = "Required";
                } else if (codeErrors) {
                    let err = codeErrors.map(err => { if (err.text) return err.text });
                    if (err.length)
                        errors.statementExample = err;
                } else {
                    try {
                        JSON.parse(values.statementExample);
                    } catch (e) {
                        if (values.statementExample.trim() !== "") errors.statementExample = e.message;
                    }
                }

                return errors;
            }}
            onSubmit={(values) => {
                try {
                    values.statementExample = JSON.stringify(JSON.parse(values.statementExample), null, 3)
                } catch (e) {
                    // didn't parse to JSON, set to empty string
                    values.statementExample = "";
                }
                onSubmit(values, initialValues ? EDITED : CREATED);
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
                            <CancelButton className="usa-button usa-button--unstyled margin-105" type="button" cancelAction={onCancelClick} />
                            <button
                                className="usa-button margin-top-2" style={{ margin: '0' }}
                                type="submit"
                            >
                                Add to Statement Template
                        </button>
                        </div>
                    </div>
                </div>
                <div className="grid-row margin-top-2">
                    <ErrorMessage name="statementExample" />
                    <CodeEditorField
                        name="statementExample"
                        id="statementExample"
                        aria-required="true"
                        onValidate={setCodeErrors}
                    />
                </div>
            </Form>
        </Formik>
    </>);
}
