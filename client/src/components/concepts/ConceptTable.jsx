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
import { Link } from 'react-router-dom';

import ConceptTableRow from "./ConceptTableRow";


export default function ConceptTable(props) {


    let concepts = props.concepts;

    return (
        <>
            <div className="grid-row">
                <table className="usa-table usa-table--borderless" width="100%">
                    <thead>
                        <tr>
                            <th width="20%" scope="col">Name</th>
                            <th width="20%" scope="col">Type</th>
                            <th width="20%" scope="col">Parent Profile</th>
                            {!props.inTemplate ? <th width="20%" scope="col">Statement Template Count</th> : null}
                            <th width="10%" scope="col">Updated</th>
                            <th width="10%" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody style={{ lineHeight: 3 }}>
                        {(concepts && concepts.length > 0)
                            ? concepts.map((concept, i) => <ConceptTableRow inTemplate={props.inTemplate} key={i} {...concept} site_url={props.url} />)
                            : <tr key={1}><td className="font-sans-xs" colSpan="6">There are no concepts in this profile. Concepts created in this profile or added through import or statement templates will appear here.</td></tr>}
                    </tbody>
                </table>
            </div>
            <div className="grid-row padding-top-2">
                <div className="desktop:grid-col-3">
                    <Link
                        to={props.addConceptLinkPath}>
                        <button className="usa-button ">Add Concept</button>
                    </Link>
                </div>
            </div>
        </>
    );
}