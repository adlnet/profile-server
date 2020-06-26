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
import RuleTableRow from './RuleTableRow';

export default function RuleTable({ rules, onAddRule }) {
    return (<>
        <table className="usa-table usa-table--borderless" width="100%">
            <thead>
                <tr>
                    <th width="30%" scope="col">Location</th>
                    <th width="15%" scope="col">Presence</th>
                    <th width="50%" scope="col">Value</th>
                    <th width="5%" scope="col"></th>
                </tr>
            </thead>
            <tbody style={{ lineHeight: 3 }}>
                {(rules && rules.length > 0) ?
                    rules.map((rule, key) => <RuleTableRow key={key} {...rule} />) :
                    <tr key={1}><td className="font-sans-xs" colSpan="4" style={{ paddingLeft: '0px' }}>
                        <p>There are no rules set for this statement template. Add a rule.</p>
                    </td></tr>
                }
            </tbody>
        </table>
        <button className="usa-button usa-button--outline padding-x-4" onClick={onAddRule}>Add Rule</button>
    </>);
}
