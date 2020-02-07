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
import React  from 'react';

import Truncate from 'react-truncate';
export default function TemplateResults (props) {
    let handleClick = () => {
        props.buttonAction(props.template)
    };

    return (
        <div className="grid-row border-top padding-top-2 padding-bottom-2 padding-right-1 padding-left-1">
            <div className="grid-col-9">
                <span className="">{props.template.name}</span><br />
                <span className="font-sans-3xs">
                    <Truncate lines={2}>
                        {props.template.description}
                    </Truncate>
                </span>
                <br /><br />
                <span className="font-sans-3xs text-base-light">{props.template.parentProfileName}</span>
            </div>
            <div className="grid-col-3">
                {/* move style and button decisions from here to addtemplate .. both selected style and button text */}
                <button className={`usa-button ${props.styles}`} onClick={handleClick}>{props.buttonText}</button>
                {/* <button className={`usa-button${props.isSelected(props.template) ? " usa-button--outline" : ""}`} onClick={handleClick}>{props.buttonText}</button> */}
                <button className="usa-button usa-button--unstyled">View Details</button>
            </div>
        </div>
    );
}
