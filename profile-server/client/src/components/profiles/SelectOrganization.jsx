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
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getOrganizations } from "../../actions/organizations";

export default function SelectOrganization() {
    let dispatch = useDispatch();
    let userData = useSelector((store) => store.userData)
    const organizations = useSelector((state) => state.organizations);


    useEffect(() => {
        dispatch(getOrganizations());
    }, [userData]);

    const myOrgs = organizations && organizations.filter(org => 
        Array.isArray(org.members) 
            ? org.members.find(mem => mem.user.uuid === userData.user.uuid)
            : []
    );

    const [selectedOrg, setSelectedOrg] = useState(myOrgs && myOrgs.length ? myOrgs[0].uuid : undefined);

    useEffect(() => {
        setSelectedOrg(myOrgs && myOrgs.length ? myOrgs[0].uuid : undefined)
    }, [userData, organizations])

    console.log(selectedOrg, myOrgs, organizations, userData)

    return (<>
        <main id="main-content" >
            <div className="grid-container ">
                <div className="margin-top-4">
                    <header>
                        <Link to={"/profiles"}><span className="details-label">profiles</span></Link> <i className="fa fa-angle-right"></i>
                        <h1 className="site-page-title margin-top-05">Create Profile</h1>
                    </header>
                </div>
                <div className="grid-row margin-y-1">
                    <div className="grid-col">

                        <span className="text-secondary">*</span>Select the <span className="text-bold">working group</span> that will be responsible for defining and maintaining this profile.
                    </div>
                </div>
                <div className="grid-row margin-y-1">
                    <div className="grid-col-4">
                        {
                            myOrgs && myOrgs.length &&
                            <select
                                className="usa-select"
                                name="role"
                                id="role"
                                style={{ display: "inline" }}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                defaultValue={selectedOrg}
                            >
                                {myOrgs.map(org => <option key={org.uuid} value={org.uuid}>{org.name}</option>)}
                            </select>
                        }
                    </div>
                    <div className="grid-col">
                        <Link to={"/organization/create"} className="usa-button usa-button--unstyled" style={{ marginTop: "1.2em", marginLeft: "2em" }}>Create Working Group</Link>
                    </div>
                </div>
                <div className="grid-row margin-y-1" style={{ marginTop: "2em" }}>
                    <div className="grid-col">
                        {
                            selectedOrg &&
                            <Link to={`/organization/${selectedOrg}/profile/create`} className="usa-button"><i className="fa fa-plus margin-right-05"></i> Create a new xAPI profile</Link>
                        }
                    </div>
                </div>
            </div>
        </main>
    </>)
}