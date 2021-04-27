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
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react'
import { isValidIRI } from '../fields/Iri';
import ErrorValidation from './errorValidation';
import ModalBoxWithoutClose from './modalBoxWithoutClose';

export default function DeprecateButton({ onClick, style, className, type, preventDefault, componentType }) {
    const [showModal, setShowModal] = useState(false);
    let thing = "a set of activities";
    if (componentType === "concept") thing = "this term"

    function handleSubmit(values) {
        setShowModal(false);
        onClick(values);
    }

    function doModal(e) {
        if (preventDefault) e.preventDefault();
        setShowModal(true);
    }

    function validateForm(values) {
        let errors = {};

        if (!values.reason.trim()) errors.reason = "Required";
        if (values.reasonLink.trim()) {
            if (!isValidIRI(values.reasonLink.trim())) errors.reasonLink = 'IRI did not match expected format.';
        }

        return errors;
    }

    return (<>
        <button className={className} style={style} type={type ? type : 'button'} onClick={doModal}>Deprecate <span style={{ textTransform: "capitalize" }}>{componentType}</span></button>
        <ModalBoxWithoutClose show={showModal}>
            <Formik
                initialValues={{ reason: '', reasonLink: '' }}
                validate={validateForm}
                onSubmit={(values) => {
                    handleSubmit(values);
                }}
            >
                {(formikProps) => (
                    <Form className="usa-form padding-x-2" style={{ width: "640px", maxWidth: "none" }}>
                        <div className="grid-row">
                            <div className="grid-col">
                                <h2>Deprecate this <span style={{ textTransform: "capitalize" }}>{componentType}</span></h2>
                            </div>
                        </div>
                        <div className="grid-row">
                            <div className="grid-col">
                                <span>
                                    Deprecating a {componentType} signals to server users that this is no longer the recommended method
                                    for semantically describing {thing}. Please provide a reason why this {componentType} is
                                    no longer recommended and a link to the new {componentType}, if relevant.
                                    </span>
                            </div>
                        </div>
                        <ErrorValidation name="reason" type="input" style={{ marginTop: "1em", marginBottom: "1em" }}>
                            <label className="details-label" htmlFor="reason"><span className="text-secondary-darker margin-right-05">*</span>Reason for deprecating</label>
                            <Field name="reason" component="textarea" rows="3" className="usa-textarea" id="reason" aria-required="true" ></Field>
                        </ErrorValidation>
                        <ErrorValidation name="reasonLink" type="input">
                            <label className="usa-label" htmlFor="reasonLink"><span className="details-label">Link to More Information</span></label>
                            <Field name="reasonLink" type="text" className="usa-input" id="input-reasonLink" />
                        </ErrorValidation>
                        <div className="grid-row">
                            <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                                <button className="usa-button submit-button" style={{ margin: "1.5em 0em" }} disabled={!formikProps.values.reason} type="submit">Deprecate now</button>
                            </div>
                            <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                                <button className="usa-button usa-button--unstyled" onClick={() => setShowModal(false)} type="reset" style={{ margin: "2.3em 1.5em" }}><b>Cancel</b></button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </ModalBoxWithoutClose>
    </>);
}
