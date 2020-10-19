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
import React from 'react';

import { Detail, LinkDetails } from '../DetailComponents';
import SimilarTermsDetails from '../details/SimilarTermsDetails';
import RecommendedTermsDetails from '../details/RecommendedTermsDetails';

export default function ConceptTypeDetailExtention({ concept, similarTermsLinks, recommendedTermsLinks }) {
    let detailExtention = <></>;

    switch (concept && concept.conceptType) {
        case 'Activity':
            detailExtention = (
                <>
                    <Detail title="activity type">
                        {concept && concept.activityType || "None provided"}
                    </Detail>
                </>
            );
            break;
        case 'Verb':
        case 'ActivityType':
        case 'AttachmentUsageType':
            detailExtention = (
                <>
                    <Detail title="similar terms">
                        <SimilarTermsDetails similarTerms={concept && concept.similarTerms} linkable={similarTermsLinks} />
                    </Detail>
                </>
            );
            break;
        case 'Document':
            detailExtention = (
                <>
                    <Detail title="document resource type">
                        {concept && concept.type}
                    </Detail>
                    <Detail title="mediaType">
                        {concept && concept.mediaType || "None provided"}
                    </Detail>
                    <Detail title="context iri">
                        {concept && concept.contextIri || "None provided"}
                    </Detail>
                    {
                        (concept && concept.inlineSchema) &&
                        <Detail title="schema">
                            {concept && concept.inlineSchema || "None provided"}
                        </Detail>
                    }
                    {
                        (concept && concept.schemaString) &&
                        <Detail title="schema iri">
                            <pre className="margin-0" style={{ font: 'inherit' }}>{concept && concept.schemaString || "None provided"}</pre>
                        </Detail>
                    }
                </>
            );
            break;
        case 'Extension':
            detailExtention = (
                <>
                    <Detail title="extention type">
                        {concept && concept.type || "None provided"}
                    </Detail>
                    <Detail title="recommended terms">
                        <RecommendedTermsDetails
                            recommendedTerms={concept && concept.recommendedTerms}
                            linkable={recommendedTermsLinks}
                        />
                    </Detail>
                    <Detail title="context iri">
                        {concept && concept.contextIri || "None provided"}
                    </Detail>
                    {
                        (concept && concept.inlineSchema) &&
                        <Detail title="schema">
                            {concept && concept.inlineSchema || "None provided"}
                        </Detail>
                    }
                    {
                        (concept && concept.schemaString) &&
                        <Detail title="schema iri">
                            <pre className="margin-0" style={{ font: 'inherit' }}>{concept && concept.schemaString || "None provided"}</pre>
                        </Detail>
                    }
                </>
            );
            break;
        default:
            break;
    }

    return detailExtention;
}
