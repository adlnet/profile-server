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
import { Link } from 'react-router-dom'

export function Detail(props) {
    return ( <>
        <div className="grid-row">
            <div className="desktop:grid-col">
                <span className="text-uppercase text-thin text-base font-sans-3xs">{ props.title }</span>
            </div>
        </div>
        <div className="grid-row margin-bottom-3">
            <div className="desktop:grid-col margin">
            { props.children }
            </div>
        </div>
    </>);
}

export function Tags(props) {
    if (!props.tags) return ""; 

    return ( 
        props.tags.map( 
            (tag, index) => {
                return (
                    <span 
                        key={index}
                        className="usa-tag display-inline-flex bg-accent-cool-lighter text-base-darkest padding-y-05 margin-right-1"
                        style={{marginTop:'.5em'}}
                    >
                        {tag}
                    </span>
                );
            }
        ) 
    );
}

export function Translations(props) {
    if (!props.translations) return "";

    return (props.translations.map(
        (translation, key) => 
            <div key={key}>
                <Link
                        to='' 
                        className="usa-link">
                    {translation.language}
                </Link>
            </div>
        ));
}

export function LinkDetails(props) {
    if (!props.linkDetails) return "";

    return (props.linkDetails.map(
        (linkDetail, key) => 
            <div key={key}>
                <Link
                        to='' 
                        className="usa-link">
                    {linkDetail}
                </Link>
            </div>
        ));
}
