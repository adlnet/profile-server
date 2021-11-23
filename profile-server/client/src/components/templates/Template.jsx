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
import React, { useEffect, useState } from 'react';
import { useRouteMatch, Switch, Route, useHistory, useParams, Redirect, useLocation, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import TemplateDetail from "./TemplateDetail";
import EditTemplateDetails from './EditTemplateDetails';
import ConceptTable from './ConceptTable';
import ConceptDetail from '../concepts/ConceptDetails';
import StatementExample from './StatementExample';
import { selectTemplate, editTemplate, deleteTemplate } from "../../actions/templates";
import RuleTable from '../rules/RuleTable';
import Rule from '../rules/Rule';
import DeterminingPropertyTable from '../determining-properties/DeterminingPropertyTable';
import CreateDeterminingProperty from '../determining-properties/CreateDeterminingProperty';
import EditDeterminingProperty from '../determining-properties/EditDeterminingProperty';
import RelatedStatementTemplatesTable from '../related-statement-templates/RelatedStatementTemplatesTable';
import AddRelatedStatementTemplate from '../related-statement-templates/AddRelatedStatementTemplate';
// import Flyout from '../controls/flyout';
// import ConceptInfoPanel from '../infopanels/ConceptInfoPanel';
import CreateRule from '../rules/CreateRule';
import CreateStatementExample from './CreateStatementExample';
// import { selectProfile } from '../../actions/profiles';
import Lock from "../../components/users/lock";
import ModalBoxWithoutClose from '../controls/modalBoxWithoutClose';

import { loadProfileTemplates, removeTemplateLink, claimTemplate } from "../../actions/templates";
import { reloadCurrentProfile } from '../../actions/profiles';
import Breadcrumb from '../controls/breadcrumbs';
import DeprecatedAlert from '../controls/deprecatedAlert';
import { ADDED, EDITED, REMOVED, DEPRECATED } from '../../actions/successAlert';
import ClaimButton from '../controls/ClaimButton';


export default function Template({ isMember, isCurrentVersion, isOrphan }) {

    const { url, path } = useRouteMatch();
    const templatesListURL = url.split('/').slice(0, -1).join('/');
    const location = useLocation();
    const { profileId, templateId } = useParams();
    const history = useHistory();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(selectTemplate(templateId));
    },
        [templateId]
    );

    const template = useSelector((state) => state.application.selectedTemplate);
    const selectedProfileVersion = useSelector(state => state.application.selectedProfileVersion);
    const selectedProfile = useSelector(state => state.application.selectedProfile);
    const determiningProperties = useSelector(state => state.application.selectedDeterminingProperties);

    const { selectedOrganizationId, selectedProfileId,
        selectedProfileVersionId } = useSelector((state) => state.application);
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [isEditingExample, setIsEditingExample] = useState(false);
    const [isCreatingExample, setIsCreatingExample] = useState(false);
    const [detpropOverwrite, setConfirmDetPropOverwrite] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { organizationId } = useParams();

    if (!template) return 'Template not populated';

    // does the current template have the same root profile as the selected profile version?
    const belongsToAnotherProfile = !(template.parentProfile && template.parentProfile.parentProfile.uuid === selectedProfileVersion.parentProfile.uuid);
    const isLinkedFromExternalProfile = !template.parentProfile || template.parentProfile.parentProfile.uuid !== selectedProfile.uuid

    const isEditable = isMember && isCurrentVersion && !template.isDeprecated;

    const isPublished = template.parentProfile.state !== 'draft';
    const fromTemplateRef = location.state && location.state.templateRef;

    function removeDeterminingProperty(propertyType) {
        if (isEditable) {
            let property = {};
            property[propertyType] = null;
            dispatch(editTemplate(Object.assign({}, template, property), REMOVED, "Determing property"));
            dispatch(selectTemplate(templateId));
        }
    }

    function onDeterminingPropertyAdd(values, actualAction) {
        if (isEditable) {
            let propertyValue = {};
            propertyValue[values.propertyType] = values.properties;
            dispatch(editTemplate(Object.assign({}, template, propertyValue), actualAction || ADDED, "Determining property"));
            history.push(url);
        }
    }

    function removeRule(rule) {
        if (isEditable) {
            let updatedTemplate = Object.assign({}, template);

            if (updatedTemplate.rules && updatedTemplate.rules.length) {
                updatedTemplate.rules = updatedTemplate.rules.filter(r => r._id !== rule._id)
            }
            dispatch(editTemplate(updatedTemplate, REMOVED, "Rule"));
            dispatch(selectTemplate(templateId));
        }
    }

    function onAddExampleClick() {
        if (isEditable) {
            setIsEditingExample(false);
            setIsCreatingExample(true);
        }
    }

    function onEditExampleClick() {
        if (isEditable) {
            setIsCreatingExample(false);
            setIsEditingExample(true);
        }
    }

    function onCancelExampleActionClick() {
        if (isEditable) {
            setIsCreatingExample(false);
            setIsEditingExample(false);
        }
    }

    function onExampleSubmit(values, actualAction) {
        if (isEditable) {
            dispatch(editTemplate(Object.assign({}, template, values), actualAction, "Example statement"));
            setIsCreatingExample(false);
            setIsEditingExample(false);
        }
    }

    function onEditDetailsSubmit(values, actualAction) {
        if (isEditable) {
            dispatch(editTemplate(Object.assign({}, template, values), actualAction || EDITED, "Template"));
            setIsEditingDetails(false);
        }
    }

    function onDeprecate(reasonInfo) {
        if (isEditable) {
            onEditDetailsSubmit({ isDeprecated: true, deprecatedReason: reasonInfo }, DEPRECATED);
        }
    }

    function onDeleteDetailsSubmit() {
        if (isEditable) {
            dispatch(deleteTemplate(template));
            setIsEditingDetails(false);
            history.push(`/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}`);
        }
    }

    function onDelete() {
        if (isEditable) {
            onDeleteDetailsSubmit();
        }
    }

    async function onClaimTemplate(profile) {
        const versionId = (profile.currentDraftVersion ? profile.currentDraftVersion.uuid : profile.currentPublishedVersion.uuid);
        await dispatch(claimTemplate(profile.organization, profile.id, versionId, templateId));
        history.push(`/deleted-items/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${versionId}`);
    }

    function checkDeterminingPropertyConflict(detpropType, noconflictFunction, cancelFunction) {
        if (determiningProperties.find(det => det.propertyType === detpropType)) {
            setConfirmDetPropOverwrite({ detpropType, cancelFunction });
        } else noconflictFunction();
    }

    async function onRemoveTemplateRef(templatereftype) {
        if (isEditable) {
            let propertyValue = {};

            if (templatereftype === 'object')
                propertyValue['objectStatementRefTemplate'] = []
            else
                propertyValue['contextStatementRefTemplate'] = []

            await dispatch(editTemplate(Object.assign({}, template, propertyValue), REMOVED, `${templatereftype === 'object' ? 'Object' : 'Context'} template reference`));
            await dispatch(reloadCurrentProfile());
            await dispatch(loadProfileTemplates(selectedProfileVersionId));
        }
    }

    const removeLink = async () => {
        await dispatch(removeTemplateLink(selectedOrganizationId, profileId, selectedProfileVersionId, templateId))

        await dispatch(reloadCurrentProfile());

        await dispatch(loadProfileTemplates(selectedProfileVersionId));

        setShowModal(false);
        history.push(`/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/templates`);
    }

    return (
        <div>
            <Switch>
                <Route exact path={`${path}/determining-properties/create`}>
                    {(isEditable) ?
                        <CreateDeterminingProperty
                            onDeterminingPropertyAdd={(values) => onDeterminingPropertyAdd(values)}
                            breadcrumbs={[{ to: templatesListURL, crumb: "statement templates" }, { to: url, crumb: template.name }]}
                            checkConflict={checkDeterminingPropertyConflict}
                        />
                        : <Redirect to={url} />
                    }
                </Route>
                <Route exact path={`${path}/determining-properties/:propertyType/edit`}>
                    {(isEditable) ?
                        <EditDeterminingProperty
                            onDeterminingPropertyAdd={(values) => onDeterminingPropertyAdd(values, EDITED)} />
                        : <Redirect to={url} />
                    }
                </Route>
                <Route exact path={`${path}/(concepts|determining-properties)/:conceptId`}>
                    <ConceptDetail
                        isMember={isMember}
                        isCurrentVersion={isCurrentVersion}
                        isPublished={isPublished}
                        breadcrumbs={[{ to: templatesListURL, crumb: "statement templates" }, { to: url, crumb: template.name }]}
                    />
                </Route>
                <Route exact path={`${path}/rule/create`}>
                    {(isEditable) ?
                        <Lock resourceUrl={`/org/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/template/${template.uuid}`}>
                            <CreateRule templateName={template.name} isEditable={isEditable} isPublished={isPublished} isEditing={false}></CreateRule>
                        </Lock>
                        : <Redirect to={url} />
                    }
                </Route>
                <Route exact path={`${path}/rule/edit`}>
                    {(isEditable && !belongsToAnotherProfile) ?
                        <Lock resourceUrl={`/org/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/template/${template.uuid}`}>
                            <CreateRule templateName={template.name} isEditable={isEditable} isPublished={isPublished} isEditing={true}></CreateRule>
                        </Lock>
                        : <Redirect to={url} />
                    }
                </Route>
                <Route exact path={`${path}/rule/view`}>
                    <Rule templateName={template.name} url={`${url}/rule`} belongsToAnotherProfile={belongsToAnotherProfile}></Rule>
                </Route>
                <Route exact path={`${path}/related-statement-templates/:templatereftype/create`}>
                    {(isEditable) ?
                        <Lock resourceUrl={`/org/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/template/${template.uuid}`}>
                            <AddRelatedStatementTemplate
                                breadcrumbs={[{ to: templatesListURL, crumb: "statement templates" }, { to: url, crumb: selectedProfileVersion.name }]}
                            />
                        </Lock>
                        : <Redirect to={url} />
                    }
                </Route>
                <Route exact path={`${path}/related-statement-templates/:templatereftype/edit`}>
                    {(isEditable) ?
                        <Lock resourceUrl={`/org/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/template/${template.uuid}`}>
                            <AddRelatedStatementTemplate
                                breadcrumbs={[{ to: templatesListURL, crumb: "statement templates" }, { to: url, crumb: selectedProfileVersion.name }]}
                                isEditing={true}
                            />
                        </Lock>
                        : <Redirect to={url} />
                    }
                </Route>
                <Route path={path}>
                    <div className="grid-row border-bottom-2px border-base-lighter">
                        <div className="grid-col margin-top-3">
                            <Breadcrumb breadcrumbs={[{ to: templatesListURL, crumb: 'statement templates' }]} />
                            <h2 style={{ margin: ".5em 0" }}>{template.name}</h2>
                        </div>
                    </div>
                    {
                        isLinkedFromExternalProfile &&
                        <div className="usa-alert usa-alert--info usa-alert--slim padding-2 margin-top-2" >
                            <div className="usa-alert__body">
                                <p className="usa-alert__text">
                                    <span style={{ fontWeight: "bold" }}>Linked Statement Template.</span> This statement template is defined by another profile, {template.parentProfile.name}. {!fromTemplateRef && <button style={{ fontWeight: "bold" }} onClick={() => setShowModal(true)} className="usa-button usa-button--unstyled">Remove Link</button>}
                                </p>
                            </div>
                        </div>
                    }
                    {
                        template.isDeprecated && <DeprecatedAlert component={template} componentType="statement template" />
                    }
                    {
                        isPublished && !belongsToAnotherProfile && isEditable &&
                        <div className="usa-alert usa-alert--info usa-alert--slim margin-top-2" >
                            <div className="usa-alert__body">
                                <p className="usa-alert__text">
                                    Editing is limited. This statement template has already been published in the profile and may be in use.
                                </p>
                            </div>
                        </div>
                    }


                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="true"
                                aria-controls="a1"
                            >
                                Statement Template Details
                            </button>
                        </h2>
                        <div id="a1" className="usa-accordion__content">
                            {isOrphan &&
                                <div className="grid-col display-flex flex-column flex-align-end">
                                    <ClaimButton
                                        className="usa-button claim-btn margin-top-2 margin-right-0"
                                        onConfirm={onClaimTemplate} />
                                </div>
                            }
                            {
                                isEditingDetails ?
                                    <Lock resourceUrl={`/org/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/template/${template.uuid}`}>
                                        <EditTemplateDetails
                                            initialValues={template}
                                            onSubmit={onEditDetailsSubmit}
                                            onCancel={() => setIsEditingDetails(false)}
                                            isPublished={isPublished}
                                            onDeprecate={onDeprecate}
                                            onDelete={onDelete}
                                        /> </Lock> :
                                    <TemplateDetail
                                        onEditClick={() => setIsEditingDetails(true)}
                                        isMember={isMember}
                                        isCurrentVersion={isCurrentVersion}
                                        isEditable={isEditable}
                                        belongsToAnotherProfile={belongsToAnotherProfile}
                                    />
                            }
                        </div>

                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="a5"
                            >
                                Example Statement
                            </button>
                        </h2>
                        <div id="a5" className="usa-accordion__content usa-prose" hidden>
                            {
                                (!isEditingExample && !isCreatingExample) ?
                                    <StatementExample
                                        statementExample={template.statementExample}
                                        onAddClick={onAddExampleClick}
                                        onEditClick={onEditExampleClick}
                                        isMember={isMember}
                                        isCurrentVersion={isCurrentVersion}
                                        belongsToAnotherProfile={belongsToAnotherProfile}
                                        isEditable={isEditable}
                                    /> :
                                    isEditable && isCreatingExample ?
                                        <CreateStatementExample
                                            onSubmit={onExampleSubmit}
                                            onCancelClick={onCancelExampleActionClick}
                                        /> :
                                        <CreateStatementExample
                                            initialValues={template.statementExample}
                                            onSubmit={onExampleSubmit}
                                            onCancelClick={onCancelExampleActionClick}
                                        />
                            }

                        </div>

                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="a3"
                            >
                                Determining Properties ({determiningProperties ? determiningProperties.length : 0})
                            </button>
                        </h2>
                        <div id="a3" className="usa-accordion__content usa-prose" hidden>
                            <DeterminingPropertyTable
                                removeDeterminingProperty={(propType) => removeDeterminingProperty(propType)}
                                url={`${url}/determining-properties`}
                                isMember={isMember}
                                isCurrentVersion={isCurrentVersion}
                                isPublished={isPublished}
                                isEditable={isEditable}
                            />
                        </div>

                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="a4"
                            >
                                Statement Rules ({template.rules.length})
                            </button>
                        </h2>
                        <div id="a4" className="usa-accordion__content usa-prose" hidden>
                            <RuleTable
                                rules={template.rules}
                                onAddRule={() => history.push(`${url}/rule/create`)}
                                url={`${url}/rule`}
                                removeRule={removeRule}
                                isMember={isMember}
                                isCurrentVersion={isCurrentVersion}
                                isPublished={isPublished}
                                belongsToAnotherProfile={belongsToAnotherProfile}
                                isEditable={isEditable}
                            />
                        </div>

                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="a2"
                            >
                                Associated Concepts ({template.concepts.length})
                            </button>
                        </h2>
                        <div id="a2" className="usa-accordion__content usa-prose" hidden>
                            <ConceptTable concepts={template.concepts} url={`${url}/concepts`} isMember={isMember} isCurrentVersion={isCurrentVersion} />
                        </div>

                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="aC1"
                            >
                                Related Statement Templates ({template.objectStatementRefTemplate.length + template.contextStatementRefTemplate.length})
                            </button>
                        </h2>
                        <div id="aC1" className="usa-accordion__content usa-prose" hidden>
                            <RelatedStatementTemplatesTable
                                objectStatementRefTemplates={template.objectStatementRefTemplate}
                                contextStatementRefTemplates={template.contextStatementRefTemplate}
                                url={`${url}/related-statement-templates`}
                                rootUrl={templatesListURL}
                                isMember={isMember}
                                isCurrentVersion={isCurrentVersion}
                                isPublished={isPublished}
                                belongsToAnotherProfile={belongsToAnotherProfile}
                                removeRelatedTemplate={onRemoveTemplateRef}
                                isEditable={isEditable}
                            />
                        </div>

                    </div>
                </Route>
            </Switch>
            <ModalBoxWithoutClose show={showModal}>
                <div className="grid-row">
                    <div className="grid-col">
                        <h3>Remove Link</h3>
                    </div>
                </div>
                <div className="grid-row">
                    <div className="grid-col">
                        <span>Are you sure you want to remove <strong>{template.name}</strong> from the <strong>{selectedProfileVersion.name}</strong>?</span>
                    </div>
                </div>
                <div className="grid-row">
                    <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                        <button className="usa-button submit-button" style={{ margin: "1.5em 0em" }} onClick={removeLink}>Remove Now</button>
                    </div>
                    <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                        <button className="usa-button usa-button--unstyled" onClick={() => setShowModal(false)} style={{ margin: "2.3em 1.5em" }}><b>Cancel</b></button>
                    </div>
                </div>
            </ModalBoxWithoutClose>
            <ModalBoxWithoutClose show={detpropOverwrite}>
                <div className="grid-row">
                    <div className="grid-col">
                        <h3>Determining property already exists</h3>
                    </div>
                </div>
                <div className="grid-row" style={{ width: "640px" }}>
                    <div className="grid-col">
                        <span>This statement template has already defined <strong>{detpropOverwrite.detpropType}</strong>. Would you like to edit the existing determining property?</span>
                    </div>
                </div>
                <div className="grid-row">
                    <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                        <button className="usa-button submit-button" style={{ margin: "1.5em 0em" }} onClick={() => { setConfirmDetPropOverwrite(false); history.push(`${url}/determining-properties/${detpropOverwrite.detpropType}/edit`) }}>Edit existing</button>
                    </div>
                    <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                        <button className="usa-button usa-button--unstyled" onClick={() => { detpropOverwrite.cancelFunction(); setConfirmDetPropOverwrite(false); }} style={{ margin: "2.3em 1.5em" }}><b>Cancel</b></button>
                    </div>
                </div>
            </ModalBoxWithoutClose>
        </div>
    );
}
