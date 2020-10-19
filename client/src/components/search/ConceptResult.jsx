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
export default function ConceptResult({ result, type }) {
    let date = new Date(result.createdOn);
    date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()


    return <div className="grid-row profile-result">
        <div className="grid-col-12 padding-bottom-1">
            <h4><Link to={"/profile/" + result.parentProfile.uuid + "/" + type + "/" + result.uuid}>{result.name}</Link></h4>
            <p><strong>{date} {result.type ? "- " + result.type : ""} - Profile: {result.parentProfile.name}</strong><br></br>
                {result.description}</p>
            <div className="tags">
                {result.isDeprecated ? <span className="usa-tag display-inline-flex bg-base-lighter border border-base-darkest text-base-darkest padding-y-05 margin-right-1" ><span className="">deprecated</span></span> : ''}
                {result.tags && result.tags.map(i => <span className="usa-tag display-inline-flex bg-accent-cool-lighter text-base-darkest padding-y-05 margin-right-1" ><span className="">{i}</span></span>)}
            </div>
        </div>

    </div>
}