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
import { Route, Link, useRouteMatch, useHistory, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";

import { searchPatterns, selectPatternResult, deselectPatternResult, clearPatternResults, loadProfilePatterns } from "../../actions/patterns";
import {  editProfileVersion, createNewProfileDraft } from "../../actions/profiles";
import Flyout from '../controls/flyout';
import PatternInfoPanel from '../infopanels/PatternInfoPanel';
import SearchSelectComponent from '../controls/search-select/searchSelectComponent';
import PatternResultView from './PatternResultView';
import Template from '../templates/Template';
import PatternDetail from './PatternDetail';

export default function AddPattern({ isOnePatternOnly, root_url }) {
    
    const { path } = useRouteMatch();
    const { versionId } = useParams();
    const history = useHistory();
    const patternResults = useSelector((state) => state.searchResults.patterns)
    const selectedResults = useSelector((state) => state.searchResults.selectedPatterns)
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);
    const profilePatterns = useSelector((state) => state.patterns);


    const [showPatternInfopanel, setShowPatternInfopanel] = useState(false);
    const [infoPanelPattern, setInfoPanelPattern] = useState();
    const dispatch = useDispatch();

    function handleAddToProfileClick() {
        if (selectedResults) {
            const newProfileVersion = Object.assign({}, profileVersion);
            newProfileVersion.patterns = [...newProfileVersion.patterns, ...selectedResults];

            if (profileVersion.state === 'draft') {
                dispatch(editProfileVersion(newProfileVersion));
            } else if (profileVersion.state === 'published') {
                dispatch(createNewProfileDraft(newProfileVersion));
            }

            dispatch(loadProfilePatterns(versionId));
            history.push(root_url);
        }
    }

    function handleCancel() {
        history.goBack();
    }

    function onViewDetailsClick(property) {
        setInfoPanelPattern(property);
        setShowPatternInfopanel(true);
    }

    function patternResultsFilter(result) {
        return !profilePatterns.map(p => p.uuid).includes(result.uuid);
    }

    return (<>
            <div className="grid-row margin-top-3 margin-bottom-3">
                <div className="grid-col">
                    <h2>Add Statement Pattern</h2>
                </div>
                <div className="grid-col">
                    <Link to={"create"}><button className="usa-button pin-right bottom-2"><i className="fa fa-plus"></i> Create New</button></Link>
                </div>
            </div>

            <SearchSelectComponent
                searchFunction={(searchValues) => dispatch(searchPatterns(searchValues))}
                clearSearchFunction={() => dispatch(clearPatternResults())}
                searchMessage="Search for existing patterns to add to this profile"
                searchResults={patternResults && patternResults.filter(p => patternResultsFilter(p))}
                selectResultFunction={(pattern) => dispatch(selectPatternResult(pattern))}
                removeSelectedResultFunction={(pattern) => dispatch(deselectPatternResult(pattern))}
                clearSelectedResultsFunction={() => dispatch(clearPatternResults())}
                selectedResults={selectedResults}
                isOneSelectionOnly={isOnePatternOnly}
                oneSelectionOnlyMessage={"Only one pattern may be selected for profile."}
                selectionMessage={'Selected Patterns'}
                resultView={<PatternResultView onViewDetailsClick={onViewDetailsClick}/>}
            />

            <div className="grid-row">
                <div className="grid-col">
                    <button className="usa-button usa-button--unstyled padding-y-105" onClick={handleCancel}><b>Cancel</b></button>
                </div>
                <div className="grid-col">
                    <button 
                            onClick={handleAddToProfileClick}
                            className="usa-button margin-right-0 pin-right"
                            disabled={!(selectedResults && selectedResults.length > 0)}
                    >
                        Add to Profile
                    </button>
                </div>
            </div>

            <Flyout show={showPatternInfopanel} onClose={() => setShowPatternInfopanel(false)}>
                {
                    infoPanelPattern ?
                        <PatternInfoPanel infoPanelPattern={infoPanelPattern} /> : ''
                }
            </Flyout>

            <Route exact path={`${path}/templates/:templateId`}>
                <Template />
            </Route>
            <Route exact path={`${path}/patterns/:patternId`}>
                <PatternDetail />
            </Route>
    </>);
}
