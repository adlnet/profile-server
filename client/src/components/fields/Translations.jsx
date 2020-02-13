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
function TranslationForm(props) {

    return <div className="profile-lightbox">
        <div className="profile-lightbox-inner">
            <h2>Add Translation</h2>
            <div className="profile-lightbox-close" onClick={() => { props.onClosed(); }} ><span className="fa fa-close"></span></div>
            <Formik
                initialValues={props.initialValue || { name: '', description: '', language: "English" }}
                validationSchema={null}
                onSubmit={(values) => {
                    props.onCreated(values);
                    props.onClosed();
                }}

            >
                <Form className="usa-form "> {/*style={{maxWidth: 'inherit'}}>*/}
                    <label className="usa-label" htmlFor="language"><span className="text-secondary">*</span>Language</label>
                    <Field name="language" component="select" rows="3" className="usa-select" id="language" aria-required="true" >
                        <option value="lang1">Lang 1</option>
                        <option value="lang2">Lang 2</option>
                        <option value="lang3">Lang 3</option>
                    </Field>
                    <ErrorMessage name="language" />


                    <label className="usa-label" htmlFor="translationName"><span className="text-secondary">*</span>Name</label>
                    <Field name="translationName" component="input" rows="3" className="usa-input" id="translationName" aria-required="true" >
                    </Field>
                    <ErrorMessage name="translationName" />

                    <label className="usa-label" htmlFor="translationDesc"><span className="text-secondary">*</span>Description</label>
                    <Field name="translationDesc" component="textarea" rows="3" className="usa-textarea" id="translationDesc" aria-required="true" >
                    </Field>
                    <ErrorMessage name="translationDesc" />
                    <button className="usa-button" type="submit">Save Translation</button>  <button className="usa-button usa-button--unstyled" type="reset" onClick={(e) => { e.preventDefault(); props.onClosed(); }}>Cancel</button>
                </Form>
            </Formik>
        </div>
    </div>
}
function AddTranslation(props) {
    let [showing, updateShowing] = useState(props.showing);

    return <>
        <button onClick={(e) => { e.preventDefault(); updateShowing(!showing) }} className="usa-button usa-button--outline">Add Translation</button>
        {showing && <TranslationForm {...props} onClosed={() => updateShowing(false)}></TranslationForm>}
    </>
}

export function Translations(props) {


    let [translations, updateTranslations] = useState((props.field ? props.field.value : []) || []);
    let [editing, setEdit] = useState(-1);
    let [selected, setSelected] = useState({});

    function added(e) {
        translations = [...translations, e];
        updateTranslations([...translations]);
        setEdit(-1);
        setSelected(null);
        //  if(props.field)
        //    props.field.onChange(translations);
        if (props.form)
            props.form.setFieldValue(props.field.name, translations);
    }
    function remove(i) {
        translations = [...translations];
        translations.splice(i, 1);
        updateTranslations(translations);
        //    if(props.field)
        //        props.field.onChange(translations);
        if (props.form)
            props.form.setFieldValue(props.field.name, translations);
    }
    function edit(t, i) {
        setEdit(i);
        setSelected(t);
    }
    function cancelEdit() {
        setEdit(-1);
        setSelected(null);
    }
    function edited(t, i) {

        translations = [...translations]
        translations[i] = t;
        updateTranslations(translations);
        setEdit(-1);
        setSelected(null);
        if (props.form)
            props.form.setFieldValue(props.field.name, translations);
    }
    return <div>
        {translations.map((t, i) => {
            return (
                <div className="translationRow" key={i}>
                    <span>{t.language}</span>
                    <button className="usa-button usa-button--unstyled" type="reset" onClick={(e) => { e.preventDefault(); remove(i) }}>Remove</button>
                    <button className="usa-button usa-button--unstyled" type="reset" onClick={(e) => { e.preventDefault(); edit(t, i) }}>Edit</button>
                    {editing == i ? <TranslationForm initialValue={selected} showing={true} onCreated={(t) => edited(t, i)} onClosed={() => cancelEdit()}></TranslationForm> : ""}
                </div>
            )
        })}
        <AddTranslation onCreated={(e) => added(e)} ></AddTranslation>
    </div>
}