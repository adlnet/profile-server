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
import { Formik, Field, Form, ErrorMessage } from 'formik';

import { Translations } from "../fields/Translations"
import Schemas from "../fields/Schema"

function renderPage(props, form, updateForm, type, updateType, page, updatePage) {
    function handleIriChange() {

        form.hasIri = !form.hasIri;
        updateForm(Object.assign({}, form));
    }
    function cancel() {

        if (props.onCancel)
            props.onCancel();
    }
    function typeToString(type) {
        switch (type) {
            case "activity": return "Activity";
            case "activityType": return "Activity Type";
            case "attachmentUsage": return "Activity Usage Type";
            case "document": return "Document";
            case "extension": return "Extension";
            case "verb": return "Verb";
            default: return "";
        }
    }
    if (page == "type") {
        return <> <form className="usa-form">
            <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span>What type of concept will this be?</label>
            <fieldset className="usa-fieldset">
                <div className="usa-radio ">
                    <input className="usa-radio__input" id="activity" type="radio" name="activity" value="activity" onChange={() => updateType("activity")} checked={type == "activity"}></input>
                    <label className="usa-radio__label" htmlFor="activity">
                        <div className="title">Activity</div>
                        <div className="description">Identifies a specific object which will be interacted with by an actor in a statement. It can be a unit of instruction, experience, or performance that is to be tracked in meaningful combination with a Verb. Interpretation of Activity is broad, and can include tangible objects such as a chair (real or virtual). In the Statement &quotAnna tried a cake recipe&quot, the recipe constitutes the Activity in terms of the xAPI Statement.</div>
                    </label>
                </div>
                <div className="usa-radio ">
                    <input className="usa-radio__input" id="activityType" type="radio" onChange={() => updateType("activityType")} checked={type == "activityType"} name="activityType" value="activityType"></input>
                    <label className="usa-radio__label" htmlFor="activityType">
                        <div className="title">Activity Type</div>
                        <div className="description">Identifies the type of activity in a broader category. For example, a course, video, book, or assessment.</div>
                    </label>
                </div>
                <div className="usa-radio ">
                    <input className="usa-radio__input" id="attachmentUsage" type="radio" name="attachmentUsage" value="attachmentUsage" onChange={() => updateType("attachmentUsage")} checked={type == "attachmentUsage"}></input>
                    <label className="usa-radio__label" htmlFor="attachmentUsage">
                        <div className="title">Attachment Usage Type</div>
                        <div className="description">Identifies the type of usage of this Attachment. For example, one expected use case for Attachments is to include a &quotcompletion certificate&quot.</div>
                    </label>
                </div>
                <div className="usa-radio ">
                    <input className="usa-radio__input" id="document" type="radio" name="document" value="document" onChange={() => updateType("document")} checked={type == "document"}></input>
                    <label className="usa-radio__label" htmlFor="document">
                        <div className="title">Document</div>
                        <div className="description">Identifies information about the data to be stored in the State, Agent Profile, and Activity Profile Resources..</div>
                    </label>
                </div>

                <div className="usa-radio ">
                    <input className="usa-radio__input" id="extension" type="radio" name="extension" value="extension" onChange={() => updateType("extension")} checked={type == "extension"}></input>
                    <label className="usa-radio__label" htmlFor="extension">
                        <div className="title">Extension</div>
                        <div className="description">Identifies information about the data to be stored in the Context, Result, and Activity Extensions.</div>
                    </label>
                </div>
                <div className="usa-radio ">
                    <input className="usa-radio__input" id="verb" type="radio" name="verb" value="verb" onChange={() => updateType("verb")} checked={type == "verb"}></input>
                    <label className="usa-radio__label" htmlFor="verb">
                        <div className="title">Verb</div>
                        <div className="description">Identifies the action to be done by the actor a statement.</div>
                    </label>
                </div>
            </fieldset>
        </form>
            <button className="usa-button" onClick={() => { updatePage("form") }} type="">Continue</button>  <button onClick={() => cancel()} className="usa-button usa-button--unstyled" type="reset">Cancel</button>
        </>
    }
    else if (page == "form") {

        return (
            <Formik
                initialValues={props.initialValue || {}}
                validationSchema={null}
                onSubmit={(values) => {
                    values = JSON.parse(JSON.stringify(values))
                    values.type = type;
                    values.hasIri = form.hasIri;
                    props.onCreated(values)
                }}

            >
                <div className="profile-form-frame">


                    <Form className="usa-form "> {/*style={{maxWidth: 'inherit'}}>*/}
                        <h2>Define {typeToString(type)} Details</h2><label className="usa-label" htmlFor="description"><span className="text-secondary">*</span> indicates required field</label>
                        <p>Instructions</p>
                        <fieldset className="usa-fieldset">

                            <input name="" type="checkbox" checked={!!form.hasIri} className="usa-checkbox__input" />
                            <label className="usa-checkbox__label" onClick={(e) => handleIriChange(e)} htmlFor="hasIri">This concept already has an IRI that is used in xAPI statements</label>
                            {
                                form.hasIri ? <>
                                    <label className="usa-label" htmlFor="iri"><span className="text-secondary">*</span> IRI</label>
                                    <Field name="iri" type="text" className="usa-input" id="iri" aria-required="true" />
                                </> : ""
                            }

                            <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span>Concept Name</label>
                            <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                            <ErrorMessage name="name" />

                            <label className="usa-label" htmlFor="description"><span className="text-secondary">*</span> Description</label>
                            <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
                            <ErrorMessage name="description" />

                            <label className="usa-label" htmlFor="translations"><span className="text-secondary">*</span> Translations</label>
                            <Field name="translations" component={Translations} id="translations" aria-required="true" >
                            </Field>

                            {
                                (type == "activity" || type == "activityType" || type == "attachmentUsageType") ? <>
                                    <label className="usa-label" htmlFor="moreInfo"><span className="text-secondary">*</span>More Information</label>
                                    <Field name="moreInfo" type="text" rows="3" className="usa-input" id="input-description" aria-required="true" >
                                    </Field>
                                    <ErrorMessage name="moreInfo" />
                                </> : ""
                            }
                            {
                                (type == "activity") ? <>
                                    <label className="usa-label" htmlFor="activityType"><span className="text-secondary">*</span>ActivityType</label>
                                    <Field name="activityType" type="text" rows="3" className="usa-input" id="input-description" aria-required="true" >
                                    </Field>
                                    <ErrorMessage name="activityType" />
                                </> : ""
                            }
                            {
                                type == "document" ? <>
                                    <label className="usa-label" htmlFor="documentResourceType"><span className="text-secondary">*</span>Document Resource Type</label>
                                    <Field name="documentResourceType" component="select" rows="3" className="usa-select" id="documentResourceType" aria-required="true" >
                                        <option value="state">State</option>
                                        <option value="agentProfile">Agent Profile</option>
                                        <option value="activityProfile">Activity Profile</option>
                                    </Field>
                                    <ErrorMessage name="documentResourceType" />

                                    <label className="usa-label" htmlFor="mediaType"><span className="text-secondary">*</span>Media Type</label>
                                    <Field name="mediaType" component="select" rows="3" className="usa-select" id="mediaType" aria-required="true" >
                                        <option value="json">JSON</option>
                                        <option value="text">Text</option>
                                        <option value="binary">Binary</option>
                                    </Field>
                                    <ErrorMessage name="mediaType" />

                                    <label className="usa-label" htmlFor="contextIri"><span className="text-secondary">*</span>Context IRI</label>
                                    <Field name="contextIri" component="text" rows="3" className="usa-input" id="input-description" aria-required="true" >
                                    </Field>
                                    <ErrorMessage name="contextIri" />
                                </> : ""

                            }
                            {
                                type == "extension" ? <>
                                    <label className="usa-label" htmlFor="extensionType"><span className="text-secondary">*</span>Extension Type</label>
                                    <Field name="extensionType" component="select" rows="3" className="usa-select" id="extensionType" aria-required="true" >
                                        <option value="activity">Activity</option>
                                        <option value="context">Context</option>
                                        <option value="result">Result</option>
                                    </Field>
                                    <ErrorMessage name="extensionType" />



                                    <label className="usa-label" htmlFor="contextIri"><span className="text-secondary">*</span>Context IRI</label>
                                    <Field name="contextIri" type="text" rows="3" className="usa-input" id="input-description" aria-required="true" >
                                    </Field>
                                    <ErrorMessage name="contextIri" />


                                </> : ""

                            }
                            {
                                (type == "extension" || type == "document") && <>

                                    <Field name="_schema" component={Schemas} id="_schema" aria-required="true" ></Field>
                                </>
                            }

                            <button className="usa-button" type="submit">
                                {
                                    props.initialValue ? "Edit Concept" : "Create Concept"
                                }
                            </button>  <button onClick={() => cancel()} className="usa-button usa-button--unstyled" type="reset">Cancel</button>
                        </fieldset>
                    </Form>
                </div>
            </Formik>
        );
    }
}
export default function CreateConceptForm(props) {

    let [page, updatePage] = useState("type");
    let [type, updateType] = useState(props.initialValue ? props.initialValue.type : "");
    let [form, updateForm] = useState({
        hasIri: props.initialValue ? props.initialValue.hasIri : false
    });

    if (!page) {
        updatePage("type");
        return <></>;
    }
    return <>
        <h2>{
            props.initialValue ? "Edit Concept" : "Create Concept"
        }</h2>
        {renderPage(props, form, updateForm, type, updateType, page, updatePage)}
    </>

}






