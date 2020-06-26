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

export default function Schemas(props) {
    let initial = props.field.initialValue;
    let [schema, setSchema] = useState(initial || {});

    function setType(type) {
        schema = Object.assign({}, schema, { type })
        setSchema(schema);
        if (props.form)
            props.form.setFieldValue(props.field.name, schema[schema[type]]);
    }
    function setVal(type, val) {
        schema = Object.assign({}, schema, { [type]: val })
        setSchema(schema);
        if (props.form)
            props.form.setFieldValue(props.field.name, schema[schema[type]]);
    }
    return <form className="usa-form schema">
        <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span>
            <span className="text-uppercase text-thin text-base font-sans-3xs">Schema</span>
        </label>
        <fieldset className="usa-fieldset">
            <div className="usa-radio ">
                <input className="usa-radio__input" id="activity" type="radio" name="activity" value="activity" onChange={() => setType("IRI")} checked={schema.type == "IRI"}></input>
                <label className="usa-radio__label" htmlFor="activity">
                    <div className="title">IRI</div>
                    <div className="description">
                        <input type="text" className={schema.type == "IRI" ? "usa-input" : "usa-input disabled"} value={schema["IRI"]} onChange={(e) => setVal("IRI", e.target.value)}></input>
                    </div>
                </label>
            </div>
            <div className="usa-radio ">
                <input className="usa-radio__input" id="activityType" type="radio" onChange={() => setType("String")} checked={schema.type == "String"} name="activityType" value="activityType"></input>
                <label className="usa-radio__label" htmlFor="activityType">
                    <div className="title">String</div>
                    <div className="description">
                        <textArea className={schema.type == "String" ? "usa-textarea" : "usa-textarea disabled"} value={schema["String"]} onChange={(e) => setVal("String", e.target.value)}></textArea>
                    </div>
                </label>
            </div>

        </fieldset>
    </form>

}