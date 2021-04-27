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
import { useState } from 'react';
import { useRouteMatch, Link, useHistory } from 'react-router-dom'
import CancelButton from '../controls/cancelButton';

export default function PatternTypes() {
    let [type, updateType] = useState("");
    const { url } = useRouteMatch();
    const history = useHistory()

    return (
        <>
            <form className="usa-form" style={{ marginBottom: "1.5em" }}>
                <span className="text-secondary">*</span>What type of pattern will this be?
            <fieldset className="usa-fieldset">
                    <div className="usa-radio">
                        <input className="usa-radio__input"
                            type="radio"
                            id="sequence"
                            name="sequence"
                            value="sequence"
                            onChange={() => updateType("sequence")}
                            checked={type === "sequence"}>
                        </input>
                        <label className="usa-radio__label" htmlFor="sequence">
                            <div className="title">Sequence</div>
                            <div className="description">
                                A list of statement templates or secondary patterns in a particular order.
                                This will match if the identified components match in the order specified.
                        </div>
                        </label>
                    </div>
                    <div className="usa-radio">
                        <input className="usa-radio__input"
                            type="radio"
                            id="alternates"
                            name="alternates"
                            value="alternates"
                            onChange={() => updateType("alternates")}
                            checked={type === "alternates"}>
                        </input>
                        <label className="usa-radio__label" htmlFor="alternates">
                            <div className="title">Alternates</div>
                            <div className="description">
                                A list of statement templates or secondary patterns. This will match if any
                                component from the list matches.
                        </div>
                        </label>
                    </div>
                    <div className="usa-radio">
                        <input className="usa-radio__input"
                            type="radio"
                            id="optional"
                            name="optional"
                            value="optional"
                            onChange={() => updateType("optional")}
                            checked={type === "optional"}>
                        </input>
                        <label className="usa-radio__label" htmlFor="optional">
                            <div className="title">Optional</div>
                            <div className="description">
                                Identifies a single statement template or secondary pattern. This will match
                                if the component is not present once or not at all.
                        </div>
                        </label>
                    </div>
                    <div className="usa-radio ">
                        <input className="usa-radio__input"
                            type="radio"
                            id="oneormore"
                            name="oneormore"
                            value="oneormore"
                            onChange={() => updateType("oneormore")}
                            checked={type === "oneormore"}>
                        </input>
                        <label className="usa-radio__label" htmlFor="oneormore">
                            <div className="title">One or More</div>
                            <div className="description">
                                Identifies a single statement template or secondary pattern. This will match
                                if the component is present one or more times.
                        </div>
                        </label>
                    </div>

                    <div className="usa-radio ">
                        <input className="usa-radio__input"
                            type="radio"
                            id="zeroormore"
                            name="zeroormore"
                            value="zeroormore"
                            onChange={() => updateType("zeroormore")}
                            checked={type === "zeroormore"}>
                        </input>
                        <label className="usa-radio__label" htmlFor="zeroormore">
                            <div className="title">Zero or More</div>
                            <div className="description">
                                Identifies a single statement template or secondary pattern. This will match if
                                the component is not present or is present one or more times.
                        </div>
                        </label>
                    </div>
                </fieldset>
            </form>
            <Link className="usa-button padding-x-3 margin-right-4" to={`${url}/${type}`}>Continue</Link>
            <CancelButton className="usa-button usa-button--unstyled" type="reset" cancelAction={() => history.push(url.replace("/create", ""))} />
        </>);
}