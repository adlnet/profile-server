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
**************************************************************** */import React from 'react';
import { Link } from 'react-router-dom';
import { removeMember } from "../../actions/organizations";

import { useDispatch, useSelector } from 'react-redux';


export default function MemberTableRow({ member }) {

    const dispatch = useDispatch();
    function _removeMember()
    {
        dispatch(removeMember(member.user.id))
    }
    let disabled = "";
    if(member.level === "owner")
    disabled = "disabled";
    return (
        <tr>
            <th width="20%" scope="row">
                { member.user.username}
            </th>
            <td><span >{member.level}</span></td>
            <td>
                
                <button onClick={() => _removeMember()} className={disabled + " usa-button  usa-button--unstyled"}><span className="text-bold">Remove</span></button>
            </td>
        </tr>
    )
}
