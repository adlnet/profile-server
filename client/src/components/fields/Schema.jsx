/** ***********************************************************************
*
* Veracity Technology Consultants
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
import React, {useState} from 'react';

export default function Schemas(props)
{
    let initial = props.field.initialValue;
    let [schema, setSchema] = useState(initial || {});

    function setType(type)
    {
        schema = Object.assign({},schema, {type})
        setSchema(schema);
        if(props.form)
            props.form.setFieldValue(props.field.name, schema[schema[type]]);
    }
    function setVal(type,val)
    {
        schema = Object.assign({},schema, {[type]:val})
        setSchema(schema);
        if(props.form)
            props.form.setFieldValue(props.field.name, schema[schema[type]]);
    }
    return <form className="usa-form schema">
            <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span>Schema</label>
            <fieldset className="usa-fieldset">
                <div className="usa-radio ">
                    <input className="usa-radio__input" id="activity" type="radio" name="activity" value="activity" onChange={() => setType("IRI")} checked={schema.type == "IRI"}></input>
                    <label className="usa-radio__label" htmlFor="activity">
                        <div className="title">IRI</div>
                        <div className="description">
                        <input type="text" className={schema.type == "IRI" ? "usa-input" : "usa-input disabled"} value={schema["IRI"]} onChange={(e) => setVal("IRI",e.target.value)}></input>
                        </div>
                    </label>
                </div>
                <div className="usa-radio ">
                    <input className="usa-radio__input" id="activityType" type="radio" onChange={() => setType("String")} checked={schema.type == "String"} name="activityType" value="activityType"></input>
                    <label className="usa-radio__label" htmlFor="activityType">
                        <div className="title">String</div>
                        <div className="description">
                        <textArea  className={schema.type == "String" ? "usa-textarea" : "usa-textarea disabled"} value={schema["String"]} onChange={(e) => setVal("String",e.target.value)}></textArea>
                        </div>
                    </label>
                </div>
                
            </fieldset>
        </form>

}