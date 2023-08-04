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
import { useHistory, Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import api from "../../api"
import { removeMember, selectOrganization } from "../../actions/organizations";

import { MyAccountForm, MyAccountDetails } from "../users/AccountDetails"
import { edited } from '../../actions/successAlert';

export default function AccountDetails(props) {
    let dispatch = useDispatch();

    let [user, setUser] = useState();
    const [isEditing, setIsEditing] = useState(false);
    const [organizations, setOrganizations] = useState([]);

    const currentUser = useSelector(state => state.userData.user);


    const routeMatch = useParams();


    async function getData() {
        let newUser = await api.getJSON("/app/admin/user/" + routeMatch.userId)

        setUser(newUser.user)
        setOrganizations(newUser.organizations)
    }
    useEffect(() => {
        getData()
    }, []);


    let myOrgs = organizations && organizations.filter(org => Array.isArray(org.members) && org.members.find(mem => mem.user === user._id));
    const myOrgRequests = organizations && organizations.filter(org => Array.isArray(org.membershipRequests) && org.memberRequests.find(mem => mem.user === user._id))
    myOrgs = JSON.parse(JSON.stringify(myOrgs));

    async function saveAccountEdits(newAccountDetails) {
        let res = await api.postJSON("/app/admin/user/" + routeMatch.userId, newAccountDetails);
        if (res.success) {

            setIsEditing(false);
            getData()
            dispatch(edited());
        }
        return res;
    }

    if (!user)
        return "";

    async function _removeMember(userid, organizationUuid) {
        await dispatch(selectOrganization(organizationUuid));
        await dispatch(removeMember(userid))
        getData();

    }

    function WorkingGroupRow({ org, pending }) {

        let member = org.members.find(mem => mem.user === user._id);
        member.user = user;
        member.user.id = member.user._id;
        return (
            <tr key={`tr-${org.id}`}>
                <th scope="row">
                    <Link to={`/organization/${org.uuid}`}>
                        {org.name}
                    </Link>
                </th>
                <td>
                    {pending ?
                        <span className="text-italic">Pending approval</span>
                        : <span style={{ textTransform: "capitalize" }}>{member && member.level}</span>}
                </td>
                {

                    pending ?
                        <td>
                            <button className="usa-button usa-button--unstyled" onClick={() => { }}>Cancel Request to Join</button>
                        </td>
                        :
                        <>
                            <td className="text-right">
                                <Link to={{ pathname: `/organization/${org.uuid}/members/${user._id}/edit`, state: { member: member, pending: pending } }}><button className="usa-button usa-button--unstyled"> Edit </button></Link>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <button className="usa-button usa-button--unstyled" onClick={() => _removeMember(user._id, org.uuid)}> Remove</button>
                            </td>
                        </>
                }

            </tr>
        )
    }

    function AdminWorkingGroupsTable({ orgs, adminView, orgReqs, user, setShowDialog, setOrgToLeave }) {
        return <div className="grid-row">
            <table className="usa-table usa-table--borderless margin-top-0" width="100%">
                <thead>
                    <tr>
                        <th width="45%" scope="col">Name</th>
                        <th width="30%" scope="col">Role</th>
                        <th width="25%" scope="col"></th>
                    </tr>
                </thead>
                <tbody style={{ lineHeight: 3 }}>
                    {!((orgs && orgs.length > 0) || (orgReqs && orgReqs.length > 0)) &&
                        <tr key={1}><td className="font-sans-xs" colSpan="6">
                            User is not a member of any working groups.
                        </td></tr>
                    }
                    {(orgReqs && orgReqs.length > 0)
                        && orgReqs.map((org) => <WorkingGroupRow adminView={adminView} org={org} user={user} key={org.id} pending={true} />)
                    }
                    {(orgs && orgs.length > 0)
                        && orgs.map((org) => <WorkingGroupRow adminView={adminView} org={org} user={user} key={org.id} />)
                    }
                </tbody>
            </table>
        </div>
    }


    return (<>
        <div className="grid-container margin-top-3" style={{ padding: 0 }}>
            <Link to="/admin/users">Manage Users</Link>
            <h1>{user.firstname + " " + user.lastname}</h1>
            {isEditing ?
                <MyAccountForm user={user} adminView={true} isAdmin={user.type === "admin"} currentUser={currentUser} saveAction={saveAccountEdits} cancelAction={() => setIsEditing(false)} />
                : <MyAccountDetails user={user} adminView={true} isAdmin={user.type === "admin"} editAction={() => setIsEditing(true)} />}
        </div>
        <div className="grid-container" style={{ padding: 0 }}>
            <div className="grid-row margin-top-6">
                <h1>Working Groups</h1>
            </div>
            <AdminWorkingGroupsTable adminView={true} orgs={myOrgs} user={user} ></AdminWorkingGroupsTable>

        </div>

    </>);
}



