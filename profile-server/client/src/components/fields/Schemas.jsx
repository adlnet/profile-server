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
import React, { useEffect } from 'react';
import { Field } from 'formik';

import { validate } from 'jsonschema';
import jsonSchema from './validation/jsonschema';

export default function Schemas(props) {

    useEffect(() => {
        if (props.initialValues.inlineSchema) {
            props.setFieldValue('schemaType', 'inlineSchema');
        } else if (props.initialValues.schemaString) {
            props.setFieldValue('schemaType', 'schemaString');
        } else {
            props.setFieldValue('schemaType', '');
        }
    }, [])

    function toggleSchemaType(type) {
        props.setFieldValue('schemaType', type);
    }

    function updateValue(type, value) {
        props.setFieldValue(type, value);
    }

    return (
        <div className="schema">
            <fieldset className="usa-fieldset">
                <div className={`usa-form-group ${(props.touched.inlineSchema && props.errors.inlineSchema) || (props.touched.schemaString && props.errors.schemaString) ? "usa-form-group--error" : ""}`} >
                    <label className={`usa-label ${(props.touched.inlineSchema && props.errors.inlineSchema) || (props.touched.schemaString && props.errors.schemaString) ? "usa-label--error" : ""}`}>
                        {
                            props.isRequired && !props.isPublished &&
                            <span className="text-secondary">*</span>
                        }
                        <span className="details-label">Schema</span>
                    </label>
                    {
                        ((props.touched.inlineSchema && props.errors.inlineSchema) || (props.touched.schemaString && props.errors.schemaString)) &&
                        <span className="usa-error-message" id="input-error-message" role="alert">{props.errors.inlineSchema || props.errors.schemaString}</span>
                    }
                    <div className="usa-radio ">
                        <input
                            className="usa-radio__input"
                            id="iriString"
                            type="radio"
                            name="schemaType"
                            value="iriString"
                            onChange={() => toggleSchemaType('schemaString')}
                            checked={props.values.schemaType === 'schemaString'}

                        />
                        <label className="usa-radio__label" htmlFor="iriString">
                            <div className="title">IRI</div>
                            <Field
                                name="schemaString"
                                type="text"
                                id="schemaString"
                                className={
                                    `description ${props.values.schemaType === "schemaString" && !props.isPublished ? "usa-input" : "usa-input disabled"} 
                                    ${(props.touched.schemaString && props.errors.schemaString && props.values.schemaType === 'schemaString') ?
                                        "usa-input--error" : ""}`
                                }
                                value={props.values.schemaString}
                                onChange={(e) => updateValue('schemaString', e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="usa-radio ">
                        <input
                            className="usa-radio__input"
                            id="string"
                            type="radio"
                            name="schemaType"
                            value="string"
                            onChange={() => toggleSchemaType('inlineSchema')}
                            checked={props.values.schemaType === 'inlineSchema'}
                        />
                        <label className="usa-radio__label" htmlFor="string">
                            <label className="title">String</label>
                            <Field
                                name="inlineSchema"
                                component="textarea"
                                id="inlineSchema"
                                className={
                                    `description ${props.values.schemaType === "inlineSchema" && !props.isPublished ? "usa-textarea" : "usa-textarea disabled"} 
                                    ${(props.touched.inlineSchema && props.errors.inlineSchema && props.values.schemaType === 'inlineSchema') ?
                                        "usa-input--error" : ""}`}
                                value={props.values.inlineSchema}
                                onChange={(e) => updateValue('inlineSchema', e.target.value)}
                            />
                        </label>
                    </div>
                </div>
            </fieldset>
        </div>
    )
}

export function isValidInlineSchema(value) {
    try {
        validate(value, jsonSchema, { throwError: true });
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
