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
import { useField } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import SearchSelectComponent from '../controls/search-select/searchSelectComponent';
import ConceptResultView from '../concepts/ConceptResultView';
import { searchConcepts, clearConceptResults } from '../../actions/concepts'
import Flyout from '../controls/flyout';
import ConceptInfoPanel from '../infopanels/ConceptInfoPanel';
import CancelButton from '../controls/cancelButton';

export default function AddProperty({ isEditing, propertyType, isOneConceptOnly, setPreviousStep, handleSubmit }) {

    const [field, meta, helpers] = useField('properties');
    const [selectedResults, setSelectedResults] = useState(
        (isEditing && field.value && (Array.isArray(field.value) ? field.value : [field.value])) || []
    );
    const [showConceptInfopanel, setShowConceptInfopanel] = useState(false);
    const [infoPanelConcept, setInfoPanelConcept] = useState();

    const conceptResults = useSelector((state) => state.searchResults.concepts);
    const profileVersionId = useSelector((state) => state.application.selectedProfileVersionId)
    const dispatch = useDispatch();

    useEffect(() => {
        if (isEditing) {
            setSelectedResults([]);
            if (isOneConceptOnly)
                setSelectedResults([field.value]);
            else
                setSelectedResults(field.value);
        }
        return function cleanUp() {
            dispatch(clearConceptResults());
            setSelectedResults([]);
        }
    }, [dispatch]);

    function onCancel() {
        setSelectedResults([]);
        dispatch(clearConceptResults());
        setPreviousStep();
    }

    function select(concept) {
        if (!selectedResults) return;
        let newSelectedResults = null;

        if (isOneConceptOnly) {
            newSelectedResults = [concept];
        } else {
            newSelectedResults = [...selectedResults, concept];
        }

        setSelectedResults(newSelectedResults);
        setFieldValue(newSelectedResults);
    }

    function remove(concept) {
        if (!selectedResults) return;

        let newSelectedResults = [...selectedResults];
        let index = newSelectedResults.findIndex(result => result === concept);

        if (index > -1) {
            newSelectedResults.splice(index, 1);
        }

        setSelectedResults(newSelectedResults);
        setFieldValue(newSelectedResults);
    }

    function setFieldValue(value) {
        if (isOneConceptOnly) {
            value.length > 0 ? helpers.setValue(value[0]) : helpers.setValue('');
        } else {
            helpers.setValue(value);
        }
    }

    function onViewDetailsClick(property) {
        setInfoPanelConcept(property);
        setShowConceptInfopanel(true);
    }

    function onSearchConcepts(searchValues, filter) {
        if (filter === 'profile') {
            dispatch(searchConcepts(searchValues, null, null, null, JSON.stringify({ parentProfile: profileVersionId })))
        }
        else
            dispatch(searchConcepts(searchValues))
    }

    function propertyConceptFilter(c) {
        const verbRegex = /verb/i;
        const attachmentUsageTypeRegex = /attachmentUsageType/i;
        const activityTypeRegex = /activityType/i;
        if (c.parentProfile.state === 'draft' &&
            c.parentProfile.uuid !== profileVersionId) {
            return false;
        }

        switch (propertyType) {
            case 'verb':
                if (verbRegex.test(c.conceptType)) return true;
                break;
            case 'attachmentUsageType':
                if (attachmentUsageTypeRegex.test(c.conceptType)) return true;
                break;
            default:
                if (activityTypeRegex.test(c.conceptType)) return true;
        }

        return false;
    }

    return (<>
        <div className="grid-row">
            <h2 className="margin-top-1">{isEditing ? 'Edit' : 'Add'} Determining Property: <span className="text-primary" style={{ textTransform: 'capitalize' }}> {propertyType}</span></h2>
        </div>
        <SearchSelectComponent
            searchFunction={onSearchConcepts}
            clearSearchFunction={() => dispatch(clearConceptResults())}
            placeholderText="Search for concepts"
            searchResults={conceptResults && conceptResults.filter(c => propertyConceptFilter(c))}
            selectResultFunction={select}
            removeSelectedResultFunction={remove}
            clearSelectedResultsFunction={() => setSelectedResults([])}
            selectedResults={selectedResults}
            isOneSelectionOnly={isOneConceptOnly}
            oneSelectionOnlyMessage={"Only one concept may be selected for this determining property."}
            selectionMessage={`Selected Concept${isOneConceptOnly ? '' : 's'}`}
            resultView={<ConceptResultView onViewDetailsClick={onViewDetailsClick} currentProfileVersionId={profileVersionId} />}
            filterOptions={[{ value: 'all', option: 'All profiles' }, { value: 'profile', option: 'In this profile only' }]}
        />

        <div className="grid-row">
            <div className="grid-col display flex flew-row flex-align-center">
                <CancelButton className="usa-button usa-button--unstyled" type="button" cancelAction={onCancel} />
            </div>
            <div className="grid-col display-flex flex-column flex-align-end">
                <button
                    disabled={!(selectedResults && selectedResults.length)}
                    className="usa-button"
                    style={{ margin: '0' }}
                    type="submit"
                    onClick={handleSubmit}
                >
                    {isEditing ? 'Save Changes' : 'Add Selected to Statement Template'}
                </button>
            </div>
        </div>

        <Flyout show={showConceptInfopanel} onClose={() => setShowConceptInfopanel(false)}>
            {
                (showConceptInfopanel && infoPanelConcept) &&
                <ConceptInfoPanel infoPanelConcept={infoPanelConcept} />
            }
        </Flyout>
    </>
    );
}
