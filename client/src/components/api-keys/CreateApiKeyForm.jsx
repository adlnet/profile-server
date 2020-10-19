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

import ErrorValidation from '../controls/errorValidation';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';

export default function CreateApiKeyForm({ initialValues, onSubmit, onCancel, onRemove }) {
    function handlePermissionChange(setFieldTouched, handleChange, event) {
        setFieldTouched('permisssions');
        handleChange(event);
    }
    return (
        <Formik
            initialValues={initialValues || {
                uuid: require('uuid').v4(),
                description: '',
                readPermission: false,
                writePermission: false,
                isEnabled: true,
                permissions: '',
            }}
            validationSchema={Yup.object({
                description: Yup.string()
                    .required('Required'),
            })
                .test(
                    'permissionsTest',
                    null,
                    (obj) => {
                        if (obj.readPermission || obj.writePermission) {
                            return true;
                        }

                        return new Yup.ValidationError(
                            'Check at least one.',
                            null,
                            'permissions',
                        )
                    }
                )}
            validateOnMount={true}
            onSubmit={(values) => {
                onSubmit(values);
            }}
        >
            {(formikProps) => (<>
                <div className="border-1px border-base-lighter padding-bottom-4 padding-left-4">
                    <div className="grid-row">
                        <h3 className="grid-col-3">API Key Details</h3>
                        <div className="grid-col" style={{ marginTop: "1.25em" }}>
                            <span className="grid-col text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                        </div>
                    </div>
                    <form className="usa-form">
                        <label className="usa-label details-label" htmlFor="uuid">key</label>
                        <div name="uuid">{formikProps.values.uuid}</div>

                        <ErrorValidation name="description" type="input">
                            <label className="usa-label" htmlFor="description">
                                <div className="margin-bottom-05"><span className="text-secondary">*</span><span className="details-label"> api key name</span></div>
                                <div className="text-thin text-base font-sans-3xs">Enter a desciptive name to help identify this key later.</div>
                            </label>
                            <Field name="description" type="text" className="usa-input" id="input-description" aria-required="true" />
                        </ErrorValidation>

                        <div className={`usa-form-group ${formikProps.errors.permissions && formikProps.touched.permissions ? "usa-form-group--error" : ""}`}>
                            <label
                                className={`usa-label details-label ${formikProps.errors.permissions && formikProps.touched.permissions ? "usa-label--error" : ""}`}
                                htmlFor="permissions"
                            >
                                <span className="text-secondary">*</span> permissions
                            </label>
                            {
                                (formikProps.errors.permissions && formikProps.touched.permissions) && (
                                    <span className="usa-error-message" id="input-error-message" role="alert">{formikProps.errors.permissions}</span>
                                )
                            }
                            <ul className="horizontal-list">
                                <li>
                                    <Field type="checkbox" id="readPermission" name="readPermission"
                                        onChange={e => handlePermissionChange(formikProps.setFieldTouched, formikProps.handleChange, e)}
                                        className="usa-checkbox__input"
                                    />
                                    <label className="usa-checkbox__label" htmlFor="readPermission">Read</label>
                                </li>
                                <li>
                                    <Field type="checkbox" id="writePermission" name="writePermission"
                                        onChange={e => handlePermissionChange(formikProps.setFieldTouched, formikProps.handleChange, e)}
                                        className="usa-checkbox__input"
                                    />
                                    <label className="usa-checkbox__label" htmlFor="writePermission">Write</label>
                                </li>
                            </ul>
                        </div>

                        <div className="grid-row">
                            <div className="grid-col-6">
                                <label className="usa-label details-label" htmlFor="isEnabled">
                                    <span>Status</span>
                                </label>
                                <Field
                                    name="isEnabled" component="select" value={formikProps.values.isEnabled} onChange={formikProps.handleChange} rows="3"
                                    className="usa-select" id="isEnabled" aria-required="true"
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </Field>
                            </div>
                        </div>
                    </form>
                </div>
                <ValidationControlledSubmitButton
                    errors={formikProps.errors}
                    className="usa-button submit-button"
                    type="button"
                    onClick={formikProps.handleSubmit}>
                    {
                        initialValues ? "Save Changes" : "Create API Key"
                    }
                </ValidationControlledSubmitButton>
                <button onClick={onCancel} className="usa-button usa-button--unstyled" type="reset"><b>Cancel</b></button>
                { initialValues &&
                    <button type="button" className="usa-button usa-button--unstyled pin-right text-secondary-darker" onClick={() => onRemove(initialValues.uuid)} style={{ margin: "2em 0em 2em 2em" }}><b>Remove API Key</b></button>
                }
            </>)}
        </Formik>
    )
}
