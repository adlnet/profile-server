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
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";

import { searchConcepts, selectConceptResult, deselectConceptResult, clearConceptResults, loadProfileConcepts } from "../../actions/concepts";
import Flyout from '../controls/flyout';
import ConceptInfoPanel from '../infopanels/ConceptInfoPanel';
import SearchSelectComponent from '../controls/search-select/searchSelectComponent';
import ConceptResultView from './ConceptResultView';
import { editProfileVersion } from '../../actions/profiles';
import Breadcrumb from '../controls/breadcrumbs';
import CancelButton from '../controls/cancelButton';
import { ADDED } from '../../actions/successAlert';


export default function AddConcepts({ rootUrl, addToName, isOneConceptOnly }) {
    const history = useHistory();
    const dispatch = useDispatch();

    const conceptResults = useSelector((state) => state.searchResults.concepts)
    const selectedResults = useSelector((state) => state.searchResults.selectedConcepts)
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);
    const profileConcepts = useSelector((state) => state.concepts);
    const [showConceptInfopanel, setShowConceptInfopanel] = useState(false);
    const [infoPanelConcept, setInfoPanelConcept] = useState();

    useEffect(() => {
        dispatch(loadProfileConcepts(profileVersion.uuid));
    }, [dispatch, profileVersion.uuid]);

    function onViewDetailsClick(property) {
        setInfoPanelConcept(property);
        setShowConceptInfopanel(true);
    }

    async function handleAddToProfileClick() {
        if (selectedResults) {
            const newProfileVersion = Object.assign({}, profileVersion);
            newProfileVersion.externalConcepts = [...newProfileVersion.externalConcepts, ...selectedResults];
            await dispatch(editProfileVersion(newProfileVersion, ADDED, 'Concept'));
            await dispatch(loadProfileConcepts(profileVersion.uuid));
            history.push(rootUrl);
        }
    }

    function conceptResultsFilter(result) {
        if (result.parentProfile && result.parentProfile.state === 'draft' && result.parentProfile.parentProfile.uuid !== profileVersion.parentProfile.uuid) return false;
        return !profileConcepts.map(t => t.uuid).includes(result.uuid);
    }

    return (<>
        <div className="grid-row margin-top-3 margin-bottom-3">
            <div className="grid-col">
                <Breadcrumb breadcrumbs={[{ to: rootUrl, crumb: 'concepts' }]} />
                <h2 className="margin-y-05">Add Concepts</h2>
            </div>
        </div>

        <SearchSelectComponent
            searchFunction={(searchValues) => dispatch(searchConcepts(searchValues))}
            clearSearchFunction={() => dispatch(clearConceptResults())}
            searchMessage="Search the server for an existing concept to link to this profile before creating a new one."
            searchResults={conceptResults && conceptResults.filter(c => conceptResultsFilter(c))}
            selectResultFunction={(concept) => dispatch(selectConceptResult(concept))}
            removeSelectedResultFunction={(concept) => dispatch(deselectConceptResult(concept))}
            clearSelectedResultsFunction={() => dispatch(clearConceptResults())}
            selectedResults={selectedResults}
            isOneSelectionOnly={isOneConceptOnly}
            oneSelectionOnlyMessage={`Only one concept may be selected for this ${addToName}.`}
            selectionMessage={`Selected Concept${isOneConceptOnly ? '' : 's'}`}
            resultView={<ConceptResultView onViewDetailsClick={onViewDetailsClick} />}
        />

        <div className="grid-row">
            <div className="grid-col">
                <CancelButton className="usa-button usa-button--unstyled" type="button" style={{ paddingTop: ".8em" }} cancelAction={() => history.push(rootUrl)} />
            </div>
            <div className="grid-col">
                <div className="pin-right">
                    <Link
                        to={`${rootUrl}/create`}><button
                            className="usa-button"
                        >
                            <i className="fa fa-plus"></i> Create New</button>
                    </Link>
                    <button onClick={handleAddToProfileClick} className="usa-button margin-right-0">Add Selected to Profile</button>
                </div>
            </div>
        </div>

        <Flyout
            show={showConceptInfopanel}
            onClose={() => setShowConceptInfopanel(false)}
        >
            {
                (showConceptInfopanel && infoPanelConcept) &&
                <ConceptInfoPanel infoPanelConcept={infoPanelConcept} />
            }
        </Flyout>
    </>);
}
