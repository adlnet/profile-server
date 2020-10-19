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
import { editProfileVersion, createNewProfileDraft } from "../../actions/profiles";
import Flyout from '../controls/flyout';
import PatternInfoPanel from '../infopanels/PatternInfoPanel';
import SearchSelectComponent from '../controls/search-select/searchSelectComponent';
import PatternResultView from './PatternResultView';
import Template from '../templates/Template';
import PatternDetail from './PatternDetail';
import Breadcrumb from '../controls/breadcrumbs';
import CancelButton from '../controls/cancelButton';
import { ADDED } from '../../actions/successAlert';

export default function AddPattern({ isOnePatternOnly, root_url }) {

    const { path } = useRouteMatch();

    const history = useHistory();
    const patternResults = useSelector((state) => state.searchResults.patterns)
    const selectedResults = useSelector((state) => state.searchResults.selectedPatterns)
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);
    const profilePatterns = useSelector((state) => state.patterns);


    const [showPatternInfopanel, setShowPatternInfopanel] = useState(false);
    const [infoPanelPattern, setInfoPanelPattern] = useState();
    const dispatch = useDispatch();

    async function handleAddToProfileClick() {
        if (selectedResults) {
            const newProfileVersion = Object.assign({}, profileVersion);
            newProfileVersion.patterns = [...newProfileVersion.patterns, ...selectedResults];

            if (profileVersion.state === 'draft') {
                await dispatch(editProfileVersion(newProfileVersion, ADDED, 'Pattern'));
            } else if (profileVersion.state === 'published') {
                // if editing the published profile, we need to clean up 
                // the values param since we create a new draft from the published version.
                let newVersion = {
                    tags: newProfileVersion.tags,
                    concepts: newProfileVersion.concepts,
                    externalConcepts: newProfileVersion.externalConcepts,
                    templates: newProfileVersion.templates,
                    patterns: newProfileVersion.patterns,
                    translations: newProfileVersion.translations,
                    name: newProfileVersion.name,
                    description: newProfileVersion.description,
                    moreInformation: newProfileVersion.moreInformation,
                    version: newProfileVersion.version,
                    iri: newProfileVersion.iri
                };
                // Need to verify iri is a new one, not the original published version (profileVersion)
                if (newVersion.iri === profileVersion.iri) delete newVersion.iri;
                await dispatch(createNewProfileDraft(newVersion, ADDED, 'Pattern'));
            }

            await dispatch(loadProfilePatterns(profileVersion.uuid));
            history.push(root_url);
        }
    }

    function onViewDetailsClick(property) {
        setInfoPanelPattern(property);
        setShowPatternInfopanel(true);
    }

    function patternResultsFilter(result) {
        if (result.parentProfile && result.parentProfile.state === 'draft' && result.parentProfile.parentProfile.uuid !== profileVersion.parentProfile.uuid) return false;
        return !profilePatterns.map(p => p.uuid).includes(result.uuid);
    }

    return (<>
        <div className="grid-row margin-top-3 margin-bottom-3">
            <div className="grid-col">
                <Breadcrumb breadcrumbs={[{ to: root_url, crumb: 'patterns' }]} />
                <h2 className="margin-y-05">Add Pattern</h2>
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
            resultView={<PatternResultView onViewDetailsClick={onViewDetailsClick} />}
        />

        <div className="grid-row">
            <div className="grid-col">
                <CancelButton className="usa-button usa-button--unstyled" style={{ marginTop: "0.6em" }} type="button" cancelAction={() => history.goBack()} />
            </div>
            <div className="grid-col">
                <div className="pin-right">
                    <Link to={"create"}><button className="usa-button"><i className="fa fa-plus"></i> Create New</button></Link>

                    <button
                        onClick={handleAddToProfileClick}
                        className="usa-button margin-right-0"
                        disabled={!(selectedResults && selectedResults.length > 0)}
                    >
                        Add to Profile
                    </button>
                </div>
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
