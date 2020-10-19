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

import { Detail, Translations, Tags } from '../DetailComponents';
import { selectInfopanelTemplate } from '../../actions/templates';
import { Link } from 'react-router-dom';
import DeprecatedAlert from '../controls/deprecatedAlert';

export default function StatementTemplateInfoPanel({ infoPanelTemplate, onViewConceptClick }) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(selectInfopanelTemplate(infoPanelTemplate.uuid))
    }, [infoPanelTemplate]);

    const template = useSelector((state) => state.application.infopanelTemplate);
    const determiningProperties = useSelector((state) => state.application.selectedDeterminingProperties);

    if (!(template && determiningProperties)) return '';

    const concepts = determiningProperties.map(d => d.properties).flat(Infinity);

    return (
        <div>
            <div className="padding-top-4 padding-left-4">
                <span className="border-1px padding-05 text-uppercase text-thin text-ink font-sans-3xs">template</span>
                {template && template.isDeprecated && <span className="border-1px margin-left-1 padding-05 text-uppercase text-thin bg-base-lighter text-ink font-sans-3xs">deprecated</span>}
                <h2>{template && template.name}</h2><br />
            </div >
            <div className="infopanel margin-right-2">
                <div className="margin-left-4">
                    {template && template.isDeprecated ?
                        <DeprecatedAlert component={template} componentType="template" infoPanel={true} />
                        : ''
                    }
                    <Detail title="iri">
                        <span className="field-word-break">{template && template.iri}</span>
                    </Detail>
                    <Detail title="description" subtitle="English (en)">
                        {template && template.description}
                    </Detail>
                    <Detail title="translations">
                        <Translations translations={template && template.translations} />
                    </Detail>
                    <Detail title="tags">
                        <Tags tags={template && template.tags || <span className="text-italic text-base">(none)</span>} />
                    </Detail>
                    <Detail title="concepts">
                        {
                            concepts && concepts.map((concept, key) => (
                                concept.parentProfile && concept.name &&
                                <a
                                    key={key}
                                    className="usa-button usa-button--unstyled display-block margin-y-105"
                                    type="button"
                                    href={`/profile/${concept.parentProfile && concept.parentProfile.uuid}/concepts/${concept.uuid}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {concept.name}<i className="margin-left-1 fa fa-external-link"></i>
                                </a>
                            ))
                        }
                    </Detail>
                </div>
                <div className="bg-base-lightest padding-left-4 padding-y-4">
                    <Detail title="updated" >
                        {(template && template.updatedOn) ? (new Date(template.updatedOn)).toLocaleDateString() : "Unknown"}
                    </Detail>
                    <Detail title="parent profile" >
                        {(template.parentProfile && template.parentProfile.name) ?
                            <Link to={`/profile/${template.parentProfile.uuid}`}>{template.parentProfile.name}</Link>
                            : 'Unknown'}
                    </Detail>
                    <Detail title="author" >
                        {(template.parentProfile && template.parentProfile.organization.name) ?
                            <Link to={`/organization/${template.parentProfile.organization.uuid}`}>{template.parentProfile.organization.name}</Link> : 'Unknown'}
                    </Detail>
                </div>
            </div>
        </div>
    );
}
