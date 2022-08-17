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

export default function MemberTableRow({ member, isAdmin }) {
    let disabled = "";
    let pending = !member.level;
    // if (member.level === "owner")
    //     disabled = "disabled";

    return (
        <tr >
            <td>{member.user.username}</td>
            <th scope="row">{member.user.fullname || "Not Made Public"}</th>
            <td>{pending ? <em>Pending Approval</em> : <span style={{ textTransform: "capitalize" }}>{member.level}</span>}</td>
            <td>{member.user._created && (new Date(member.user._created)).toLocaleDateString()}</td>
            <td>
                {!disabled && isAdmin &&
                    <Link to={{
                        pathname: `./members/${member.user.id}/edit`,
                        state: { member: member, pending: pending }
                    }} className={disabled}>
                        <button className={disabled + " usa-button  usa-button--unstyled"}><span className="text-bold">{pending ? 'Review' : 'Edit'}</span></button>
                    </Link>
                }
            </td>
        </tr>
    )
}
