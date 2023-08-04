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
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';

import ApiKeyTableRow from './ApiKeyTableRow';

export default function ApiKeyTable({ apiKeys, onRemove }) {
    const { url } = useRouteMatch()
    const organization = useSelector((state) => state.application.selectedOrganization);
    if (!organization) return '';
    
    const isMember = !!organization.membership;

    return (
        <div className="grid-row">
            <table className="usa-table usa-table--borderless" width="100%">
                <thead>
                    <tr>
                        <th width="30%" scope="col">Name</th>
                        <th width="40%" scope="col">Key</th>
                        <th width="20%" scope="col">Permissions</th>
                        <th width="10%" scope="col">Status</th>

                    </tr>
                </thead>
                <tbody style={{ lineHeight: 3 }}>
                    {(apiKeys && apiKeys.length > 0)
                        ? apiKeys.map((apiKey) => <ApiKeyTableRow url={url} apiKey={apiKey} key={apiKey.uuid} isMember={isMember} onRemove={onRemove} />)
                        : <tr key={1}><td className="font-sans-xs" colSpan="6" style={{ paddingLeft: '0px' }}><p>There are no API keys in this organization.</p></td></tr>}
                </tbody>
            </table>
        </div>
    )
}
