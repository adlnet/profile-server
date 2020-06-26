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
import { Link } from 'react-router-dom';

import { Detail } from '../DetailComponents';

export default function About({ organization, rootUrl }) {
    return (<>
        <div className="grid-row">
            <div className="desktop:grid-col-8">
                <h2>About this Working Group</h2>
                <Detail title="name">
                    {organization.name}
                </Detail>
                <Detail title="description">
                    {organization.description}
                </Detail>
                <Detail title="link to collaborate">
                    {organization.collaborationLink}
                </Detail>
            </div>
            <div className="desktop:grid-col-4 display-flex flex-column flex-align-end">
                <Link
                        to={`${rootUrl}/edit`}
                        className="usa-button padding-x-105 margin-top-2 margin-right-0 "
                >
                    <span className="fa fa-pencil fa-lg margin-right-1"></span>
                    Edit Working Group Details
                </Link>
                <div className="padding-2 bg-base-lightest margin-top-2 width-full">
                    <Detail title="date created">
                        {(organization.createdOn) ? (new Date(organization.createdOn)).toLocaleDateString() : "Unknown"}
                    </Detail>
                    <Detail title="created by">
                        {organization.createdBy.username}
                    </Detail>
                </div>
            </div>
            
        </div>
    </>)
}
