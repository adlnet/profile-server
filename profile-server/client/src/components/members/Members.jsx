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
import { Link, Route, Switch, useRouteMatch, useHistory, useParams, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


import { getMembers, } from "../../actions/organizations";
import MemberTable from "./MemberTable";
import AddMember from './AddMember';


export default function Members({ isMember }) {

    const dispatch = useDispatch();
    const history = useHistory();
    const { path, url } = useRouteMatch();
    const { organizationId } = useParams();

    const organization = useSelector((state) => state.application.selectedOrganization);

    const isAdmin = isMember === "admin";

    useEffect(() => {
        dispatch(getMembers());
    }, [dispatch, organizationId])

    if (!organization) {
        return '';
    }

    let knownMembers = Array.isArray(organization.members) ? organization.members : [];
    let knownMemberRequests = Array.isArray(organization.memberRequests) ? organization.memberRequests : [];

    return (
        <Switch>
            <Route exact path={path}>
                <div className="grid-row">
                    <div className="grid-col">
                        <h2>Members</h2>
                    </div>
                    <div className="grid-col display-flex flex-column flex-align-end">
                        {isAdmin &&
                            <Link
                                to={`${url}/add`}
                                className="usa-button margin-top-2 margin-right-0"
                            >
                                <i className="fa fa-plus margin-right-05"></i>
                            Add Member
                        </Link>
                        }
                    </div>
                </div>
                <MemberTable isAdmin={isAdmin} members={[...knownMemberRequests, ...knownMembers]}></MemberTable>
            </Route>
            <Route exact path={`${path}/add`}>
                {
                    isMember && isAdmin ?
                        <AddMember url={url} />
                        : <Redirect to={url} />
                }
            </Route>
            <Route exact path={`${path}/:userId/edit`}>
                {
                    isMember && isAdmin ?
                        <AddMember url={url} />
                        : <Redirect to={url} />
                }
            </Route>
        </Switch>
    );
}