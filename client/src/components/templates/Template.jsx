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
import { useRouteMatch, Switch, Route, useHistory, useParams, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import TemplateDetail from "./TemplateDetail";
import EditTemplateDetails from './EditTemplateDetails';
import ConceptTable from './ConceptTable';
import ConceptDetail from '../concepts/ConceptDetails';
import StatementExample from './StatementExample';
import { selectTemplate, editTemplate } from "../../actions/templates";
import RuleTable from '../rules/RuleTable';
import DeterminingPropertyTable from '../determining-properties/DeterminingPropertyTable';
import CreateDeterminingProperty from '../determining-properties/CreateDeterminingProperty';
import EditDeterminingProperty from '../determining-properties/EditDeterminingProperty';
// import Flyout from '../controls/flyout';
// import ConceptInfoPanel from '../infopanels/ConceptInfoPanel';
import AddRulesForm from '../rules/AddRuleForm';
import ModalBox from '../controls/modalBox';
import CreateStatementExample from './CreateStatementExample';
// import { selectProfile } from '../../actions/profiles';
import Lock from "../../components/users/lock";
export default function Template({ isMember }) {

    const { url, path } = useRouteMatch();
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

    const { selectedOrganizationId, selectedProfileId,
        selectedProfileVersionId } = useSelector((state) => state.application);
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [isEditingExample, setIsEditingExample] = useState(false);
    const [isCreatingExample, setIsCreatingExample] = useState(false);
    const [showRulesModal, setShowRulesModal] = useState(false);

    if (!template) return 'Template not populated';

    function removeDeterminingProperty(propertyType) {
        if (isMember) {
            let property = {};
            property[propertyType] = null;
            dispatch(editTemplate(Object.assign({}, template, property)));
            dispatch(selectTemplate(templateId));
        }
    }

    function onDeterminingPropertyAdd(values) {
        if (isMember) {
            let propertyValue = {};
            propertyValue[values.propertyType] = values.properties;
            dispatch(editTemplate(Object.assign({}, template, propertyValue)));
            history.push(url);
        }
    }

    function onAddExampleClick() {
        if (isMember) {
            setIsEditingExample(false);
            setIsCreatingExample(true);
        }
    }

    function onEditExampleClick() {
        if (isMember) {
            setIsCreatingExample(false);
            setIsEditingExample(true);
        }
    }

    function onCancelExampleActionClick() {
        if (isMember) {
            setIsCreatingExample(false);
            setIsEditingExample(false);
        }
    }

    function onExampleSubmit(values) {
        if (isMember) {
            dispatch(editTemplate(Object.assign({}, template, values)));
            setIsCreatingExample(false);
            setIsEditingExample(false);
        }
    }

    function onEditDetailsSubmit(values) {
        if (isMember) {
            dispatch(editTemplate(Object.assign({}, template, values)));
            setIsEditingDetails(false);
        }
    }

    return (
        <div>
            <Switch>
                <Route exact path={`${path}/determining-properties/create`}>
                    {isMember ?
                        <CreateDeterminingProperty onDeterminingPropertyAdd={(values) => onDeterminingPropertyAdd(values)} />
                        : <Redirect to={url} />
                    }
                </Route>
                <Route exact path={`${path}/determining-properties/:propertyType/edit`}>
                    {isMember ?
                        <EditDeterminingProperty
                            onDeterminingPropertyAdd={(values) => onDeterminingPropertyAdd(values)} />
                        : <Redirect to={url} />
                    }
                </Route>
                <Route exact path={`${path}/(concepts|determining-properties)/:conceptId`}>
                    <ConceptDetail isMember={isMember} />
                </Route>
                <Route path={path}>
                    {
                        (!selectedProfileVersion.templates.includes(template.id)) &&
                        <div className="usa-alert usa-alert--info padding-2 margin-top-2" >
                            <div className="usa-alert__body">
                                <p className="usa-alert__text">
                                    This statement template belongs to {template.parentProfile.name}.
                                    </p>
                            </div>
                        </div>
                    }
                    <div><h2>{template.name}</h2></div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="a1"
                            >
                                Statement Template Details
                            </button>
                        </h2>
                        <div id="a1" className="usa-accordion__content">
                            {
                                isEditingDetails ?
                                    <Lock resourceUrl={`/org/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/template/${template.uuid}`}>
                                        <EditTemplateDetails
                                            initialValues={template}
                                            onSubmit={onEditDetailsSubmit}
                                            onCancel={() => setIsEditingDetails(false)}
                                        /> </Lock> :
                                    <TemplateDetail onEditClick={() => setIsEditingDetails(true)} isMember={isMember} />
                            }
                        </div>
                    </div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="a3"
                            >
                                Determining Properties
                    </button>
                        </h2>
                        <div id="a3" className="usa-accordion__content usa-prose">
                            <DeterminingPropertyTable
                                removeDeterminingProperty={(propType) => removeDeterminingProperty(propType)}
                                url={`${url}/determining-properties`}
                                isMember={isMember}
                            />
                        </div>
                    </div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="a4"
                            >
                                Rules (0)
                    </button>
                        </h2>
                        <div id="a4" className="usa-accordion__content usa-prose">
                            <RuleTable rules={template.rules} onAddRule={() => setShowRulesModal(true)} isMember={isMember} />
                        </div>
                    </div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="a2"
                            >
                                Concepts ({template.concepts.length})
                    </button>
                        </h2>
                        <div id="a2" className="usa-accordion__content usa-prose">
                            <ConceptTable concepts={template.concepts} url={`${url}/concepts`} isMember={isMember} />
                        </div>
                    </div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="false"
                                aria-controls="a5"
                            >
                                Statement Example
                            </button>
                        </h2>
                        <div id="a5" className="usa-accordion__content usa-prose">
                            {
                                (!isEditingExample && !isCreatingExample) ?
                                    <StatementExample
                                        statementExample={template.statementExample}
                                        onAddClick={onAddExampleClick}
                                        onEditClick={onEditExampleClick}
                                        isMember={isMember}
                                    /> :
                                    isMember && isCreatingExample ?
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
                    </div>

                    <ModalBox
                        show={showRulesModal}
                        onClose={() => setShowRulesModal(false)}
                    >
                        <AddRulesForm />
                    </ModalBox>
                </Route>
            </Switch>
        </div>
    );
}
