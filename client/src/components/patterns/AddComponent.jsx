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
// import Truncate from 'react-truncate';

import { useSelector, useDispatch } from "react-redux";
import { Formik, useField } from 'formik';

import { searchTemplates } from "../../actions/templates";
import { searchPatterns } from '../../actions/patterns';

export default function AddComponent(props) {

    const templateResults = useSelector((state) => state.searchResults.templates)
    const patternResults = useSelector((state) => state.searchResults.patterns)

    const dispatch = useDispatch();

    const [keywords, setKeywords] = useState();

    return (<>
        <h2>Add Component</h2>
        <div className="grid-row bg-base-lightest">
            <div className="grid-col-fill padding-3">
                <span>Search for existing patterns or statement templates to add as the component of this pattern</span>

                <Formik
                    initialValues={{ search: '', }}

                    onSubmit={(values) => {
                        setKeywords(values.search);
                        dispatch(searchTemplates(values.search));
                        dispatch(searchPatterns(values.search));
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
                <div className="grid-row margin-top-3">
                    <div className="grid-col margin-bottom-2">
                        {resultsText(templateResults, keywords)}
                    </div>
                </div>
                <div className="grid-row maxh-tablet">
                    {/* style="overflow-y: auto;max-height: inherit;" */}
                    <div className="grid-col overflow-y-auto" style={{ maxHeight: "inherit" }}>
                        {
                            <ResultList templateResults={templateResults}
                                patternResults={patternResults}
                                dispatch={dispatch}
                                {...props} />
                        }
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}

function ResultList(props) {
    const [field, meta, helpers] = useField("componentuuid");
    const { setValue } = helpers;

    return (<>
        {
            ((props.templateResults && props.templateResults.length)
                ? props.templateResults.map((template) =>
                    <Result key={`result${template.uuid}`}
                        component={template}
                        buttonText="Add to Pattern"
                        buttonAction={(template) => {
                            console.log(template)
                            setValue(template.uuid);
                            props.submitForm()
                        }} />)
                : "")
        }
        {
            ((props.patternResults && props.patternResults.length)
                ? props.templateResults.map((pattern) =>
                    <Result key={`result${pattern.uuid}`}
                        component={pattern}
                        buttonText="Add to Pattern"
                        buttonAction={(pattern) => {
                            console.log(pattern)
                            setValue(pattern.uuid);
                            props.submitForm()
                        }} />)
                : "")
        }
    </>);
}

function resultsText(templateResults, keywords) {
    let count = (templateResults && templateResults.length) || 0;
    let resultText = `result${count !== 1 ? "s" : ""}`;
    return (keywords || keywords === "") ? `${count} ${resultText} for '${keywords}'` : "";
}

function Result(props) {
    let handleClick = () => {
        console.log('handle click')
        props.buttonAction(props.component)
    };

    return (
        <div className="grid-row border-top padding-top-2 padding-bottom-2 padding-right-1 padding-left-1">
            <div className="grid-col-9">
                <span className="">{props.component.name}</span><br />
                <span className="font-sans-3xs">
                    {/* <Truncate lines={2}> */}
                    {props.component.description}
                    {/* </Truncate> */}
                </span>
                <br /><br />
                <pre>{JSON.stringify(props, null, 3)}</pre>
                <span className="font-sans-3xs text-base-light">{props.component.parentProfileName}</span>
            </div>
            <div className="grid-col-3 text-center">
                {/* move style and button decisions from here to addtemplate .. both selected style and button text */}
                <button type="button" className={`usa-button ${props.styles} `} onClick={handleClick} style={{ marginTop: 0, marginRight: 0 }}>{props.buttonText}</button>
                {/* <button className={`usa - button${ props.isSelected(props.template) ? " usa-button--outline" : "" } `} onClick={handleClick}>{props.buttonText}</button> */}
                <button type="button" className="usa-button usa-button--unstyled" style={{ marginTop: ".75rem" }}>View Details</button>
            </div>
        </div>
    );
}
