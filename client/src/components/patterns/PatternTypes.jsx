/** ***********************************************************************
*
* Veracity Technology Consultants 
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
import React from 'react';
import { useState } from 'react';
import { useRouteMatch, Link } from 'react-router-dom'

export default function PatternTypes() {
    let [type, updateType] = useState("");
    const { url } = useRouteMatch();

    return (
        <>
            <form className="usa-form">
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
                            id="alternate"
                            name="alternate"
                            value="alternate"
                            onChange={() => updateType("alternate")}
                            checked={type === "alternate"}>
                        </input>
                        <label className="usa-radio__label" htmlFor="alternate">
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
            <Link className="usa-button" to={`${url}/${type}`}>Continue</Link>  <button className="usa-button usa-button--unstyled" type="reset">Cancel</button>
        </>);
}