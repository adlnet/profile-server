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

import React, { useEffect }  from 'react';
import { useRouteMatch, NavLink } from 'react-router-dom';
import TemplateTableRow from "./TemplateTableRow";
import {useDispatch,useSelector} from "react-redux";
import {getTemplates} from "../../actions/templates";

export default function TemplateTable() {
    let { url } = useRouteMatch();
    const templates = useSelector((state) => state.templates);
    
    const dispatch = useDispatch();
    const match = useRouteMatch();
   
    useEffect(() => {
        dispatch(getTemplates(match.params.organizationId, match.params.profileId)); return},
        [dispatch, match.params.organizationId, match.params.profileId]
    );

    return (<div>
        <div className="grid-row">
            <div className="desktop:grid-col">
                <h2>Statement Templates</h2>
            </div>
        </div>
        <div className="grid-row">
            <table className="usa-table usa-table--borderless" width="100%">
                <thead>
                    <tr>
                        <th width="50%" scope="col">Name</th>
                        <th width="17%" scope="col">Parent Profile</th>
                        <th width="28%" scope="col">Updated</th>
                        <th width="5%" scope="col"></th>
                    </tr>
                </thead>
                <tbody style={{lineHeight: 3}}>
                    {(templates && templates.length > 0) ?
                        templates.map( (template, i) => <TemplateTableRow template={template} key={i} {...template} url={url} /> ) :
                        <tr key={1}><td className="font-sans-xs" colSpan="4">There are no statement templates associated with this profile. Add statement templates manually or import from a JSON file.</td></tr>
                    }       
                </tbody>
            </table>
        </div>
        <div className="grid-row padding-top-2">
            <div className="desktop:grid-col-3">
                <NavLink exact 
                            to={`${url}/add`}
                            className="usa-button">
                    <span>Add Statement Template</span>
                </NavLink>
            </div>
            <div className="desktop:grid-col-3">
                <button className="usa-button ">Import from JSON File</button>
            </div>
        </div>
    </div>);
}