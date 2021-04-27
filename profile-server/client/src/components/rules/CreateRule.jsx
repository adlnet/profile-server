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
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import xapiPropData from './data/xapi-property-info.json';
import RuleForm from './RuleForm';

export default function CreateRule({ templateName, isEditable, isPublished, isEditing }) {
    const match = useRouteMatch();
    const location = useLocation();

    const orgId = useSelector(state => state.application.selectedOrganizationId);
    const profileId = useSelector(state => state.application.selectedProfileId);
    const versionId = useSelector(state => state.application.selectedProfileVersionId);
    const rule = location.state && location.state.rule;
    const [jsonPath, setJSONPath] = useState(rule && rule.location.split('.') || ['$']);
    const [showForm, setShowForm] = useState(!!rule);

    const pathToTemplates = `/organization/${orgId}/profile/${profileId}/version/${versionId}/templates`;
    const pathToCurrentTemplate = `/organization/${orgId}/profile/${profileId}/version/${versionId}/templates/${match.params.templateId}`;

    return (<>
        <div className="margin-top-4">
            <Link to={pathToTemplates}><span className="details-label">statement templates</span></Link> <i className="fa fa-angle-right margin-x-1"></i>
            <Link to={pathToCurrentTemplate}><span className="details-label">{templateName}</span></Link>
        </div>
        <h2 className="margin-top-1">{isEditing ? 'Edit' : 'Add'} Rule{showForm && <span>:  <span className="text-primary-dark">{jsonPath.join('.')}</span></span>}</h2>
        {
            showForm ?
                <RuleForm jsonPath={jsonPath} returnTo={pathToCurrentTemplate} rule={rule} isEditable={isEditable} isPublished={isPublished} isEditing={isEditing}></RuleForm>
                :
                <>
                    <div className="grid-col margin-bottom-1">
                        What type of rule do you want to create?
                    </div>
                    <div className="grid-row">
                        <div className="grid-col-4">
                            <PanelOne jsonPath={jsonPath} onChange={e => setJSONPath([jsonPath[0], e.target.value])} />
                        </div>
                        <div className="grid-col-4">
                            <PanelTwo jsonPath={jsonPath} onChange={e => setJSONPath([jsonPath[0], jsonPath[1], e.target.value])} setShowForm={setShowForm}></PanelTwo>
                        </div>
                        <div className="grid-col-4">
                            <PanelThree jsonPath={jsonPath} setShowForm={setShowForm}></PanelThree>
                        </div>
                    </div>
                </>
        }

    </>
    )
}

function PanelOne({ jsonPath, onChange }) {
    if (!(jsonPath && jsonPath.length > 0)) return "";

    return (
        <SelectPanel statementProperties={xapiPropData} onChange={onChange}></SelectPanel>
    )
}

function PanelTwo({ jsonPath, onChange, setShowForm }) {
    if (!(jsonPath && jsonPath.length > 1)) return "";
    const stmtprop = jsonPath[1];
    return (
        ['id', 'timestamp', 'verb', 'object'].includes(stmtprop) ?
            <Description statementProperty={xapiPropData[stmtprop]} jsonPath={jsonPath} setShowForm={setShowForm}></Description>
            :
            <SelectPanel statementProperties={xapiPropData[stmtprop]['subprops']} onChange={onChange}></SelectPanel>
    )
}

function PanelThree({ jsonPath, setShowForm }) {
    if (!(jsonPath && jsonPath.length > 2)) return "";
    // jsonpath is len 3 (eg. ['$', 'result', 'success'])
    const xapiProps = xapiPropData[jsonPath[1]]['subprops'][jsonPath[2]];
    return (
        <Description statementProperty={xapiProps} jsonPath={jsonPath} setShowForm={setShowForm}></Description>
    )
}

function SelectPanel({ statementProperties, onChange }) {
    return (
        <select multiple name="property" component="select" role="list" rows="3" className="rule-select" id="property" aria-required="true" style={{ height: "14em", width: "100%", padding: "0.4em 1em" }} onClick={onChange} onChange={onChange}>
            {Object.entries(statementProperties).map((e, i) => (<option key={i} value={e[0]}>{e[1].name}</option>))}
        </select>
    )
}

function Description({ statementProperty, jsonPath, setShowForm }) {
    const baseDesc = `Use when requiring a statement to have ${statementProperty.description} to conform with this template.`;
    return (
        <div style={{ height: "14em", width: "100%", padding: "0.4em 1em", backgroundColor: "rgba(225, 243, 248, 0.25)" }}>
            <h3 className="margin-top-05">{jsonPath.join('.')}</h3>
            <div>
                {baseDesc}
            </div>
            <div style={{ position: "absolute", bottom: "1em" }}>
                <button className="usa-button" onClick={() => setShowForm(true)}>Create Rule</button>
            </div>
        </div>
    );
}



