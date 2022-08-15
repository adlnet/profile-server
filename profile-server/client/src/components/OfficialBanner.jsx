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

export default class OfficialBanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false
        }
        this.expand = this.expand.bind(this);
    }
    expand() {
        this.setState((e) => {
            return {
                expanded: !e.expanded
            }
        })
    }
    render() {
        // let id = require("uuid").v4();
        let expanded = this.state.expanded;
        let style = {
            display: "block"
        }
        if (!expanded)
            style.display = "none";
        
        return (<>
            <a className="usa-skipnav" href="#main-content">Skip to main content</a>
            <div className="usa-banner">
                <div className="usa-accordion">
                    <header className="usa-banner__header">
                        <div className="usa-banner__inner">
                            <div className="grid-col-auto">
                                <img className="usa-banner__header-flag" src="/assets/uswds/2.4.0/img/us_flag_small.png" alt="U.S. flag" />
                            </div>
                            <div className="grid-col-fill tablet:grid-col-auto">
                                <p className="usa-banner__header-text">An official website of the United States government</p>
                                <p className="usa-banner__header-action" aria-hidden="true">Here’s how you know</p>
                            </div>
                            <button className="usa-accordion__button usa-banner__button" aria-expanded="false" aria-controls="gov-banner">
                                <span className="usa-banner__button-text">Here’s how you know</span>
                            </button>
                        </div>
                    </header>
                    <div className="usa-banner__content usa-accordion__content" id="gov-banner">
                        <div className="grid-row grid-gap-lg">
                            <div className="usa-banner__guidance tablet:grid-col-6">
                                <img className="usa-banner__icon usa-media-block__img" src="/assets/uswds/2.4.0/img/icon-dot-gov.svg" alt="Dot gov" />
                                <div className="usa-media-block__body">
                                    <p>
                                        <strong>The .gov means it's official.</strong>
                                        <br />
                                        Federal government websites often end in .gov or .mil. Before sharing sensitive information, make sure you’re on a federal government site.
                                    </p>
                                </div>
                            </div>
                            <div className="usa-banner__guidance tablet:grid-col-6">
                                <img className="usa-banner__icon usa-media-block__img" src="/assets/uswds/2.4.0/img/icon-https.svg" alt="Https" />
                                <div className="usa-media-block__body">
                                    <p>
                                        <strong>The site is secure.</strong>
                                        <br />
                                        The <strong>https://</strong> ensures that you are connecting to the official website and that any information you provide is encrypted and transmitted securely.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>)
    }
}
