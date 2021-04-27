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
import { useDispatch, useSelector } from 'react-redux';

import { Detail, Translations } from '../DetailComponents';
import ConceptTypeDetailExtension from '../concepts/ConceptTypeDetailExtension';
import { selectInfopanelConcept } from '../../actions/concepts';
import { Link } from 'react-router-dom';
import DeprecatedAlert from '../controls/deprecatedAlert';

export default function ConceptInfoPanel({ infoPanelConcept }) {
    const dispatch = useDispatch()

    useEffect(() => {
        if (infoPanelConcept)
            dispatch(selectInfopanelConcept(infoPanelConcept.uuid))
    }, [infoPanelConcept]);

    const concept = useSelector((state) => state.application.infopanelConcept);

    if (!concept) return '';

    return (
        <div>
            <div className="padding-top-4 padding-left-4">
                <span className="border-1px padding-05 text-uppercase text-thin text-ink font-sans-3xs">concept</span>
                {concept && concept.isDeprecated && <span className="border-1px margin-left-1 padding-05 text-uppercase text-thin bg-base-lighter text-ink font-sans-3xs">deprecated</span>}
                <h2>{concept && concept.name}</h2><br />
            </div>
            <div className="infopanel margin-right-2">
                <div className="margin-left-4">
                    {concept && concept.isDeprecated ?
                        <DeprecatedAlert component={concept} componentType="concept" infoPanel={true} />
                        : ''
                    }
                    <Detail title="concept type">
                        {concept && concept.conceptType}
                    </Detail>
                    <Detail title="iri">
                        <span className="field-word-break">{concept && concept.iri}</span>
                    </Detail>
                    <Detail title="description" subtitle="English (en)">
                        {concept && concept.description}
                    </Detail>
                    <Detail title="translations">
                        <Translations translations={concept && concept.translations} />
                    </Detail>
                    <ConceptTypeDetailExtension concept={concept} />
                </div>
                <div className="bg-base-lightest padding-left-4 padding-y-4">
                    <Detail title="updated" >
                        {(concept && concept.updatedOn) ? (new Date(concept.updatedOn)).toLocaleDateString() : "Unknown"}
                    </Detail>
                    <Detail title="parent profile" >
                        {(concept && concept.parentProfile && concept.parentProfile.name) ?
                            <Link to={`/profile/${concept.parentProfile.uuid}`}>{concept.parentProfile.name}</Link>
                            : 'Unknown'}
                    </Detail>
                    <Detail title="author" >
                        {(concept && concept.parentProfile && concept.parentProfile.organization.name) ?
                            <Link to={`/organization/${concept.parentProfile.organization.uuid}`}>{concept.parentProfile.organization.name}</Link> : 'Unknown'}
                    </Detail>
                </div>
            </div>
        </div>
    );
}
