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
import { Link, useRouteMatch } from 'react-router-dom';

import ProfileTable from './ProfileTable';

export default function Profiles({ profiles, isMember }) {

    const { url } = useRouteMatch();

    return (<>
        <div className="grid-row">
            <div className="grid-col">
                <h2>Profiles</h2>
            </div>
            <div className="grid-col display-flex flex-column flex-align-end">
                {isMember &&
                    <Link
                        to={`${url}/profile/create`}
                    >
                        <button className="usa-button margin-top-2 margin-right-0">
                            <i className="fa fa-plus margin-right-05"></i>
                    Create xAPI Profile</button>
                    </Link>
                }
            </div>
        </div>
        <ProfileTable profiles={profiles} siteUrl={url} isMember={isMember} />
    </>);
}
