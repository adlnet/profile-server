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

export default function RecommendedTermsDetails({ recommendedTerms, linkable }) {
    // const [showConceptInfopanel, setShowConceptInfopanel] = useState(false);
    // const [infoPanelConcept, setInfoPanelConcept] = useState();

    // function onConceptClick(concept) {
    //     setInfoPanelConcept(concept);
    //     setShowConceptInfopanel(true);
    // }

    return (
        <div>
            {
                recommendedTerms.length ?
                    recommendedTerms.map(
                        (recommendedTerm, key) =>
                            <div key={key} className="margin-bottom-05">
                                {
                                    linkable ?
                                        <span
                                            className="usa-link button-link"
                                        // onClick={() => onConceptClick(recommendedTerm)}
                                        >
                                            {recommendedTerm.name || recommendedTerm.iri}
                                        </span> :
                                        <span>{recommendedTerm.name || recommendedTerm.iri}</span>
                                }
                            </div>
                    ) : "None provided"
            }

            {/* <Flyout show={showConceptInfopanel} onClose={() => setShowConceptInfopanel(false)}>
                <ConceptInfoPanel concept={infoPanelConcept} />
            </Flyout> */}
        </div>
    )
}
