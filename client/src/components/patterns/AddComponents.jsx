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
// import Truncate from 'react-truncate';

import { searchTemplates, clearTemplateResults } from "../../actions/templates";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from 'formik';
import { searchPatterns, selectComponent, deselectComponent, clearSelectedComponents, clearPatternResults } from '../../actions/patterns';
import Flyout from '../controls/flyout';
import PatternInfoPanel from '../infopanels/PatternInfoPanel';
import StatementTemplateInfoPanel from '../infopanels/StatementTemplateInfoPanel';

export default function AddComponents(props) {
    const dispatch = useDispatch();

    const isOneComponentOnly = props.isOneComponentOnly;

    const templateResults = useSelector((state) => state.searchResults.templates);
    const patternResults = useSelector((state) => state.searchResults.patterns);
    const selectedResults = useSelector((state) => state.searchResults.selectedComponents);

    const [keywords, setKeywords] = useState();
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [infoPanelTemplate, setInfoPanelTemplate] = useState();
    const [infoPanelPattern, setInfoPanelPattern] = useState();

    useEffect(() => {
        if (props.values.component) {
            dispatch(clearSelectedComponents());
            if (isOneComponentOnly)
                dispatch(selectComponent(
                    props.values.component,
                    props.values.component.type ? 'pattern' : 'template'));
            else
                props.values.component.forEach((component) => 
                    dispatch(selectComponent(component, component.type ? 'pattern' : 'template'))
                );
        }
        return () => {
            dispatch(clearSelectedComponents());
            dispatch(clearTemplateResults());
            dispatch(clearPatternResults());
        };
    }, [props.values.component])


    let isSelected = (item) => {
        if (!selectedResults) return false;
        let res = selectedResults.filter(i => i.uuid === item.uuid);
        return (res && res.length);
    }

    let select = (item, itemType) => {
        if (isOneComponentOnly)
            dispatch(clearSelectedComponents());
        dispatch(selectComponent(item, itemType));
    }

    let remove = (item) => {
        if (isOneComponentOnly)
            dispatch(clearSelectedComponents());
        else
            dispatch(deselectComponent(item))
    }

    let onPatternViewDetailsClick = (pattern) => {
        setInfoPanelTemplate(null);
        setInfoPanelPattern(pattern);
        setShowInfoPanel(true);
    }

    let onTemplateViewDetailsClick = (template) => {
        setInfoPanelPattern(null);
        setInfoPanelTemplate(template);
        setShowInfoPanel(true);
    }

    return (<>
        <div className="grid-row">
            <div className="grid-col">
                <h2>{`Add Component${isOneComponentOnly ? '' : 's'}`}</h2>
            </div>
            <div className="grid-col">
                {
                    (props.touched && Object.keys(props.errors).length > 0) ? (<>
                        <span className="usa-error-message" id="input-error-message" role="alert">
                            The following field errors were found:
                        </span>
                        <span className="usa-error-message" id="input-error-message" role="alert">
                            {`    ${Object.keys(props.errors).join(', ')}`}
                        </span>
                    </>) : ""
                }
            </div>
        </div>
        <div className="grid-row bg-base-lightest">
            <div className="grid-col-fill padding-3">
                <span>Search for existing patterns or statement templates to add as components to this pattern</span>

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
                {
                    ((templateResults && templateResults.length > 0) || (patternResults && patternResults.length > 0)) &&
                        <div className="grid-row padding-y-1 border-bottom">
                            <div>{resultsText(templateResults, patternResults, keywords)}</div>
                        </div>
                }
                <div className="grid-row maxh-tablet">
                    <div className="grid-col overflow-y-auto" style={{ maxHeight: "inherit" }}>
                        {
                            (templateResults && templateResults.length)
                                ? templateResults.map((template) =>
                                    <Result
                                        key={`result${template.uuid}`}
                                        template={template}
                                        onViewDetailsClick={() => onTemplateViewDetailsClick(template)}
                                        secondaryDescription={`Statement Template  |  ${template && template.parentProfile && template.parentProfile.name}`}
                                    >
                                        {
                                            isSelected(template) ?
                                                <div className="usa-button usa-button--outline" type="button" style={{margin: '0'}}>Selected</div> :
                                                <button type="button" style={{ marginTop: 0 }} className={"usa-button"} onClick={() => select(template, 'template')}>Select</button>    
                                        }
                                    </Result>
                                ) : ""
                        }
                        {
                            (patternResults && patternResults.length)
                                ? patternResults.filter(p => !p.primary).map((pattern) =>
                                    <Result
                                        key={`result${pattern.uuid}`}
                                        template={pattern}
                                        onViewDetailsClick={() => onPatternViewDetailsClick(pattern)}
                                        secondaryDescription={`${pattern && pattern.type}  |  ${pattern && (pattern.primary ? 'primary' : 'secondary')}  |  ${pattern && pattern.parentProfile && pattern.parentProfile.name}`}
                                    >
                                        {
                                            isSelected(pattern) ?
                                                <div className="usa-button usa-button--outline" type="button" style={{margin: '0'}}>Selected</div> :
                                                <button type="button" style={{ marginTop: 0 }} className={"usa-button"} onClick={() => select(pattern, 'pattern')}>Select</button>
                                        }
                                    </Result>
                                ) : ""
                        }
                    </div>
                </div>
            </div>
            <div className="grid-col">
                {
                    (selectedResults && selectedResults.length > 0) &&
                        <div className="grid-row padding-y-1 border-bottom">
                            <div className="text-bold"><span>Selected ({selectedResults.length})</span></div>
                        </div>
                }
                <div className="grid-row maxh-tablet">
                    <div className="grid-col overflow-y-auto" style={{ maxHeight: "inherit" }}>
                        {
                            (selectedResults && selectedResults.length)
                                ? selectedResults.map((result) =>
                                    <Result
                                        key={`result${result.uuid}`}
                                        template={result}
                                        onViewDetailsClick={
                                            result.componentType === "pattern" ?
                                                () => onPatternViewDetailsClick(result) :
                                                () => onTemplateViewDetailsClick(result)
                                        }
                                        secondaryDescription={
                                            result.componentType === "pattern" ?
                                                `${result && result.type}  |  ${result && (result.primary ? 'primary' : 'secondary')}  |  ${result && result.parentProfile && result.parentProfile.name}` :
                                                `Statement Template  |  ${result && result.parentProfile && result.parentProfile.name}`
                                        }
                                    >
                                        {
                                            <button type="button" style={{ marginTop: 0 }} className={"usa-button"} onClick={() => remove(result)}>Remove</button>
                                        }
                                    </Result>
                                ) : ""
                        }
                        {((templateResults && templateResults.length) || (patternResults && patternResults.length)) && isOneComponentOnly ?
                            <div className="grid-row">
                                <span className="margin-y-2 font-sans-3xs text-base-light">
                                    <em>Only one component may be selected for this pattern.</em>
                                </span>
                            </div> : ""
                        }
                    </div>
                </div>
            </div>
        </div>
        <Flyout show={showInfoPanel} onClose={() => setShowInfoPanel(false)}>
            { 
                (showInfoPanel && infoPanelPattern)  &&
                    <PatternInfoPanel infoPanelPattern={infoPanelPattern} />
            }
            {
                (showInfoPanel && infoPanelTemplate) &&
                    <StatementTemplateInfoPanel infoPanelTemplate={infoPanelTemplate} />
            }
        </Flyout>
    </>
    );
}

function resultsText(templateResults, patternResults, keywords) {
    let count = ((templateResults && templateResults.length) || 0) + 
        ((patternResults && patternResults.filter(p => !p.primary).length) || 0);
    let resultText = `result${count !== 1 ? "s" : ""}`;
    return (keywords || keywords === "") ? `${count} ${resultText} for '${keywords}'` : "";
}

function Result(props) {

    return (
        <div className="grid-row border-bottom padding-top-2 padding-bottom-2 padding-right-1 padding-left-1">
            <div className="grid-col-9">
                <span className="">{props.template.name}</span><br />
                <span className="font-sans-3xs">
                    {props.template.description}
                </span>
                <br /><br />
                <span className="font-sans-3xs text-base-light">{props.secondaryDescription}</span>
            </div>
            <div className="grid-col-3">
                {props.children}
                <button
                    type="button"
                    className="usa-button usa-button--unstyled"
                    onClick={props.onViewDetailsClick}
                >View Details</button>
            </div>
        </div>
    );
}
