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
                <span className="border-2px padding-05 text-uppercase text-thin text-base font-sans-3xs">pattern</span>
                <h2>{pattern && pattern.name}</h2><br />
            </div>
            <div className="infopanel margin-right-2">
                <div className="margin-left-4">
                    <Detail title="iri">
                        <span className="field-word-break">{pattern && pattern.iri}</span>
                    </Detail>
                    <Detail title="pattern type">
                        {pattern && pattern.type}
                    </Detail>
                    <Detail title="primary or secondary">
                        {pattern && pattern.primary ? 'Primary' : 'Secondary'}
                    </Detail>
                    <Detail title="description">
                        {pattern && pattern.description}
                    </Detail>
                    <Detail title="translations">
                        <Translations translations={pattern && pattern.translations} />
                    </Detail>
                    <Detail title="more information">
                        {pattern && pattern.moreInfo}
                    </Detail>
                    <Detail title="tags">
                        <Tags tags={pattern && pattern.tags} />
                    </Detail>
                    <Detail title="components">
                        {
                            components.map((component, key) => (
                                <a
                                    key={key}
                                    className="usa-button usa-button--unstyled display-block margin-y-105"
                                    type="button"
                                    href={''}
                                    // href={`/organization/${pattern && pattern.createdBy}/profile/${pattern && pattern.parentProfile.uuid}/${component.type ? 'patterns' : 'templates'}/${component.uuid}`}
                                    target="_blank"
                                >
                                    {component.component.name}<i className="margin-left-1 fa fa-external-link"></i>
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
                        {pattern && pattern.parentProfile && pattern.parentProfile.name}
                    </Detail>
                    <Detail title="author" >
                        {(pattern && pattern.parentProfile && pattern.parentProfile.organization.name) || 'Unknown'}
                    </Detail>
                </div>
            </div>
        </div>
    );
}
