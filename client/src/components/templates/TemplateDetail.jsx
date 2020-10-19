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
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Detail, Tags, Translations } from '../DetailComponents';

export default function TemplateDetail({ onEditClick, isMember, isCurrentVersion, belongsToAnotherProfile, isEditable }) {
    let template = useSelector((state) => state.application.selectedTemplate)

    return (
        <div className="grid-row">
            <div className="desktop:grid-col-8">
                <Detail title="id" subtitle="The IRI used to identify this in an xAPI statement.">
                    {template.iri}
                </Detail>
                <Detail title="statement template name" subtitle="English (en)">
                    {template.name}
                </Detail>
                <Detail title="description" subtitle="English (en)">
                    {template.description}
                </Detail>
                <Detail title="translations">
                    <Translations translations={template.translations} linkable={true} />
                </Detail>
                <Detail title="tags">
                    <Tags tags={template.tags} />
                </Detail>
            </div>
            <div className="desktop:grid-col-4 display-flex flex-column flex-align-end">
                {isMember && isCurrentVersion && !belongsToAnotherProfile && isEditable &&
                    <button
                        className="usa-button padding-x-105 margin-bottom-2 margin-right-0"
                        onClick={onEditClick}
                    >
                        <span className="fa fa-pencil fa-lg margin-right-1"></span>
                     Edit Statement Template Details
                    </button>
                }
                <div className="details-metadata-box width-full">
                    <Detail title="updated" >
                        {(template.updatedOn) ? (new Date(template.updatedOn)).toLocaleDateString() : "Unknown"}
                    </Detail>
                    <Detail title="parent profile" >
                        {(template.parentProfile && template.parentProfile.name) ?
                            belongsToAnotherProfile ?
                                <Link to={`/profile/${template.parentProfile.uuid}`}>{template.parentProfile.name}</Link>
                                : template.parentProfile.name
                            : 'Unknown'}
                    </Detail>
                    <Detail title="author" >
                        {(template.parentProfile && template.parentProfile.organization.name) ?
                            <Link to={`/organization/${template.parentProfile.organization.uuid}`}>{template.parentProfile.organization.name}</Link> : 'Unknown'}
                    </Detail>
                </div>
            </div>
        </div>
    );
}

