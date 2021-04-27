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
import { Link, } from 'react-router-dom';

export default function ConceptTableRow(props) {
    return (
        <tr>
            <th width="20%" scope="row">
                {
                    props.name ? (
                        <Link
                            to={`${props.site_url}/${props.uuid}`}
                            className="usa-link button-link"
                        >
                            <span>{props.name}</span>
                        </Link>
                    )
                        : props.iri
                }
            </th>

            <td><span width="20%" className="font-sans-3xs">{props.conceptType || 'unknown'}</span></td>
            <td><span width="20%" className="font-sans-3xs">{(props.parentProfile && props.parentProfile.name) || 'unknown'}</span></td>
            <td><span width="10%" className="font-sans-3xs">{(props.updatedOn) ? (new Date(props.updatedOn)).toLocaleDateString() : "Unknown"}</span></td>
        </tr>
    );
}
