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

/**
 * 
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
                <label className="text-bold" htmlFor="scopeNotes">Scope Notes</label><br />
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
                <span className="text-base font-body-xs text-italic">(none)</span>
            </div>
        }
        {
            !props.readOnly &&
            <button className="usa-button usa-button--outline" onClick={onAdd} type='button' style={{ marginTop: '8px' }}>Add Scope Note</button>
        }

        <ModalBoxWithoutClose show={showRemoveTranslationModal}>
            <RemoveScopeNoteConfirmation selectedLang={removing} onConfirm={onRemovalConfirmed} onCancel={onRemovalCanceled} />
        </ModalBoxWithoutClose>

        <ModalBox show={showModal} onClose={() => setShowModal(false)}>
            <ScopeNoteForm
                onSubmit={(values) => onFormSubmit(values)}
                onCancel={onCancel}
                initialValue={editing ? editing.translation : null}
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
    return (<div className="margin-top-4 margin-x-4" style={{ width: "600px", minHeight: "400px" }}>
        <div className="grid-row"><div className="grid-col-12"><h2>{note.languageName ? `${note.languageName} (${note.language})` : note.language}</h2></div></div>
        <div className="grid-row"><div className="grid-col-12">{note.scopeNote}</div></div>
    </div>)
}

function ScopeNoteForm(props) {
    const [langs, setLangs] = useState(languages);

    return (
        <Formik
            initialValues={props.initialValue || {
                scopeNote: '',
                language: '',
                languageName: ''
            }}
            validationSchema={Yup.object({
                language: Yup.string()
                    .required('Required'),
                languageName: Yup.string(),
                scopeNote: Yup.string()
                    .required('Required')
            })}
            onSubmit={(values) => {
                const lang = languages.find(lang => lang.language === values.language);
                if (lang)
                    values.languageName = lang.languageName;
                props.onSubmit(values)
            }}
        >
            {({ values, handleSubmit, setFieldValue }) => (
                <div className="usa-form translation-form">
                    <h2 style={{ margin: '0' }}>Add Scope Note</h2>
                    <div className="grid-row">
                        <div className="grid-col-6" >
                            <ErrorValidation name="language" type="input">
                                <Autocomplete
                                    items={langs}
                                    loadingMessage="Loading"
                                    noResultsMessage="No results found"
                                    initialSelectedItem={values.language ? { id: values.language, name: values.languageName } : null}
                                    clearSearchButton={false}
                                    onChange={(selectedItem) => {
                                        setFieldValue('language', selectedItem.id);
                                        setFieldValue('languageName', selectedItem.name);
                                    }}
                                    onInputValueChange={(val) => setLangs(languages.filter(lang => lang.id.startsWith(val) || lang.name.startsWith(val)))}
                                >
                                    <TextField
                                        label={<label className="usa-label" htmlFor="language"><span className="text-secondary">*</span>Language</label>}
                                        name="language"
                                        style={{ border: "1px solid #000000", borderRadius: "0" }}
                                    />
                                </Autocomplete>
                            </ErrorValidation>
                        </div>
                    </div>

                    <ErrorValidation name="scopeNote" type="input">
                        <label className="usa-label" htmlFor="scopeNote"><span className="text-secondary">*</span>Scope notes</label>
                        <Field name="scopeNote" component="textarea" rows="3" className="usa-textarea" id="scopeNote" aria-required="true" >
                        </Field>
                    </ErrorValidation>

                    <button className="usa-button submit-button" type="button" onClick={handleSubmit}>Save Scope Note</button>
                    <button className="usa-button usa-button--unstyled" type="button" onClick={props.onCancel}>
                        <span className="text-bold">Cancel</span>
                    </button>
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
