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
import { useSelector, useDispatch } from "react-redux";

import { searchTemplates, selectTemplateResult, deselectTemplateResult, clearTemplateResults, loadProfileTemplates, editTemplate } from "../../actions/templates";

import SearchSelectComponent from '../controls/search-select/searchSelectComponent';
import TemplateResultView from '../templates/TemplateResultView';
import Flyout from '../controls/flyout';
import ConceptInfoPanel from '../infopanels/ConceptInfoPanel';
import StatementTemplateInfoPanel from '../infopanels/StatementTemplateInfoPanel';
import CancelButton from '../controls/cancelButton';
import { ADDED, EDITED } from '../../actions/successAlert';

/**
 * Want to add a template reference to a statement template (context or object)
 * @param {boolean} isEditing  did someone click the edit button in the table?
 * @param {object} breadcrumbs {to: path, crumb: text to show}
 */
export default function AddRelatedStatementTemplate({ isEditing, breadcrumbs }) {
    const { templatereftype } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();

    const template = useSelector((state) => state.application.selectedTemplate);
    const templateResults = useSelector((state) => state.searchResults.templates)
    const selectedResults = useSelector((state) => state.searchResults.selectedTemplates)
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);
    const profileTemplates = useSelector((state) => state.templates);


    const [showTemplateInfopanel, setShowTemplateInfopanel] = useState(false);
    const [infoPanelTemplate, setInfoPanelTemplate] = useState();
    const [showConceptInfopanel, setShowConceptInfopanel] = useState(false);
    const [infoPanelConcept, setInfoPanelConcept] = useState();
    const [hasFlyoutOnPrevious, setHasFlyoutOnPrevious] = useState(false);

    async function setupTable() {
        await dispatch(clearTemplateResults())
        for (const tempref of template[(templatereftype === 'object') ? 'objectStatementRefTemplate' : 'contextStatementRefTemplate'])
            await dispatch(selectTemplateResult(tempref))
    }

    useEffect(() => {
        if (isEditing) {
            setupTable()
        }
    }, [isEditing, templatereftype, template])

    const renderBreadcrumbs = () => {
        if (breadcrumbs) {
            return breadcrumbs.map((b, i) => (
                <span key={i}><Link to={b.to}><span className="breadcrumb">{b.crumb}</span></Link> <i className="fa fa-angle-right"></i> </span>
            ))
        }
        return <></>;
    }


    async function handleAddToTemplateClick() {
        if (selectedResults && profileVersion.state === 'draft') {
            let propertyValue = {};

            if (templatereftype === 'object')
                propertyValue['objectStatementRefTemplate'] = selectedResults
            else
                propertyValue['contextStatementRefTemplate'] = selectedResults

            await dispatch(editTemplate(Object.assign({}, template, propertyValue), isEditing ? EDITED : ADDED, `${templatereftype === 'object' ? 'Object' : 'Context'} template reference`));
            await dispatch(loadProfileTemplates(profileVersion.uuid));

            returnToTemplate();
        }
    }


    function returnToTemplate() {
        if (breadcrumbs) {
            history.push(breadcrumbs[breadcrumbs.length - 1].to);
        } else
            history.goBack();
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
        return !profileTemplates.map(t => t.uuid).includes(result.uuid);
    }

    return (<>
        <div className="grid-row">
            <div className="grid-col">
                <div className="margin-top-4">
                    {renderBreadcrumbs()}
                </div>
            </div>
        </div>
        <h2 className="margin-top-1">{isEditing ? 'Edit' : 'Add'} Statement Template Reference: <span className="text-primary-dark">{templatereftype}</span></h2>


        <SearchSelectComponent
            searchFunction={(searchValues) => dispatch(searchTemplates(searchValues))}
            clearSearchFunction={() => dispatch(clearTemplateResults())}
            searchMessage=""
            searchResults={templateResults && templateResults.filter(t => templateResultsFilter(t))}
            selectResultFunction={(template) => dispatch(selectTemplateResult(template))}
            removeSelectedResultFunction={(template) => dispatch(deselectTemplateResult(template))}
            clearSelectedResultsFunction={() => dispatch(clearTemplateResults())}
            selectedResults={selectedResults}
            isOneSelectionOnly={false}
            oneSelectionOnlyMessage={"Only one template may be selected for this profile."}
            selectionMessage={`Selected Templates`}
            resultView={<TemplateResultView onViewDetailsClick={onViewDetailsClick} />}
            placeholderText={`Search for statement templates`}
        />


        <div className="grid-row">
            <div className="grid-col display flex flew-row flex-align-center">
                <CancelButton className="usa-button usa-button--unstyled" type="button" cancelAction={returnToTemplate} />
            </div>
            <div className="grid-col display-flex flex-column flex-align-end">
                <button
                    disabled={!(selectedResults && selectedResults.length)}
                    className="usa-button"
                    style={{ margin: '0' }}
                    type="submit"
                    onClick={handleAddToTemplateClick}
                >
                    {isEditing ? 'Save Changes' : 'Add Selected to Statement Template'}
                </button>
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
    </>);
}