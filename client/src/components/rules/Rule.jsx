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
import { Link, useLocation, useParams } from 'react-router-dom';
import ScopeNote from '../fields/ScopeNote';

export default function Rule({ templateName, url, belongsToAnotherProfile }) {
    const params = useParams();
    const location = useLocation();
    const rule = location.state && location.state.rule;
    const [jsonPath, setJSONPath] = useState(rule && rule.location.split('.') || ['$']);
    // if the org id isn't present then this was hit through the public urls
    const isPublicView = !params.organizationId;

    // remove any empty arrays or strings, and remove anything that isn't part of a rule
    let rulesString = Object.fromEntries(Object.entries(rule).map(([key, value]) => {
        if (!['location', 'selector', 'presence', 'any', 'all', 'none'].includes(key)) return;
        if (value.trim && !value.trim().length) return;
        if (Array.isArray(value) && !value.length) return;
        return [key, value];
    }).filter(e => e));
    // make it a string, then remove { and }
    rulesString = JSON.stringify(rulesString, null, 2).slice(1, -1);


    const pathToTemplates = !isPublicView ? `/organization/${params.organizationId}/profile/${params.profileId}/version/${params.versionId}/templates`
        : `/profile/${params.profileId}/templates`;
    const pathToCurrentTemplate = !isPublicView ? `/organization/${params.organizationId}/profile/${params.profileId}/version/${params.versionId}/templates/${params.templateId}`
        : `/profile/${params.profileId}/templates/${params.templateId}`;

    return (<>
        <div className="grid-row">
            <div className="grid-col">
                <div className="margin-top-4">
                    <Link to={pathToTemplates}><span className="details-label">statement templates</span></Link> <i className="fa fa-angle-right margin-x-1"></i>
                    <Link to={pathToCurrentTemplate}><span className="details-label">{templateName}</span></Link>
                </div>
                <h2 className="margin-top-1">View Rule <span>:  <span className="text-primary-dark">{jsonPath.join('.')}</span></span></h2>
            </div>
            <div className="display-flex flex-column flex-align-right">
                <div className="padding-top-5">
                    {!belongsToAnotherProfile && !isPublicView &&
                        <Link className="usa-button" to={{ pathname: `${url}/edit`, state: { rule: rule } }}>
                            <i className="fa fa-pencil margin-right-1"></i> Edit Rule
                    </Link>
                    }
                </div>
            </div>
        </div>
        <div className="grid-row">
            <div className="grid-col">
                <fieldset className="usa-fieldset" style={{ border: "1px solid #f0f0f0", padding: "2em" }}>
                    <span className="text-bold">Only one rule per location.</span>
                    <label className="usa-label" htmlFor="rule">
                        <span className="font-code-2xs" style={{ fontWeight: "lighter" }}>"rules": [</span><br />
                        <span className="font-code-2xs padding-left-4" style={{ fontWeight: "lighter" }}>&#123;</span>
                    </label>
                    <div className="grid-row margin-top-05">
                        <div className="grid-col-7 padding-left-4">
                            <textarea
                                readOnly={true}
                                value={rulesString}
                                name="rule"
                                id="rule"
                                rows="15"
                                className="font-code-3xs"
                                aria-required="true"
                                style={{ width: "100%", fontWeight: "lighter", resize: "none", height: "15em" }}>
                            </textarea>
                        </div>
                    </div>
                    <div>
                        <span className="font-code-sm padding-left-4" style={{ fontWeight: "lighter" }}>&#125;</span><br />
                        <span className="font-code-sm" style={{ fontWeight: "lighter" }}>]</span>
                    </div>
                    <div>
                        <ScopeNote readOnly={true} field={{ value: rule.scopeNote }}></ScopeNote>
                    </div>
                </fieldset>
            </div>
        </div>

    </>);
}