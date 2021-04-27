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
import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import ModalBox from '../controls/modalBox';
import ModalBoxWithoutClose from '../controls/modalBoxWithoutClose';
import ErrorValidation from '../controls/errorValidation';
import { Autocomplete, TextField } from '@cmsgov/design-system';

import languages from './data/languages.json';
import CancelButton from '../controls/cancelButton';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';

/**
 * Translations widget.. Shows a button/form and table of translations for the current component
 * @param {*} props 
 */
export default function Translations(props) {
    const [translations, setTranslations] = useState((props.field ? props.field.value : []) || []);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [removing, setRemoving] = useState(null)
    const [showRemoveTranslationModal, setShowRemoveTranslationModal] = useState(false);

    function onFormSubmit(values) {
        let newTranslations = [...translations];

        if (editing)
            newTranslations[editing.index] = values;
        else
            newTranslations = [...newTranslations, values];

        setTranslations(newTranslations);
        props.form.setFieldValue(props.field.name, newTranslations);
        setShowModal(false);
        setEditing(null);
    }

    function onRemovalConfirmed() {
        if (!removing) return;
        let newTranslations = [...translations];
        newTranslations.splice(removing.index, 1);
        setTranslations(newTranslations);
        props.form.setFieldValue(props.field.name, newTranslations);
        setRemoving(null);
        setShowRemoveTranslationModal(false);
    }

    function onRemovalCanceled() {
        setRemoving(null);
        setShowRemoveTranslationModal(false);
    }

    function onRemove(index) {
        const languageObject = translations[index];
        setRemoving({ index: index, langObj: languageObject });
        setShowRemoveTranslationModal(true);
    }

    function onAdd() {
        setEditing(null);
        setShowModal(true)
    }

    function onEdit(index, translation) {
        setEditing({ index: index, translation: translation });
        setShowModal(true);
    }

    function onCancel() {
        setShowModal(false);
        setEditing(null);
    }

    return (<>
        {translations.length > 0 &&
            <div className="grid-row">
                <table style={{ margin: '0' }} className="usa-table usa-table--borderless" width="100%">
                    <thead>
                        <tr>
                            <th width="90%" scope="col" style={{ padding: '4px' }}></th>
                            <th width="10%" scope="col" style={{ padding: '4px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {translations.map((translation, key) => (
                            <tr key={key}>
                                <th scope="row">
                                    <span>{
                                        translation.languageName ?
                                            `${translation.languageName} (${translation.language})` :
                                            `${translation.language}`
                                    }</span>
                                </th>
                                <td><button style={{ marginTop: '0' }} className="usa-button  usa-button--unstyled" type="button" onClick={() => onEdit(key, translation)}>
                                    <span className="text-bold">Edit</span>
                                </button></td>
                                <td><button style={{ marginTop: '0' }} className="usa-button  usa-button--unstyled" type="button" onClick={() => onRemove(key)}>
                                    <span className="text-bold">Remove</span>
                                </button> </td>
                            </tr>)
                        )}
                    </tbody>
                </table>
            </div>
        }
        <button className="usa-button usa-button--outline" onClick={onAdd} type='button' style={{ marginTop: '8px' }}>Add Translation</button>

        <ModalBoxWithoutClose show={showRemoveTranslationModal}>
            <RemoveTranslationConfirmation selectedLang={removing} onConfirm={onRemovalConfirmed} onCancel={onRemovalCanceled} />
        </ModalBoxWithoutClose>

        <ModalBox show={showModal} onClose={() => setShowModal(false)} isForm={true}>
            <TranslationForm
                onSubmit={(values) => onFormSubmit(values)}
                onCancel={onCancel}
                initialValue={editing ? editing.translation : null}
                existingTranslations={translations}
            />
        </ModalBox>
    </>)
}

function TranslationForm(props) {
    let nonEnLangs = languages.filter(val => (val.id !== "en"));
    nonEnLangs = nonEnLangs.filter(val => !props.existingTranslations.find(et => et.language === val.id))

    const [langs, setLangs] = useState(nonEnLangs);
    // maintain out of formik the actual field values for language
    const [languageFieldValue, setLanguageFieldValue] = useState(props.initialValue ? { id: props.initialValue.language, name: props.initialValue.languageName } : { id: '', name: '' });


    return (<>
        <Formik
            initialValues={props.initialValue || { translationName: '', translationDesc: '', language: '', languageName: '' }}
            validate={(values) => {
                let errors = {};
                if (!(languageFieldValue && languageFieldValue.id)) errors.language = 'Required';
                if (!(values && values.translationName)) errors.translationName = 'Required';
                if (!(values && values.translationDesc)) errors.translationDesc = 'Required';

                return errors;
            }}
            onSubmit={(values) => {
                const lang = nonEnLangs.find(lang => lang.language === languageFieldValue.id);
                if (lang)
                    values.languageName = lang.languageName;
                props.onSubmit(values)
            }}
        >
            {(formikProps) => (
                <div className="usa-form translation-form">
                    <h2 style={{ margin: '0 0 1em 0' }}>Add Translation</h2>
                    <div className="grid-row">
                        <div className="grid-col-6" >
                            <div style={{ marginTop: '0' }}>
                                <Autocomplete
                                    items={langs}
                                    loadingMessage="Loading"
                                    noResultsMessage="No results found"
                                    initialSelectedItem={formikProps.values.language ? { id: formikProps.values.language, name: formikProps.values.languageName } : null}
                                    clearSearchButton={false}
                                    onChange={async (selectedItem) => {
                                        await setLanguageFieldValue(selectedItem)
                                        formikProps.setFieldValue('language', selectedItem.id);
                                        formikProps.setFieldValue('languageName', selectedItem.name);
                                        formikProps.setFieldTouched('language', true, true)
                                        formikProps.handleBlur('language')
                                    }}
                                    onInputValueChange={(val) => {
                                        formikProps.setFieldTouched('language', true, true)
                                        setLangs(nonEnLangs.filter(lang => lang.id.toLocaleLowerCase().startsWith(val.trim().toLowerCase()) || lang.name.match(new RegExp(`.*${val.trim()}.*`, 'i'))))
                                    }
                                    }
                                >
                                    <TextField
                                        className={`${formikProps.errors.language ? "usa-form-group--error" : ""}`}
                                        fieldClassName={`${formikProps.errors.language ? "usa-input--error" : ""}`}
                                        labelClassName={`details-label margin-top-0`}
                                        label={<>
                                            <span className="text-secondary">*</span>
                                                Language
                                                {
                                                formikProps.errors.language && (<>
                                                    <br /><span className="usa-error-message padding-right-1" id="input-error-message" role="alert">{formikProps.errors.language}</span>
                                                </>)
                                            }
                                        </>}
                                        name="language"
                                        style={{ border: "1px solid #000000", borderRadius: "0", fontFamily: "Source Sans Pro Web,Helvetica Neue,Helvetica,Roboto,Arial,sans-serif, FontAwesome" }}
                                        placeholder="&#xf002; Search languages"
                                    />
                                </Autocomplete>
                            </div>
                        </div>
                    </div>

                    <ErrorValidation name="translationName" type="input">
                        <label className="usa-label details-label" htmlFor="translationName"><span className="text-secondary">*</span>Name</label>
                        <Field name="translationName" component="input" rows="3" className="usa-input" id="translationName" aria-required="true" >
                        </Field>
                    </ErrorValidation>

                    <ErrorValidation name="translationDesc" type="input">
                        <label className="usa-label details-label" htmlFor="translationDesc"><span className="text-secondary">*</span>Description</label>
                        <Field name="translationDesc" component="textarea" rows="3" className="usa-textarea" id="translationDesc" aria-required="true" >
                        </Field>
                    </ErrorValidation>

                    <ValidationControlledSubmitButton errors={formikProps.errors} className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>Save Language</ValidationControlledSubmitButton>
                    <CancelButton className="usa-button usa-button--unstyled" type="button" cancelAction={props.onCancel} />
                </div>)
            }
        </Formik>
    </>)
}

function RemoveTranslationConfirmation(props) {
    return (<>
        <h2 className="margin-top-0">Remove Translation</h2>
        <div><span>Are you sure you want to remove <strong>{props.selectedLang.langObj.languageName} ({props.selectedLang.langObj.language})</strong> from this profile?</span></div>
        <button className="usa-button submit-button" type="button" onClick={props.onConfirm}>Remove Translation</button>
        <button className="usa-button usa-button--unstyled" type="button" onClick={props.onCancel}><b>Keep Translation</b></button>
    </>);
}
