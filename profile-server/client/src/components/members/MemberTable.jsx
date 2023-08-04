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
import MemberTableRow from "./MemberTableRow";

export default function MemberTable({ members, isAdmin }) {
    return <div className="grid-row">
        <table className="usa-table usa-table--borderless" width="100%">
            <thead>
                <tr>
                    <th width="20%" scope="col">Username</th>
                    <th width="30%" scope="col">Full Name</th>
                    <th width="20%" scope="col">Role</th>
                    <th width="20%" scope="col">Date Joined</th>
                    <th width="10%" scope="col"></th>
                </tr>
            </thead>
            <tbody style={{ lineHeight: 3 }}>
                {(members && members.length > 0)
                    ? members.map((member, i) => <MemberTableRow isAdmin={isAdmin} member={member} key={member.id} />)
                    : <tr key={1}><td className="font-sans-xs" colSpan="6">There are no members in this organization.</td></tr>}
            </tbody>
        </table>
    </div>
}