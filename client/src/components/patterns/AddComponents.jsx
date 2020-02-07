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
import React from 'react';
import Truncate from 'react-truncate';

import { searchTemplates, selectTemplateResult, deselectTemplateResult } from "../../actions/templates";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from 'formik';

export default function AddComponents() {

    const templateResults = useSelector((state) => state.searchResults.templates)

    const selectedResults = useSelector((state) => state.searchResults.selectedTemplates)
    // let { id } = useParams();


    const dispatch = useDispatch();

    let isSelected = (item) => {
        if (!selectedResults) return false;
        return selectedResults.includes(item);
    }

    return (<>
        <h2>Add Components</h2>
        <div className="grid-row bg-base-lightest">
            <div className="grid-col-fill padding-3">
                <span>Search for existing patterns or statement templates to add as components to this pattern</span>

                <Formik
                    initialValues={{ search: '', }}

                    onSubmit={(values) => {
                        dispatch(searchTemplates(values.search));
                    }}
                >
                    {({
                        values,
                        handleChange,
                        handleBlur,
                        handleSubmit
                    }) => (
                            <div className="usa-search" >
                                <div role="search" className="usa-search">
                                    <label className="usa-sr-only" htmlFor="search-field">Search</label>
                                    <input className="usa-input" id="search-field" type="search" name="search"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.search} />
                                    <button className="usa-button" style={{ marginTop: 0 }} type="submit" onClick={handleSubmit}>
                                        <span className="usa-search__submit-text">Search</span>
                                    </button>
                                </div>
                            </div>
                        )}
                </Formik>
            </div>
        </div>
        <div className="grid-row minh-mobile-lg">
            <div className="grid-col margin-right-2">
                <div className="grid-row">
                    <div className="grid-col margin-bottom-2">
                        {
                            (templateResults && templateResults.length) ? <span className="">{templateResults.length} results</span> : " "
                        }
                    </div>
                </div>
                <div className="grid-row maxh-tablet">
                    {/* style="overflow-y: auto;max-height: inherit;" */}
                    <div className="grid-col overflow-y-auto" style={{ maxHeight: "inherit" }}>
                        {
                            // todo: add "n results for 'keyword'"
                            (templateResults && templateResults.length)
                                ? templateResults.map((template) => <Result key={`result${template.uuid}`} template={template} buttonText={(isSelected(template)) ? "Selected" : "Select"} buttonAction={(template) => dispatch(selectTemplateResult(template))} styles={(isSelected(template) ? "usa-button--outline" : "")} />)
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
                    <div className="grid-col overflow-y-auto" style={{ maxHeight: "inherit" }}>
                        {
                            // todo: add "n results for 'keyword'"
                            (selectedResults && selectedResults.length)
                                ? selectedResults.map((template) => <Result key={`selected${template.id}`} template={template} buttonText="Remove" buttonAction={(template) => dispatch(deselectTemplateResult(template))} isSelected={() => false} styles="" />)
                                : ""
                        }
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}

function Result(props) {
    let handleClick = () => {
        props.buttonAction(props.template)
    };

    return (
        <div className="grid-row border-top padding-top-2 padding-bottom-2 padding-right-1 padding-left-1">
            <div className="grid-col-9">
                <span className="">{props.template.name}</span><br />
                <span className="font-sans-3xs">
                    <Truncate lines={2}>
                        {props.template.description}
                    </Truncate>
                </span>
                <br /><br />
                <span className="font-sans-3xs text-base-light">{props.template.parentProfileName}</span>
            </div>
            <div className="grid-col-3">
                {/* move style and button decisions from here to addtemplate .. both selected style and button text */}
                <button type="button" className={`usa-button ${props.styles}`} onClick={handleClick}>{props.buttonText}</button>
                {/* <button className={`usa-button${props.isSelected(props.template) ? " usa-button--outline" : ""}`} onClick={handleClick}>{props.buttonText}</button> */}
                <button type="button" className="usa-button usa-button--unstyled">View Details</button>
            </div>
        </div>
    );
}
