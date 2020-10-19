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
import { Link, useHistory, useParams } from 'react-router-dom';

import { searchTemplates, selectTemplateResult, deselectTemplateResult, clearTemplateResults, loadProfileTemplates } from "../../actions/templates";
import { editProfileVersion, createNewProfileDraft } from "../../actions/profiles";
import { useSelector, useDispatch } from "react-redux";
import StatementTemplateInfoPanel from '../infopanels/StatementTemplateInfoPanel';
import Flyout from '../controls/flyout';
import ConceptInfoPanel from '../infopanels/ConceptInfoPanel';
import SearchSelectComponent from '../controls/search-select/searchSelectComponent';
import TemplateResultView from './TemplateResultView';
import Breadcrumb from '../controls/breadcrumbs';
import CancelButton from '../controls/cancelButton';
import { ADDED } from '../../actions/successAlert';

export default function AddTemplate({ isOneTemplateOnly, rootUrl }) {
    const { versionId } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();

    const templateResults = useSelector((state) => state.searchResults.templates)
    const selectedResults = useSelector((state) => state.searchResults.selectedTemplates)
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);
    const profileTemplates = useSelector((state) => state.templates);

    const [showTemplateInfopanel, setShowTemplateInfopanel] = useState(false);
    const [infoPanelTemplate, setInfoPanelTemplate] = useState();
    const [showConceptInfopanel, setShowConceptInfopanel] = useState(false);
    const [infoPanelConcept, setInfoPanelConcept] = useState();
    const [hasFlyoutOnPrevious, setHasFlyoutOnPrevious] = useState(false);

    useEffect(() => {
        dispatch(loadProfileTemplates(profileVersion.uuid));
    }, [profileVersion.uuid]);

    async function handleAddToProfileClick() {
        if (selectedResults) {
            const newProfileVersion = Object.assign({}, profileVersion);
            newProfileVersion.templates = [...newProfileVersion.templates, ...selectedResults];

            if (profileVersion.state === 'draft') {
                await dispatch(editProfileVersion(newProfileVersion, ADDED, 'Statement template'));
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
                await dispatch(createNewProfileDraft(newVersion));
            }

            await dispatch(loadProfileTemplates(profileVersion.uuid));
            history.push(rootUrl);
        }
    }

    function onViewDetailsClick(template) {
        setInfoPanelTemplate(template);
        setShowTemplateInfopanel(true);
    }

    function onFlyoutClose() {
        setShowTemplateInfopanel(false);
        setShowConceptInfopanel(false);
    }

    function onViewConceptClick(concept) {
        setInfoPanelConcept(concept);
        setHasFlyoutOnPrevious(true);
        setShowConceptInfopanel(true);
    }

    function onFlyoutPrevious() {
        setShowConceptInfopanel(false);
        setHasFlyoutOnPrevious(false);
    }

    function templateResultsFilter(result) {
        if (result.parentProfile && result.parentProfile.state === 'draft' && result.parentProfile.parentProfile.uuid !== profileVersion.parentProfile.uuid) return false;
        return !profileTemplates.map(t => t.uuid).includes(result.uuid);
    }

    return (
        <div>
            <div className="grid-row margin-top-3 margin-bottom-3">
                <div className="grid-col">
                    <Breadcrumb breadcrumbs={[{ to: rootUrl, crumb: 'statement templates' }]} />
                    <h2 className="margin-y-05">Add Statement Templates</h2>
                </div>
            </div>

            <SearchSelectComponent
                searchFunction={(searchValues) => dispatch(searchTemplates(searchValues))}
                clearSearchFunction={() => dispatch(clearTemplateResults())}
                searchMessage="Search for existing statement templates to link to this profile before creating a new one."
                searchResults={templateResults && templateResults.filter(t => templateResultsFilter(t))}
                selectResultFunction={(template) => dispatch(selectTemplateResult(template))}
                removeSelectedResultFunction={(template) => dispatch(deselectTemplateResult(template))}
                clearSelectedResultsFunction={() => dispatch(clearTemplateResults())}
                selectedResults={selectedResults}
                isOneSelectionOnly={isOneTemplateOnly}
                oneSelectionOnlyMessage={"Only one template may be selected for this profile."}
                selectionMessage={`Selected Template${isOneTemplateOnly ? '' : 's'}`}
                resultView={<TemplateResultView onViewDetailsClick={onViewDetailsClick} />}
                placeholderText={`Search for statement templates`}
            />

            <div className="grid-row">
                <div className="grid-col">
                    <CancelButton className="usa-button usa-button--unstyled padding-y-105" type="button" cancelAction={() => history.goBack()} />
                </div>
                <div className="grid-col">
                    <div className="pin-right">

                        <Link to={"create"}><button className="usa-button"><i className="fa fa-plus"></i> Create New</button></Link>

                        <button
                            onClick={handleAddToProfileClick}
                            className="usa-button margin-right-0"
                            disabled={!(selectedResults && selectedResults.length > 0)}
                        >
                            Add Selected to Profile
                    </button>
                    </div>
                </div>
            </div>
            <Flyout
                show={showTemplateInfopanel}
                onClose={onFlyoutClose}
                hasOnPrevious={hasFlyoutOnPrevious}
                onPrevious={onFlyoutPrevious}
            >
                {
                    (showConceptInfopanel && infoPanelConcept) &&
                    <ConceptInfoPanel concept={infoPanelConcept} />
                }
                {
                    (showTemplateInfopanel && infoPanelTemplate) &&
                    <StatementTemplateInfoPanel infoPanelTemplate={infoPanelTemplate} onViewConceptClick={onViewConceptClick} />
                }
            </Flyout>
        </div>
    );
}
