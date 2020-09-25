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

import WebHookTableRow from './WebHookTableRow';

export default function WebHookTable({ webHooks, onRemove }) {
    const { url } = useRouteMatch()
   

    return (
        <div className="grid-row">
            <table className="usa-table usa-table--borderless" width="100%">
                <thead>
                    <tr>
                        <th width="30%" scope="col">Event</th>
                        <th width="40%" scope="col">Target</th>
                        <th width="15%" scope="col">Description</th>
                        <th width="10%" scope="col">Status</th>
                        <th width="5%" scope="col"></th>
                    </tr>
                </thead>
                <tbody style={{ lineHeight: 3 }}>
                    {(webHooks && webHooks.length > 0)
                        ? webHooks.map((hook) => <WebHookTableRow url={url} hook={hook} key={hook.uuid}  onRemove={onRemove}/>)
                        : <tr key={1}><td className="font-sans-xs" colSpan="6" style={{paddingLeft: '0px'}}><p>You have no Web Hooks</p></td></tr>}
                </tbody>
            </table>
        </div>
    )
}
