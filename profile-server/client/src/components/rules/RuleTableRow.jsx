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
import RemoveButton from '../controls/removeButton';

export default function RuleTableRow(props) {
    return (
        <tr>
            <th scope="row" width="90%">
                <Link className="usa-link button-link display-block margin-y-1" to={{ pathname: `${props.url}/view`, state: { rule: props.rule } }}>
                    {props.rule.location}
                </Link>
            </th>
            {props.isMember && props.isCurrentVersion && !props.belongsToAnotherProfile &&
                <td>
                    <Link className="usa-link button-link display-block margin-y-1" to={{ pathname: `${props.url}/edit`, state: { rule: props.rule } }}>
                        <span className="text-bold">Edit</span>
                    </Link>
                </td>
            }
            {props.isMember && props.isCurrentVersion && !props.isPublished && !props.belongsToAnotherProfile &&
                <td>
                    <RemoveButton className="usa-button  usa-button--unstyled" onClick={() => props.removeRule(props.rule)} item="rule" object="statement template" />
                </td>
            }
        </tr>
    );
}