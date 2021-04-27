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
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Detail, Tags, Translations } from '../DetailComponents';
import { selectInfopanelPattern } from '../../actions/patterns';
import { Link } from 'react-router-dom';
import DeprecatedAlert from '../controls/deprecatedAlert';

export default function PatternInfoPanel({ infoPanelPattern }) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(selectInfopanelPattern(infoPanelPattern.uuid));
    }, [dispatch, infoPanelPattern]);

    const pattern = useSelector((state) => state.application.infopanelPattern);

    if (!pattern) return "";

    const components = Array.isArray(pattern[pattern.type]) ? pattern[pattern.type] : [pattern[pattern.type]];

    return (
        <div>
            <div className="padding-top-4 padding-left-4">
                <span className="border-1px padding-05 text-uppercase text-thin text-ink font-sans-3xs">pattern</span>
                {pattern && pattern.isDeprecated && <span className="border-1px margin-left-1 padding-05 text-uppercase text-thin bg-base-lighter text-ink font-sans-3xs">deprecated</span>}
                <h2>{pattern && pattern.name}</h2><br />
            </div>
            <div className="infopanel margin-right-2">
                <div className="margin-left-4">
                    {pattern && pattern.isDeprecated ?
                        <DeprecatedAlert component={pattern} componentType="pattern" infoPanel={true} />
                        : ''
                    }
                    <Detail title="iri">
                        <span className="field-word-break">{pattern && pattern.iri}</span>
                    </Detail>
                    <Detail title="type">
                        {pattern && pattern.type}
                    </Detail>
                    <Detail title="primary or secondary">
                        {pattern && pattern.primary ? 'Primary' : 'Secondary'}
                    </Detail>
                    <Detail title="description" subtitle="English (en)">
                        {pattern && pattern.description}
                    </Detail>
                    <Detail title="translations">
                        <Translations translations={pattern && pattern.translations} />
                    </Detail>
                    <Detail title="more information">
                        {pattern && pattern.moreInfo || <span className="text-italic text-base">(none)</span>}
                    </Detail>
                    <Detail title="tags">
                        <Tags tags={pattern && pattern.tags || <span className="text-italic text-base">(none)</span>} />
                    </Detail>
                    <Detail title="components">
                        {
                            components.map((component, key) => (
                                component && component.component && component.component.parentProfile && component.component.name &&
                                <a
                                    key={key}
                                    className="usa-button usa-button--unstyled display-block margin-y-105"
                                    type="button"
                                    href={`/profile/${component.component && component.component.parentProfile && component.component.parentProfile.uuid}/${component.componentType === 'template' ? 'templates' : 'patterns'}/${component.component && component.component.uuid}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {component.component && component.component.name}<i className="margin-left-1 fa fa-external-link"></i>
                                </a>
                            ))
                        }
                    </Detail>
                </div>
                <div className="bg-base-lightest padding-left-4 padding-y-4">
                    <Detail title="updated" >
                        {(pattern && pattern.updatedOn) ? (new Date(pattern.updatedOn)).toLocaleDateString() : "Unknown"}
                    </Detail>
                    <Detail title="parent profile" >
                        {(pattern.parentProfile && pattern.parentProfile.name) ?
                            <Link to={`/profile/${pattern.parentProfile.uuid}`}>{pattern.parentProfile.name}</Link>
                            : 'Unknown'}
                    </Detail>
                    <Detail title="author" >
                        {(pattern.parentProfile && pattern.parentProfile.organization.name) ?
                            <Link to={`/organization/${pattern.parentProfile.organization.uuid}`}>{pattern.parentProfile.organization.name}</Link> : 'Unknown'}
                    </Detail>
                </div>
            </div>
        </div>
    );
}
