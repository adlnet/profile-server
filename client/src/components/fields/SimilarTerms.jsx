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

export default function SimilarTerms(props) {
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    const [removing, setRemoving] = useState(-1)
    const [showRemoveSimilarTermsModal, setShowRemoveSimilarTermsModal] = useState(false);

    function onAdd(similarTerm) {
        const term = {
            concept: similarTerm,
            relationType: '',
        }

        let terms = props.field.value || [];
        props.form.setFieldValue(props.field.name, [...terms, term])

        setShowModal(false);
    }

    function onRemove(key) {
        if (!props.field.value) return;

        setRemoving(key);
        setShowRemoveSimilarTermsModal(true);
    }

    function onRemovalConfirmed() {
        if (removing === -1) return;

        let terms = [...props.field.value];
        terms.splice(removing, 1);
        props.form.setFieldValue(props.field.name, terms);
        setRemoving(-1);
        setShowRemoveSimilarTermsModal(false);
    }

    function onRemovalCanceled() {
        setRemoving(null);
        setShowRemoveSimilarTermsModal(false);
    }

    function onRelationTypeChange(key) {
        return (relationType) => {
            if (!props.field.value) return;

            let terms = [...props.field.value];
            let term = Object.assign({}, terms[key]);
            term.relationType = relationType;
            terms[key] = term;
            props.form.setFieldValue(props.field.name, terms);
        }
    }

    return (<>
        {(props.field && props.field.value && props.field.value.length > 0) &&
            <div className="grid-row">
                <table style={{ margin: '0', tableLayout: 'fixed' }} className="usa-table usa-table--borderless" width="100%">
                    <thead>
                        <tr>
                            <th width="45%" scope="col" style={{ padding: '4px' }}></th>
                            <th width="45%" scope="col" style={{ padding: '4px' }}></th>
                            <th width="10%" scope="col" style={{ padding: '4px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.field.value.map((similarTerm, key) => (
                            <SimilarTermRow
                                key={key}
                                similarTerm={similarTerm}
                                onRelationTypeChange={onRelationTypeChange(key)}
                                onRemove={() => onRemove(key)}
                                isPublished={props.isPublished}
                            />
                        )
                        )}
                    </tbody>
                </table>
            </div>
        }
        {
            !props.isPublished &&
            <button className="usa-button usa-button--outline" type='button' onClick={() => setShowModal(true)} style={{ marginTop: '8px' }}>
                Add Similar Term
        </button>
        }

        <ModalBoxWithoutClose show={showRemoveSimilarTermsModal}>
            <RemoveSimilarTermConfirmation onConfirm={onRemovalConfirmed} onCancel={onRemovalCanceled} />
        </ModalBoxWithoutClose>

        <ModalBox show={showModal} onClose={() => { setShowModal(false); dispatch(clearConceptResults()) }} isForm={true}>
            <SimilarTermForm
                onAdd={onAdd}
                conceptType={props.conceptType}
                profileVersion={props.profileVersion}
                conceptIRI={props.form && props.form.values && props.form.values.iri}
                conceptSimilarTerms={props.form && props.form.values && props.form.values.similarTerms}
            />
        </ModalBox>
    </>);
}

function SimilarTermRow({ similarTerm, onRemove, onRelationTypeChange, isPublished }) {
    const [field, meta, helpers] = useField('similarTerms');

    return (<>
        <tr>
            <th scope="row" style={{ wordWrap: 'break-word' }}>
                <span>{similarTerm.concept.name || similarTerm.concept.iri}</span>
            </th>
            <td>
                {
                    !isPublished ?
                        <select
                            name="relationType"
                            value={similarTerm.relationType} rows="3"
                            onChange={e => onRelationTypeChange(e.target.value)}
                            className={`usa-select ${meta.error && meta.touched && !similarTerm.relationType ? "usa-input--error" : ""}`}
                            id="type" aria-required="true" style={{ marginTop: '0' }}
                            onBlur={field.onBlur}
                        >
                            <option value="" disabled defaultValue></option>
                            <option value="related">Related</option>
                            {/* <option value="relatedMatch">Related Match</option> */}
                            <option value="broader">Broader</option>
                            {/* <option value="broadMatch">Broad Match</option> */}
                            <option value="narrower">Narrower</option>
                            {/* <option value="narrowMatch">Narrow Match</option> */}
                            {/* <option value="exactMatch">Exact Match</option> */}
                        </select>
                        : similarTerm.relationType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                }
            </td>
            <td>
                {
                    !isPublished &&
                    <button style={{ marginTop: '0' }} className="usa-button  usa-button--unstyled" type="button" onClick={onRemove}>
                        <span className="text-bold">Remove</span>
                    </button>
                }
            </td>
        </tr>
    </>);
}

function RemoveSimilarTermConfirmation(props) {

    return (<>
        <h2 className="margin-top-0">Remove Similar Term</h2>
        <div><span>Are you sure you want to remove the similar term from this concept?</span></div>
        <button className="usa-button submit-button" type="button" onClick={props.onConfirm}>Remove Similar Term</button>
        <button className="usa-button usa-button--unstyled" type="button" onClick={props.onCancel}><b>Keep Similar Term</b></button>
    </>);
}

function SimilarTermForm({ onAdd, conceptType, profileVersion, conceptIRI, conceptSimilarTerms }) {
    const dispatch = useDispatch();
    const conceptSearchResults = useSelector(state => state.searchResults.concepts);

    useEffect(() => {
        return () => {
            dispatch(clearConceptResults());
        }
    }, []);

    const searchResults = conceptSearchResults
        && conceptSearchResults.filter(r => r.parentProfile)
            .filter(v => v.parentProfile.state !== 'draft' || (v.parentProfile.parentProfile && v.parentProfile.parentProfile.uuid === profileVersion.parentProfile.uuid))
            .filter(v => !v.isDeprecated)
            .filter(v => v.conceptType.toLowerCase() === conceptType.toLowerCase())
            .filter(v => v.iri !== conceptIRI)
            .filter(v => !(conceptSimilarTerms && conceptSimilarTerms.find(t => t.concept.uuid === v.uuid)));

    return (<>
        <h2 style={{ marginTop: '0' }}>Tag Similar Terms</h2>
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
                                (searchResults && searchResults.length > 0) ? <>
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
                                                        <SimilarTermResult key={key} result={result} onAdd={() => onAdd(result)} />
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                                    : searchResults &&
                                    <div className="grid-row">
                                        <span className="margin-y-2">No results found</span>
                                    </div>
                            }
                        </div>
                    </div>
                )}
        </Formik>
    </>);
}

function SimilarTermResult({ result, onAdd }) {

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
