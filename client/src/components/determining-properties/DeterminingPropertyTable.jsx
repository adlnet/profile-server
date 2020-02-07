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
import DeterminingPropertyTableRow from './DeterminingPropertyTableRow';

export default function DeterminingPropertyTable (props) {
    return (<>
        <table className="usa-table usa-table--borderless" width="100%">
            <thead>
                <tr>
                    <th width="30%" scope="col">Property</th>
                    <th width="65%" scope="col">Concept</th>
                    <th width="5%" scope="col"></th>
                </tr>
            </thead>
            <tbody style={{lineHeight: 3}}>
                {(props.rules && props.rules.length > 0) ?
                    props.rules.map( (rule, i) => <DeterminingPropertyTableRow key={i} {...rule} /> ) :
                    <tr key={1}><td className="font-sans-xs" colSpan="4">There are no statement rules associated with this profile. Add statement rules manually or import from a JSON file.</td></tr>
                }       
            </tbody>
        </table>
        <Link
            to=''>
            <button className="usa-button">Add Determining Property</button>
        </Link>
    </>);
}
