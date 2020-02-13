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
import React, { useEffect } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Detail, Tags, Translations } from '../DetailComponents';
import { selectTemplate } from "../../actions/templates";

export default function TemplateDetail() {
    const { url, params } = useRouteMatch();
    let dispatch = useDispatch();
    let template = useSelector((state) => state.application.selectedTemplate)

    useEffect(() => {
        dispatch(selectTemplate(params.templateId))
    },
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

