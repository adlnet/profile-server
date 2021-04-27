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
import { useField } from 'formik';

export default function ErrorValidation({ name, type, children, style }) {
    const [field, meta, helpers] = useField(name);

    function decorateLabel(child, key) {
        const props = { ...child.props, className: `${child.props.className} ${meta.error && meta.touched ? "usa-label--error" : ""}` };
        return (
            <React.Fragment key={`${key}-label`}>
                {React.cloneElement(child, props)}
                {
                    meta.error && meta.touched && (
                        <span key={`${key}-error`} className="usa-error-message" id="input-error-message" role="alert">{meta.error}</span>
                    )
                }
            </React.Fragment>
        );
    }

    function decorateField(child) {
        const errorClass = `usa-${type}--error`;
        const className = `${child.props.className} ${meta.error && meta.touched ? errorClass : ""}`;
        return React.cloneElement(child, { ...child.props, className: className });
    }

    return (<>
        <div className={`usa-form-group ${meta.error && meta.touched ? "usa-form-group--error" : ""}`} style={style} >
            {React.Children.toArray(children).map((child, key) => {
                if (child.type === 'label')
                    return decorateLabel(child, `${key}-label`);
                else
                    return decorateField(child);
            })}
        </div>
    </>);
}
