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
import React from 'react'

export default function DeprecatedAlert({ component, componentType, infoPanel }) {

    return (<>
        <div className={`usa-alert usa-alert--warning usa-alert--slim ${infoPanel ? 'margin-bottom-3' : 'margin-top-2'}`} >
            <div className="usa-alert__body">
                <p className="usa-alert__text">
                    <span>
                        This {componentType} was deprecated{(component.updatedBy) && ` by ${component.updatedBy.email}`}{(component.updatedOn) && ` on ${(new Date(component.updatedOn)).toLocaleDateString()}`}.
                    </span>
                </p>
                {component && component.deprecatedReason &&
                    <div className="usa-accordion">
                        <button className="usa-accordion__button usa-banner__button" aria-expanded="false" aria-controls="dep-alert" style={{ margin: 0 }}>
                            <span className="usa-banner__button-text font-ui-xs" style={{ textDecorationStyle: "dotted" }}>Review comments</span>
                        </button>
                        <div className="usa-banner__content usa-sccordion__content" id="dep-alert" hidden={true} style={{ padding: "0.6em 0" }}>
                            <div className="grid-row">
                                {component.deprecatedReason.reason}
                            </div>
                            {component.deprecatedReason.reasonLink && <>
                                <div className="grid-row margin-top-1">
                                    More Information
                                </div>
                                <div className="grid-row">
                                    <a href={component.deprecatedReason.reasonLink} target="_blank" rel="noreferrer">{component.deprecatedReason.reasonLink}</a>
                                </div>
                            </>}
                        </div>
                    </div>
                }
            </div>
        </div>
    </>);
}
