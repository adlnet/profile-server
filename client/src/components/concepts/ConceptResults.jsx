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

import Truncate from 'react-truncate';
export default function ConceptResults(props) {
    let handleClick = () => {
        props.buttonAction(props.concept)
    };

    return (
        <div className="grid-row border-top padding-top-2 padding-bottom-2 padding-right-1 padding-left-1">
            <div className="grid-col-9">
                <span className="">{props.concept.name}</span><br />
                <span className="font-sans-3xs">
                    <Truncate lines={2}>
                        {props.concept.description}
                    </Truncate>
                </span>
                <br /><br />
                <span className="font-sans-3xs text-base-light">{props.concept.parentProfileName}</span>
            </div>
            <div className="grid-col-3">
                {/* move style and button decisions from here to addtemplate .. both selected style and button text */}
                <button className={`usa-button ${props.styles}`} onClick={handleClick}>{props.buttonText}</button>
                {/* <button className={`usa-button${props.isSelected(props.template) ? " usa-button--outline" : ""}`} onClick={handleClick}>{props.buttonText}</button> */}
                <button className="usa-button usa-button--unstyled" onClick={props.onViewDetailsClick}>View Details</button>
            </div>
        </div>
    );
}
