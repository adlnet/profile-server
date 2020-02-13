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
import { removeTemplate } from "../../actions/profiles";
import { useDispatch } from "react-redux";

export default function TemplateTableRow(props) {
    const dispatch = useDispatch();

    return (
        <tr>
            <th scope="row">
                {/* <a href={`${props.site_url}/${props.id}`}>{props.name}</a> */}
                <Link
                    to={`${props.url}/${props.uuid}`}>
                    <span>{props.name}</span>
                </Link>

            </th>
            <td><span className="font-sans-3xs">{props.parentProfileName}</span></td>
            <td><span className="font-sans-3xs">{props.updated}</span></td>
            <td><button className="usa-button  usa-button--unstyled"><span className="text-bold" onClick={() => dispatch(removeTemplate(props.template))}>Remove</span></button> </td>
        </tr>
    );
}