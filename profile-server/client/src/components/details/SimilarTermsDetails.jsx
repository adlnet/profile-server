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

import Flyout from '../controls/flyout';
import ConceptInfoPanel from '../infopanels/ConceptInfoPanel';

export default function SimilarTermsDetails({ similarTerms, linkable }) {
    const [showConceptInfopanel, setShowConceptInfopanel] = useState(false);
    // const [infoPanelConcept, setInfoPanelConcept] = useState();

    // function onConceptClick(concept) {
    //     // setInfoPanelConcept(concept);
    //     setShowConceptInfopanel(concept);
    // }

    return (
        <div>
            {
                similarTerms.length ?
                    similarTerms.map(
                        (similarTerm, key) =>
                            <div key={key} className="margin-bottom-05">
                                {
                                    linkable ?
                                        <span
                                            className="usa-link button-link"
                                            onClick={() => setShowConceptInfopanel(similarTerm.concept)}
                                        >
                                            {similarTerm.concept.name || similarTerm.concept.iri}
                                        </span> :
                                        <span>{similarTerm.concept.name || similarTerm.concept.iri}</span>
                                }
                                <span style={{ textTransform: 'capitalize' }}> ({similarTerm.relationType})</span>
                            </div>
                    ) : "None provided"
            }
            {showConceptInfopanel &&
                <Flyout show={showConceptInfopanel} onClose={() => setShowConceptInfopanel(false)}>
                    <ConceptInfoPanel infoPanelConcept={showConceptInfopanel} />
                </Flyout>
            }
        </div>
    )
}
