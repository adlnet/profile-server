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
import { Link, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Detail, Tags, Translations } from '../DetailComponents';
import { selectTemplate } from "../../actions/templates";

export default function TemplateDetail() {
    const { url, params } = useRouteMatch();
    let dispatch = useDispatch();
    let template = useSelector((state) => state.application.selectedTemplate)
    
    useEffect(() => { 
        dispatch(selectTemplate(params.templateId)) },
        [dispatch, params.templateId]
    );
    
    return (
        <div className="grid-row">
            <div className="desktop:grid-col-7">
                <Detail title="statement name">
                    {template.name}
                </Detail> 
                <Detail title="description">
                    {template.description}
                </Detail> 
                <Detail title="translations">
                    <Translations translations={template.translations} />
                </Detail> 
                <Detail title="tags">
                    <Tags tags={template.tags} />
                </Detail> 
            </div>
            <div className="desktop:grid-col-4 grid-offset-1">
                <Link 
                        className="usa-button margin-bottom-2" 
                        to={`${url}/edit`}>
                    Edit Statement Template Details
                </Link>
                <div className="padding-2 bg-base-lightest">
                    <Detail title="updated" >
                        {template.updated}
                    </Detail>
                    <Detail title="parent profile" >
                        {template.parentProfileName}
                    </Detail>
                    <Detail title="author" >
                        {template.author}
                    </Detail>
                </div>
            </div>
        </div>
    );
}

