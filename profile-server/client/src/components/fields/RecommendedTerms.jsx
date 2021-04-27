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
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Formik, useField } from 'formik';
import * as Yup from 'yup';
import Truncate from 'react-truncate';

import ModalBox from '../controls/modalBox';
import { searchConcepts, clearConceptResults } from '../../actions/concepts';
import ModalBoxWithoutClose from '../controls/modalBoxWithoutClose';

export default function RecommendedTerms(props) {
    const [showModal, setShowModal] = useState(false);
    const [removing, setRemoving] = useState(-1)
    const [showRemoveRecommendedTermsModal, setShowRemoveRecommendedTermsModal] = useState(false);

    function onAdd(recommendedTerm) {
        let terms = props.field.value || [];
        props.form.setFieldValue(props.field.name, [...terms, recommendedTerm])

        setShowModal(false);
    }

    function onRemove(key) {
        if (!props.field.value) return;

        setRemoving(key);
        setShowRemoveRecommendedTermsModal(true);
    }

    function onRemovalConfirmed() {
        if (removing === -1) return;

        let terms = [...props.field.value];
        terms.splice(removing, 1);
        props.form.setFieldValue(props.field.name, terms);
        setRemoving(-1);
        setShowRemoveRecommendedTermsModal(false);
    }

    function onRemovalCanceled() {
        setRemoving(null);
        setShowRemoveRecommendedTermsModal(false);
    }

    return (<>
        {(props.field && props.field.value.length > 0) &&
            <div className="grid-row">
                <table style={{ margin: '0', lineHeight: '2.55' }} className="usa-table usa-table--borderless" width="100%">
                    <thead>
                        <tr>
                            <th width="90%" scope="col" style={{ padding: '4px' }}></th>
                            <th width="10%" scope="col" style={{ padding: '4px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.field.value.map((recommendedTerm, key) => (
                            <RecommendedTermRow
                                key={key}
                                recommendedTerm={recommendedTerm}
                                onRemove={() => onRemove(key)}
                            />
                        )
                        )}
                    </tbody>
                </table>
            </div>
        }
        {
            !props.isPublished &&
            <button className="usa-button usa-button--outline" type='button' onClick={() => setShowModal(true)} style={{ marginTop: '8px' }} disabled={props.disabled}>
                Add Recommended Term
        </button>
        }

        <ModalBoxWithoutClose show={showRemoveRecommendedTermsModal}>
            <RemoveRecommendedTermConfirmation onConfirm={onRemovalConfirmed} onCancel={onRemovalCanceled} />
        </ModalBoxWithoutClose>

        <ModalBox show={showModal} onClose={() => setShowModal(false)} isForm={true}>
            <RecommendedTermForm
                onAdd={onAdd}
                type={props.type}
            />
        </ModalBox>
    </>);
}

function RecommendedTermRow({ recommendedTerm, onRemove }) {

    return (<>
        <tr>
            <th scope="row" style={{ wordWrap: 'break-word' }}>
                <span>{recommendedTerm.name || recommendedTerm.iri}</span>
            </th>
            <td>
                <button style={{ marginTop: '0' }} className="usa-button  usa-button--unstyled" type="button" onClick={onRemove}>
                    <span className="text-bold">Remove</span>
                </button>
            </td>
        </tr>
    </>);
}

function RemoveRecommendedTermConfirmation(props) {

    return (<>
        <h2 className="margin-top-0">Remove Recommended Term</h2>
        <div><span>Are you sure you want to remove the recommended term from this concept?</span></div>
        <button className="usa-button submit-button" type="button" onClick={props.onConfirm}>Remove Recommended Term</button>
        <button className="usa-button usa-button--unstyled" type="button" onClick={props.onCancel}><b>Keep Recommended Term</b></button>
    </>);
}

function RecommendedTermForm({ onAdd, type }) {
    const dispatch = useDispatch();
    const conceptSearchResults = useSelector(state => state.searchResults.concepts);

    const concepttype = type === 'ActivityExtension' ? 'ActivityType' : 'Verb'

    useEffect(() => {
        return () => {
            dispatch(clearConceptResults());
        }
    }, []);

    const searchResults = conceptSearchResults && conceptSearchResults.filter(r => r.parentProfile).filter(r => r.conceptType === concepttype);

    return (<>
        <h2 style={{ marginTop: '0' }}>Tag Recommended Terms</h2>
        <div className="margin-y-1">Search for existing terms</div>
        <Formik
            initialValues={{ search: '', }}
            validationSchema={Yup.object({
                search: Yup.string()
                    .required('Required')
            })}
            onSubmit={(values) => {
                dispatch(searchConcepts(values.search));
            }}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit
            }) => (
                    <div className="usa-form similar-terms-form">
                        <div className="grid-row">
                            <div className="grid-col-10">
                                <div className="usa-search">
                                    <div role="search" className={`usa-form-group ${errors.search && touched.search ? "usa-form-group--error" : ""}`} style={{ marginTop: '0' }}>
                                        {
                                            errors.search && touched.search && (
                                                <span className="usa-error-message padding-right-1" role="alert">{errors.search}</span>
                                            )
                                        }
                                        <label className="usa-sr-only" htmlFor="search-field">Search</label>
                                        <input className={`usa-input ${errors.search && touched.search ? "usa-input--error" : ""}`} id="search-field" type="search" name="search"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.search}
                                        />
                                        <button className="usa-button" type="submit" onClick={handleSubmit} style={{ marginTop: 0 }}>
                                            <span className="usa-search__submit-text">Search</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="similar-terms-results-panel">
                            {
                                (searchResults && searchResults.length > 0) && <>
                                    <div className="grid-row">
                                        <span className="margin-y-2">{`${searchResults.length} results`}</span>
                                    </div>
                                    <div className="similar-terms-results overflow-auto">
                                        <table className="usa-table usa-table--borderless margin-0" width="100%">
                                            <thead>
                                                <tr>
                                                    <th width="55%" scope="col" style={{ padding: '0' }} />
                                                    <th width="25%" scope="col" style={{ padding: '0' }} />
                                                    <th width="20%" scope="col" style={{ padding: '0' }} />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    searchResults.map((result, key) => (
                                                        <RecommendedTermResult key={key} result={result} onAdd={() => onAdd(result)} />
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                )}
        </Formik>
    </>);
}

function RecommendedTermResult({ result, onAdd }) {

    return (<>
        <tr>
            <th scope="row">
                <span>{result.name}</span><br />
                <span className="text-thin text-base font-sans-3xs">
                    <Truncate lines={1}>
                        {result.description}
                    </Truncate>
                </span>
            </th>
            <td className="text-thin text-base font-sans-3xs">{result.parentProfile && result.parentProfile.name}</td>
            <td>
                <button className="usa-button" type="button" onClick={onAdd}>Add</button>
            </td>
        </tr>
    </>)
}
