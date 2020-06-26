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
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'

import SearchSelectComponent from './searchSelectComponent';
import ConceptResultView from '../../concepts/ConceptResultView';
import { searchConcepts, clearConceptResults } from '../../../actions/concepts';
import Flyout from '../flyout';
import ConceptInfoPanel from '../../infopanels/ConceptInfoPanel';

export default function TestAddThingy ({ isOneConceptOnly=false }) {
    
    const [selectedResults, setSelectedResults] = useState([]);
    const [showConceptInfopanel, setShowConceptInfopanel] = useState(false);
    const [infoPanelConcept, setInfoPanelConcept] = useState();

    const conceptResults = useSelector((state) => state.searchResults.concepts);
    const dispatch = useDispatch();
    const history = useHistory();

    function onCancel() {
        setSelectedResults([]);
        dispatch(clearConceptResults());
        history.goBack();
    }

    function selectConcept(concept) {
        if (!selectedResults) return;
        let newSelectedResults = null;

        if (isOneConceptOnly) {
            newSelectedResults = [concept];
        } else {
            newSelectedResults = [...selectedResults, concept];
        }
        
        setSelectedResults(newSelectedResults);
    }

    function removeConcept(concept) {
        if (!selectedResults) return;

        let newSelectedResults = [...selectedResults];
        let index = newSelectedResults.findIndex(result => result === concept);

        if (index > -1) {
            newSelectedResults.splice(index, 1);
        }

        setSelectedResults(newSelectedResults);
    }

    function onViewDetailsClick(details) {
        setInfoPanelConcept(details);
        setShowConceptInfopanel(true);
    }

    return (<>
        <SearchSelectComponent
            searchFunction={(searchValues) => dispatch(searchConcepts(searchValues))}
            clearSearchFunction={() => dispatch(clearConceptResults())}
            searchResults={conceptResults}
            selectResultFunction={selectConcept}
            removeSelectedResultFunction={removeConcept}
            clearSelectedResultsFunction={() => setSelectedResults([])}
            selectedResults={selectedResults}
            isOneSelectionOnly={isOneConceptOnly}
            oneSelectionOnlyMessage={"It is only one selection, bud."}
            selectionMessage={`Selected Concept${isOneConceptOnly ? '' : 's'}`}
            resultView={<ConceptResultView />}
        />
        <div className="grid-col">
            <button className="usa-button usa-button--unstyled" type="button" onClick={onCancel}>
                <b>Cancel</b>
            </button>
        </div>
        
        <Flyout show={showConceptInfopanel} onClose={() => setShowConceptInfopanel(false)}>
            <ConceptInfoPanel concept={infoPanelConcept} onViewDetailsClick={onViewDetailsClick}/>
        </Flyout>
    </>);
}
