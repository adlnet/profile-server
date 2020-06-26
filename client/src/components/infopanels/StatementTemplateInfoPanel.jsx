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
                <span className="border-2px padding-05 text-uppercase text-thin text-base font-sans-3xs">template</span>
                <h2>{template && template.name}</h2><br />
            </div >
            <div className="infopanel margin-right-2">
                <div className="margin-left-4">
                    <Detail title="iri">
                        <span className="field-word-break">{template && template.iri}</span>
                    </Detail>
                    <Detail title="statement template name">
                        {template && template.name}
                    </Detail>
                    <Detail title="description">
                        {template && template.description}
                    </Detail>
                    <Detail title="translations">
                        <Translations translations={template && template.translations} />
                    </Detail>
                    <Detail title="tags">
                        <Tags tags={template && template.tags} />
                    </Detail>
                    <Detail title="concepts">
                        {
                            concepts && concepts.map((concept, key) => (
                                <button
                                    key={key}
                                    className="usa-button usa-button--unstyled display-block margin-y-1"
                                    onClick={() => onViewConceptClick(concept)}
                                >
                                    {concept.name}
                                </button>
                            ))
                        }
                    </Detail>
                </div>
                <div className="bg-base-lightest padding-left-4 padding-y-4">
                    <Detail title="updated" >
                        {(template && template.updatedOn) ? (new Date(template.updatedOn)).toLocaleDateString() : "Unknown"}
                    </Detail>
                    <Detail title="parent profile" >
                        {template && template.parentProfile && template.parentProfile.name}
                    </Detail>
                    <Detail title="author" >
                        {(template && template.parentProfile && template.parentProfile.organization.name) || 'Unknown'}
                    </Detail>
                </div>
            </div>
        </div>
    );
}
