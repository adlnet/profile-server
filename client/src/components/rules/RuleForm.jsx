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
import { useHistory } from 'react-router-dom';

import { validate } from 'jsonschema';
import ScopeNote from '../fields/ScopeNote';
import { useState } from 'react';
import ruleSchema from './data/ruleSchema.json';
import { useDispatch, useSelector } from 'react-redux';
import { editTemplate, selectTemplate } from '../../actions/templates';
import CancelButton from '../controls/cancelButton';
import { CREATED, EDITED } from '../../actions/successAlert';
import { validateRuleContent } from '../../utils/ruleContentValidation';

export default function RuleForm({ rule, jsonPath, returnTo, isEditable, isPublished, isEditing }) {
    const history = useHistory();
    const [errorText, setErrorText] = useState('');
    const [successText, setSuccessText] = useState('');
    const [validated, setValidated] = useState(false);
    const template = useSelector((state) => state.application.selectedTemplate);
    const determiningProperties = useSelector((state) => state.application.selectedDeterminingProperties);
    const dispatch = useDispatch();

    let newrule = rule ? rule : jsonPath ? { location: jsonPath.join('.') } : {};

    // if rule property exists, remove any empty arrays or strings, and remove anything that isn't part of a rule
    let rulesString = Object.fromEntries(Object.entries(rule || newrule).map(([key, value]) => {
        if (!['location', 'selector', 'presence', 'any', 'all', 'none'].includes(key)) return;
        if (value.trim && !value.trim().length) return;
        if (Array.isArray(value) && !value.length) return;
        return [key, value];
    }).filter(e => e));

    // make it a string, then remove { and }
    rulesString = JSON.stringify(rulesString, null, 2).slice(1, -1);

    const validateRule = (rule, manualValidation) => {
        setErrorText('')
        setSuccessText('')
        const errors = {};

        try {
            let ruleObject = JSON.parse(`{${rule}}`);
            validate(ruleObject, ruleSchema, { throwError: true });
            validateRuleContent(determiningProperties, ruleObject);
            setValidated(true);
            if (manualValidation) {
                setSuccessText('JSON format and properties are valid.')
                setTimeout(() => setSuccessText(''), 2000);
            }
        } catch (e) {
            setValidated(false)
            setErrorText(e.message)
            errors.rule = e.message;
        }

        return errors;
    }

    return (<>
        <Formik
            initialValues={{ rule: rulesString, _id: rule && rule._id || '', scopeNote: rule && rule.scopeNote || {} }}
            onSubmit={async ({ rule, scopeNote, _id }) => {
                let value = { ...JSON.parse(`{${rule}}`), scopeNote };

                if (_id.trim()) value._id = _id;

                let updatedTemplate = Object.assign({}, template);

                if (updatedTemplate.rules && updatedTemplate.rules.length) {
                    if (value._id) {
                        updatedTemplate.rules = updatedTemplate.rules.filter(rule => rule._id !== value._id)
                    }
                    updatedTemplate.rules = [...updatedTemplate.rules, value]
                } else {
                    updatedTemplate.rules = [value];
                }

                await dispatch(editTemplate(updatedTemplate, isEditing ? EDITED : CREATED, "Rule"));
                await dispatch(selectTemplate(updatedTemplate.uuid));
                history.push(returnTo);
            }}
        >
            {props =>
                <>
                    <form className="usa-form" style={{ maxWidth: "none", width: "100%" }} onSubmit={props.handleSubmit}>
                        <div className="grid-row">
                            <div className="grid-col">
                                <fieldset className="usa-fieldset" style={{ border: "1px solid #f0f0f0", padding: "2em" }}>
                                    <span className="text-bold">Enter rule. Only  one rule per location.</span>
                                    <label className="usa-label" htmlFor="rule">
                                        <span className="font-code-2xs" style={{ fontWeight: "lighter" }}>"rules": [</span><br />
                                        <span className="font-code-2xs padding-left-4" style={{ fontWeight: "lighter" }}>&#123;</span>
                                    </label>
                                    <div className="grid-row margin-top-05">
                                        <div className="grid-col-7 padding-left-4">
                                            <Field
                                                name="rule"
                                                component="textarea"
                                                disabled={isPublished}
                                                rows="15"
                                                className="font-code-3xs"
                                                id="rule"
                                                aria-required="true"
                                                style={{ width: "100%", fontWeight: "lighter", resize: "none" }}>
                                            </Field>
                                        </div>
                                        <div className="grid-col-5" style={{ paddingBottom: "5px" }}>
                                            <div className="border-y border-right border-base bg-base-lighter " style={{ overflowX: "hidden", overflowY: "auto", maxHeight: "216px" }}>
                                                <RuleInstructionText></RuleInstructionText>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-code-sm padding-left-4" style={{ fontWeight: "lighter" }}>&#125;</span><br />
                                        <span className="font-code-sm" style={{ fontWeight: "lighter" }}>]</span>
                                    </div>
                                    <div>
                                        <Field name="scopeNote" component={ScopeNote} id="scopeNote" isEditable={isEditable} isPublished={isPublished}></Field>
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </form>
                    {
                        errorText &&
                        <div className="grid-row">
                            <div className="usa-alert usa-alert--error usa-alert--slim" style={{ width: "100%" }} >
                                <div className="usa-alert__body">
                                    <p className="usa-alert__text">{errorText}</p>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        successText &&
                        <div className="grid-row">
                            <div className="usa-alert usa-alert--success usa-alert--slim" style={{ width: "100%" }} >
                                <div className="usa-alert__body">
                                    <p className="usa-alert__text">{successText}</p>
                                </div>
                            </div>
                        </div>
                    }
                    <div className="grid-row margin-top-2">
                        <div className="grid-col">
                            <div className="">
                                <button className="usa-button margin-right-3" onClick={() => validateRule(props.values.rule, true)}>Check JSON Format</button>
                                <button className="usa-button margin-right-3" disabled={!validated} onClick={props.handleSubmit}>{rule ? 'Save' : 'Add'} Rule</button>
                                <CancelButton className="usa-button usa-button--unstyled" type="button" cancelAction={() => history.push(returnTo)} />
                            </div>
                        </div>
                    </div>
                </>
            }
        </Formik>
    </>);
}

function RuleInstructionText() {
    return (
        <div className="padding-x-1 font-body-2xs">
            <p className="margin-top-1">
                There are two ways to set rules for a statement. One is through presence and the other through specifying values.
                Presence describes which locations in an xAPI statement are important to the statement. If the goal is to receive
                data in a specific location, but it is not important what data is to be in the location, &nbsp;
            <span className="font-code-3xs text-base-dark">“presence”: “included”</span> is the best way to do that.
            </p>
            <p>
                <span className="text-bold">Presence</span><br />
                Presence describes whether a specified location should be used to conform to this template.
            </p>
            <ul>
                <li><strong>included</strong>, the location must be present with a value in every statement to conform to this template</li>
                <li><strong>excluded</strong>, this location should not be in any statement to conform to this template</li>
                <li><strong>recommended</strong>, this location should be present, but it will not fail validation to this template if it is excluded</li>
            </ul>
            <p className="margin-bottom-0">
                <span className="text-bold">Example of Presence:</span><br />
            </p>
            <pre className="text-base-dark margin-0" style={{ whiteSpace: "pre-wrap", fontSize: "12px", wordWrap: "break-word" }}>
                {`
"rules": [
    {
        "location": "context.contextActivities.grouping[*].id",
        "presence": "included"
    }
]
`}
            </pre>
            <p>
                <em>In this example, a statement must include an ID for every activity in the context activities grouping array in order to
                    conform to this statement template.</em>
            </p>

            <p>
                <span className="text-bold">Specifying Values</span><br />
                If just saying whether or not a location should be in the statement is not enough, the following can be used to identify which data will
                allow a statement to validate to this template.
            </p>
            <ul>
                <li><strong>any</strong>, any of the values listed are allowed to be in the specified location in order for a statement to validate to a template. When any is used, a list of potential values must be included. A statement will validate to this template if at least one of the values listed is included in the specified location in the template.</li>
                <li><strong>all</strong>, all of the values in the specified location must be listed in the all array in order for a statement to validate to a template. When all is used, a list of values must be included. A statement will validate if ALL of those values are present in the statement.</li>
                <li><strong>none</strong>, none of the values listed are allowed to be in the specified location in order for a statement to validate to a template. When none is used, a list of potential values must be included. A statement will validate to this template if none of the values listed is included in the specified location in the template.</li>
            </ul>
            <p className="margin-bottom-0">
                <span className="text-bold">Example of using any:</span><br />
            </p>
            <pre className="text-base-dark margin-0" style={{ whiteSpace: "pre-wrap", fontSize: "12px", wordWrap: "break-word" }}>
                {`
"rules": [
    {
        "location": "context.contextActivities.grouping[*].definition.type",
        "any": ["http://adlnet.gov/expapi/activities/attempt"]
    }
]
`}
            </pre>
            <p>
                <em>In this example, a statement must use the activity type of “http://adlnet.gov/expapi/activities/attempt” as the definition of type
                    for context activities grouping as at least one of the provided definition types and the statement will conform to this statement template.</em>
            </p>


        </div>)
}
