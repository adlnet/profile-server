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
import { Field } from 'formik';
import CancelButton from '../controls/cancelButton';


export default function ChoosePropertyType({ propertyType, onPropertyChange, setNextStep, onCancel }) {

    return (
        <div>
            <h2 className="margin-top-1">Add Determining Property</h2>
            <div className="margin-bottom-1"><span className="text-secondary">*</span><span> Choose the type of property that must be included in a statement to be matched to this template for validation.</span></div>

            <fieldset className="usa-fieldset">
                <Field
                    component={RadioButton}
                    name="propertyType"
                    id="verb"
                    label="verb"
                    onChange={propertyTypeArg => onPropertyChange(propertyTypeArg)}
                />
                <Field
                    component={RadioButton}
                    name="propertyType"
                    id="objectActivityType"
                    label="objectActivityType"
                    onChange={propertyTypeArg => onPropertyChange(propertyTypeArg)}
                />
                <Field
                    component={RadioButton}
                    name="propertyType"
                    id="contextCategoryActivityType"
                    label="contextCategoryActivityType"
                    onChange={propertyTypeArg => onPropertyChange(propertyTypeArg)}
                />
                <Field
                    component={RadioButton}
                    name="propertyType"
                    id="contextGroupingActivityType"
                    label="contextGroupingActivityType"
                    onChange={propertyTypeArg => onPropertyChange(propertyTypeArg)}
                />
                <Field
                    component={RadioButton}
                    name="propertyType"
                    id="contextOtherActivityType"
                    label="contextOtherActivityType"
                    onChange={propertyTypeArg => onPropertyChange(propertyTypeArg)}
                />
                <Field
                    component={RadioButton}
                    name="propertyType"
                    id="contextParentActivityType"
                    label="contextParentActivityType"
                    onChange={propertyTypeArg => onPropertyChange(propertyTypeArg)}
                />
                <Field
                    component={RadioButton}
                    name="propertyType"
                    id="attachmentUsageType"
                    label="attachmentUsageType"
                    onChange={propertyTypeArg => onPropertyChange(propertyTypeArg)}
                />
            </fieldset>

            <button className="usa-button submit-button" type="button" onClick={setNextStep} disabled={!propertyType}>Continue</button>
            <CancelButton className="usa-button usa-button--unstyled" type="reset" cancelAction={onCancel} />
        </div>
    );
}

function RadioButton(props) {

    function onChange() {
        props.form.setFieldValue(props.field.name, props.id);
        props.onChange(props.id);
    }

    return (
        <div className="usa-radio">
            <input
                className="usa-radio__input"
                name={props.field.name}
                id={props.id}
                type="radio"
                value={props.id}
                checked={props.id === props.field.value}
                onChange={onChange}
            />
            <label className="usa-radio__label" htmlFor={props.id}>{props.label}</label>
        </div>
    );
}
