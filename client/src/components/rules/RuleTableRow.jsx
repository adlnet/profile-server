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

export default function RuleTableRow(props) {
    return (
        <tr>
            <th scope="row">
                {props.location}
            </th>
            <td><span className="font-sans-3xs">{props.presense}</span></td>
            <td><span className="font-sans-3xs">{props.value}</span></td>
            <td><button className="usa-button  usa-button--unstyled"><span className="text-bold">Edit</span></button></td>
            <td><button className="usa-button  usa-button--unstyled"><span className="text-bold">Remove</span></button> </td>
        </tr>
    );
}