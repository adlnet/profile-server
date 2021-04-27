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

import ModalBox from '../controls/modalBox';
import ModalBoxWithoutClose from '../controls/modalBoxWithoutClose';
import ErrorValidation from '../controls/errorValidation';
import { Autocomplete, TextField } from '@cmsgov/design-system';

import languages from './data/languages.json';
import CancelButton from '../controls/cancelButton';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';
import { Detail } from '../DetailComponents';

/**
 * Scope note widget, like found in Rule form.
 * @param {*} readOnly true sent from views that don't want any edit buttons
 * @param {*} isEditable is it the currentversion and is the user is a member of this profile
 * @param {*} isPublished is this template's parent profile already published - if so you can only change scope notes
 */
export default function ScopeNote(props) {
    const initialScopeNote = (props.field ? props.field.value : {}) || {};

    const convertedScopeNote = (initialScopeNote) ?
        Object.entries(initialScopeNote).map(([key, value]) => {
            const lang = languages.find(langobj => langobj.id === key)
            return {
                scopeNote: value,
                language: key,
                languageName: lang && lang.name || ''
            }
        }) : [];

    const [translations, setTranslations] = useState(convertedScopeNote);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [removing, setRemoving] = useState(null)
    const [showDetails, setShowDetails] = useState(null);
    const [showRemoveTranslationModal, setShowRemoveTranslationModal] = useState(false);

    function onFormSubmit(values) {
        let newTranslations = [...translations];

        if (editing)
            newTranslations[editing.index] = values;
        else
            newTranslations = [...newTranslations, values];

        setTranslations(newTranslations);
        props.form.setFieldValue(props.field.name, Object.fromEntries(newTranslations.map(entry => [entry.language, entry.scopeNote])));
        setShowModal(false);
        setEditing(null);
    }

    function onRemovalConfirmed() {
        if (!removing) return;
        let newTranslations = [...translations];
        newTranslations.splice(removing.index, 1);
        setTranslations(newTranslations);
        props.form.setFieldValue(props.field.name, Object.fromEntries(newTranslations.map(entry => [entry.language, entry.scopeNote])));
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
        <div className="grid-row">
            <p>
                <label className="text-bold " htmlFor="scopeNotes">Scope Notes</label><br />
                <span className="text-base font-body-2xs">
                    A Language Map describing usage details for the parts of Statements addressed by this rule.
                </span>
            </p>
            {translations.length > 0 &&
                <table style={{ margin: '0' }} className="usa-table usa-table--borderless" width="100%">
                    <thead>
                        <tr>
                            <th width="90%" scope="col" style={props.readOnly ? { padding: '4px', borderCollapse: 'collapse', border: 'none' } : { padding: '4px' }}></th>
                            <th width="10%" scope="col" style={props.readOnly ? { padding: '4px', borderCollapse: 'collapse', border: 'none' } : { padding: '4px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {translations.map((translation, key) => (
                            <tr key={key}>
                                <th scope="row" style={props.readOnly ? { marginTop: '0', borderCollapse: 'collapse', border: 'none' } : {}} colSpan={props.readOnly ? "3" : (!props.isEditable || props.isPublished) ? "2" : "1"}>
                                    <button className="usa-button usa-button--unstyled" style={{ marginTop: "0" }} type="button" onClick={() => setShowDetails(translation)}>
                                        <span>{
                                            translation.languageName ?
                                                `${translation.languageName} (${translation.language})` :
                                                `${translation.language}`
                                        }</span>
                                    </button>
                                </th>
                                {!props.readOnly && props.isEditable &&
                                    <td><button style={props.readOnly ? { marginTop: '0', borderCollapse: 'collapse', border: 'none' } : { marginTop: '0' }} className="usa-button  usa-button--unstyled" type="button" onClick={() => onEdit(key, translation)}>
                                        <span className="text-bold">Edit</span>
                                    </button></td>
                                }
                                {!props.readOnly && props.isEditable && !props.isPublished &&
                                    <td><button style={props.readOnly ? { marginTop: '0', borderCollapse: 'collapse', border: 'none' } : { marginTop: '0' }} className="usa-button  usa-button--unstyled" type="button" onClick={() => onRemove(key)}>
                                        <span className="text-bold">Remove</span>
                                    </button></td>
                                }
                            </tr>)
                        )}
                    </tbody>
                </table>
            }
        </div>
        { translations.length === 0 && props.readOnly &&
            <div className="grid-row">
                <span>None provided.</span>
            </div>
        }
        {
            !props.readOnly &&
            <button className="usa-button usa-button--outline" onClick={onAdd} type='button' style={{ marginTop: '8px' }}>Add Scope Note</button>
        }

        <ModalBoxWithoutClose show={showRemoveTranslationModal}>
            <RemoveScopeNoteConfirmation selectedLang={removing} onConfirm={onRemovalConfirmed} onCancel={onRemovalCanceled} />
        </ModalBoxWithoutClose>

        <ModalBox show={showModal} onClose={() => setShowModal(false)} isForm={true}>
            <ScopeNoteForm
                onSubmit={(values) => onFormSubmit(values)}
                onCancel={onCancel}
                initialValue={editing ? editing.translation : null}
                existingTranslations={translations}
            />
        </ModalBox>

        <ModalBox show={showDetails} onClose={() => setShowDetails(null)}>
            <ViewScopeNote
                note={showDetails}
            />
        </ModalBox>
    </>)
}

function ViewScopeNote({ note }) {
    return (
        <div className="margin-top-4 margin-x-4" style={{ width: "600px", minHeight: "400px" }}>
            <h2>Scope Note</h2>
            <Detail title='language'>
                {note.languageName ? `${note.languageName} (${note.language})` : note.language}
            </Detail>
            <Detail title={`scope note`}>
                {note.scopeNote}
            </Detail>
        </div>)
}

function ScopeNoteForm(props) {
    // get the list of languages that haven't already been selected
    const [availableLanguages, updateAvailableLanguages] = useState(languages.filter(l => !props.existingTranslations.find(et => et.language === l.id)))
    // set up state to keep the list of dropdown options
    const [langs, setLangs] = useState(availableLanguages);
    // maintain out of formik the actual field values for language
    const [languageFieldValue, setLanguageFieldValue] = useState(props.initialValue ? { id: props.initialValue.language, name: props.initialValue.languageName } : { id: '', name: '' });

    return (
        <Formik
            initialValues={props.initialValue || {
                scopeNote: '',
                language: '',
                languageName: ''
            }}
            validate={(values) => {
                let errors = {};
                if (!(languageFieldValue && languageFieldValue.id)) errors.language = 'Required'
                if (!(values && values.scopeNote)) errors.scopeNote = 'Required'
                return errors;
            }}
            onSubmit={(values) => {
                const lang = languages.find(lang => lang.language === languageFieldValue.id);
                if (lang)
                    values.languageName = lang.languageName;
                props.onSubmit(values)
            }}
        >
            {(formikProps) => (
                <div className="usa-form translation-form">
                    <h2 style={{ margin: '0 0 1em 0' }}>Add Scope Note</h2>
                    <div className="grid-row">
                        <div className="grid-col-6" >
                            <div className={''} style={{ marginTop: '0' }}>

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
                                        formikProps.setFieldTouched('language', true, true);
                                        formikProps.handleBlur('language')
                                    }}
                                    onInputValueChange={(val) => {
                                        formikProps.setFieldTouched('language', true, true);
                                        setLangs(availableLanguages.filter(lang => lang.id.toLocaleLowerCase().startsWith(val.trim().toLowerCase()) || lang.name.match(new RegExp(`.*${val.trim()}.*`, 'i'))))
                                    }}
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

                    <ErrorValidation name="scopeNote" type="input" style={{ marginTop: "1em", marginBottom: "1em" }}>
                        <label className="details-label" htmlFor="scopeNote"><span className="text-secondary">*</span>Scope notes</label>
                        <Field name="scopeNote" component="textarea" rows="3" className="usa-textarea" id="scopeNote" aria-required="true" >
                        </Field>
                    </ErrorValidation>

                    <ValidationControlledSubmitButton errors={formikProps.errors} className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>Save Scope Note</ValidationControlledSubmitButton>
                    <CancelButton className="usa-button usa-button--unstyled" type="button" cancelAction={props.onCancel} />
                </div>)
            }
        </Formik>
    );
}

function RemoveScopeNoteConfirmation(props) {
    return (<>
        <h2 className="margin-top-0">Remove Scope Note</h2>
        <div><span>Are you sure you want to remove <strong>{props.selectedLang.langObj.languageName} ({props.selectedLang.langObj.language})</strong> from this profile?</span></div>
        <button className="usa-button submit-button" type="button" onClick={props.onConfirm}>Remove Scope Note</button>
        <button className="usa-button usa-button--unstyled" type="button" onClick={props.onCancel}><b>Keep Scope Note</b></button>
    </>);
}
