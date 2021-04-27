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
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sparkline from "../controls/sparkline2";
export default function ProfileResult({ result, openFlyout }) {
    const patterncount = (patterns) => {
        console.log('fuck this')
        return patterns.reduce((p, c) => {
            debugger
            if (c.parentProfile.parentProfile.id.toString() === result.parentProfile.id.toString()) return p + 1;
            return p;
        }, 0)
    }

    return <div key={result.uuid} className="grid-row profile-result">


        <div className="grid-col-8 margin-bottom-1" style={{ paddingRight: "1em" }}>

            <h4><Link to={"/profile/" + result.uuid}>{result.name}</Link>
                {result.isVerified && <img className="margin-left-1" src="/assets/uswds/2.4.0/img/verified.svg" alt="This profile is verified" title="This profile is verified" width="18px" height="18px" />}
            </h4>
            <p>
                <strong>{new Date(result.createdOn).toDateString()} - {result.organization && result.organization.name}</strong><br></br>
                {result.description}</p>
            <div className="tags">{result.tags && result.tags.map(i => <span className="usa-tag display-inline-flex bg-accent-cool-lighter text-base-darkest padding-y-05 margin-right-1" ><span className="">{i}</span></span>)}
                {result && result.similarProfiles && result.similarProfiles.length > 0 &&
                    <button className="usa-button usa-button--unstyled font-ui-3xs" onClick={openFlyout}>See similar profiles</button>
                }
            </div>

        </div>
        <div className="grid-col-4 ">
            <div className="grid-row ">
                <Sparkline url={`/org/${result.organization.uuid}/profile/${result.parentProfile.uuid}/usage`}></Sparkline>
            </div>

            <div className="grid-row display-flex" style={{ justifyContent: "space-between" }}>


                <div className="bg-base-lightest profile-search-counts">
                    <div><strong>{result.concepts.length}</strong> concepts</div>
                </div>

                <div className="bg-base-lightest profile-search-counts">
                    <div><strong>{result.templates.length}</strong> templates</div>
                </div>

                <div className="bg-base-lightest profile-search-counts">
                    <div><strong>{result.patterns.length}</strong> patterns</div>
                </div>

            </div>


        </div>
    </div>
}