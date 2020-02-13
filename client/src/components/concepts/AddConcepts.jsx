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
import { Link } from 'react-router-dom';

import { useSelector, useDispatch } from "react-redux";
import { Formik } from 'formik';

import { searchConcepts, selectConceptResult, deselectConceptResult } from "../../actions/concepts";
import ConceptResults from "./ConceptResults";
export default function AddConcepts(props) {

    const conceptResults = useSelector((state) => state.searchResults.concepts)
    const selectedResults = useSelector((state) => state.searchResults.selectedConcepts)
    const dispatch = useDispatch();

    let isSelected = (item) => {
        if (!selectedResults) return false;
        return selectedResults.includes(item);
    }

    return (
        <div className="grid-container">
            <div className="grid-row margin-top-3 margin-bottom-3">
                <div className="grid-col">
                    <Link to={props.path}><span className="text-uppercase font-sans-3xs">Concepts</span></Link> <i className="fa fa-angle-right fa-xs"></i>
                    <h2>Add Concept</h2>
                </div>
                <div className="grid-col">

                    <Link to={props.createUrl}><button className="usa-button pin-right bottom-2"><i className="fa fa-plus"></i> Create New</button></Link>
                </div>
            </div>
            <div className="border border-base-light margin-bottom-1 minh-tablet">
                <div className="grid-row bg-base-lightest">
                    <div className="grid-col-fill padding-3">
                        <span>Search for existing concepts</span>

                        <Formik
                            initialValues={{ search: '', }}

                            onSubmit={(values) => {
                                dispatch(searchConcepts(values.search));
                            }}
                        >
                            {({
                                values,
                                handleChange,
                                handleBlur,
                                handleSubmit
                            }) => (
                                    <form className="usa-search" onSubmit={handleSubmit}>
                                        <div role="search">
                                            <label className="usa-sr-only" htmlFor="search-field">Search</label>
                                            <input className="usa-input" id="search-field" type="search" name="search"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.search} />
                                            <button className="usa-button" type="submit">
                                                <span className="usa-search__submit-text">Search</span>
                                            </button>
                                        </div>
                                    </form>

                                )}
                        </Formik>


                    </div>
                </div>
                <div className="grid-row padding-3">
                    <div className="grid-col margin-right-2">
                        <div className="grid-row">
                            <div className="grid-col margin-bottom-2">
                                {
                                    (conceptResults && conceptResults.length) ? <span className="">{conceptResults.length} results</span> : " "
                                }
                            </div>
                        </div>
                        <div className="grid-row maxh-tablet">
                            {/* style="overflow-y: auto;max-height: inherit;" */}
                            <div className="grid-col overflow-y-auto overflow-x-hidden" style={{ maxHeight: "inherit" }}>
                                {
                                    // todo: add "n results for 'keyword'"
                                    (conceptResults && conceptResults.length)
                                        ? conceptResults.map((concept) => <ConceptResults key={`result${concept.uuid}`} concept={concept} buttonText={(isSelected(concept)) ? "Selected" : "Select"} buttonAction={(concept) => dispatch(selectConceptResult(concept))} styles={(isSelected(concept) ? "usa-button--outline" : "")} />)
                                        : ""
                                }
                            </div>
                        </div>
                    </div>
                    <div className="grid-col">
                        <div className="grid-row">
                            <div className="grid-col margin-bottom-2">
                                {
                                    (selectedResults && selectedResults.length) ? <span className="text-bold">Selected ({selectedResults.length})</span> : " "
                                }
                            </div>
                        </div>
                        <div className="grid-row maxh-tablet">
                            <div className="grid-col overflow-y-auto overflow-x-hidden" style={{ maxHeight: "inherit" }}>
                                {
                                    // todo: add "n results for 'keyword'"
                                    (selectedResults && selectedResults.length)
                                        ? selectedResults.map((concept) => <ConceptResults key={`selected${concept.id}`} concept={concept} buttonText="Remove" buttonAction={(concept) => dispatch(deselectConceptResult(concept))} isSelected={() => false} styles="" />)
                                        : ""
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid-row">
                <div className="grid-col">
                    <button className="usa-button usa-button--unstyled">Cancel</button>
                </div>
                <div className="grid-col">
                    <button onClick={() => props.onAdd()} className="usa-button pin-right">Add to {props.addToName}</button>
                </div>
            </div>
        </div>
    );
}
