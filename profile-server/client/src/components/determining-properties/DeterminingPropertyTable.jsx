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
import { useSelector } from 'react-redux';

import DeterminingPropertyTableRow from './DeterminingPropertyTableRow';

export default function DeterminingPropertyTable({ removeDeterminingProperty, url, isMember, isCurrentVersion, isPublished, isEditable }) {
    const determiningProperties = useSelector(state => state.application.selectedDeterminingProperties);

    return (<>
        <table className="usa-table usa-table--borderless" width="100%">
            <thead>
                <tr>
                    {(determiningProperties && determiningProperties.length > 0) ?
                        <>
                            <th width="30%" scope="col">Property</th>
                            <th width="65%" scope="col">Concept</th>
                            <th width="5%" scope="col"></th>
                        </> :
                        <th width="90%" scope="col" colSpan={3}>
                            <span className="text-normal text-base font-ui-2xs">At least one determining property is needed to match and validate statements to rules in this template.</span>
                        </th>
                    }
                </tr>
            </thead>
            <tbody style={{ lineHeight: 3 }}>
                {(determiningProperties && determiningProperties.length > 0) ?
                    determiningProperties.map((determiningProperty, i) =>
                        <DeterminingPropertyTableRow
                            key={i}
                            determiningProperty={determiningProperty}
                            removeDeterminingProperty={removeDeterminingProperty}
                            url={url}
                            isMember={isMember}
                            isCurrentVersion={isCurrentVersion}
                            isPublished={isPublished} />
                    ) :
                    <tr key={1}>
                        <td className="font-sans-xs" colSpan="3" style={{ paddingLeft: '0px' }}>
                            <p>There are no determining properties set for this statement template.</p>
                        </td></tr>
                }
            </tbody>
        </table>
        {isMember && isCurrentVersion && !isPublished && isEditable &&
            <Link
                to={`${url}/create`}>
                <button className="usa-button">Add Determining Property</button>
            </Link>
        }
    </>);
}
