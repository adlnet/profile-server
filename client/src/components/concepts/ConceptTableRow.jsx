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
import { Link, } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {removeConceptFromTemplate} from "../../actions/templates"
import {removeConcept} from "../../actions/profiles"


export default function ConceptTableRow(props) {

    let dispatch = useDispatch();
    function removeClick()
    {
        if(props.inTemplate)
            return dispatch(removeConceptFromTemplate(props))
        if(!props.inTemplate)
            return dispatch(removeConcept(props))
    }
    return (
        <tr>
            <th width="20%" scope="row">
                <Link
                    to={`${props.site_url}/${props.uuid}`}
                >
                    <span>{props.name}</span>
                </Link>
            </th>
          
            <td><span width="20%" className="font-sans-3xs">{props.type}</span></td>
            <td><span width="20%" className="font-sans-3xs">{props.parentProfile.name}</span></td>
            {!props.inTemplate? <td><span width="20%" className="font-sans-3xs">{props.fromTemplate}</span></td> : null}
            <td><span width="10%" className="font-sans-3xs">{props.updatedOn}</span></td>
    
            {props.fromTemplate == 0 || props.inTemplate  ? <td>
                <button onClick={()=>removeClick()} className="usa-button  usa-button--unstyled"><span className="text-bold">Remove</span></button>
                </td> : <td></td>}
            {/* <td><button className="usa-button  usa-button--unstyled"><span className="text-bold">Remove</span></button> </td> */}
        </tr>
    );
}
