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
import RuleTableRow from './RuleTableRow';

export default function RuleTable({ rules, onAddRule, isMember, isCurrentVersion, isPublished, removeRule, url, belongsToAnotherProfile, isEditable }) {
    return (<>
        <table className="usa-table usa-table--borderless" width="100%">
            <thead>
                <tr>
                    <th width="90%" scope="col" colSpan={2}><span className="text-normal text-base font-ui-2xs">Rules are the restrictions on value(s) for specific locations within statements that must be met to conform to this template.</span></th>
                </tr>
            </thead>
            <tbody>
                {(rules && rules.length > 0) ?
                    rules.map((rule, key) => <RuleTableRow key={key} rule={rule} url={url} isMember={isMember} isCurrentVersion={isCurrentVersion} isPublished={isPublished} removeRule={removeRule} belongsToAnotherProfile={belongsToAnotherProfile} />) :
                    <tr key={1}><td className="font-sans-xs" colSpan="4" style={{ paddingLeft: '0px' }}>
                        <p>There are no rules set for this statement template.</p>
                    </td></tr>
                }
            </tbody>
        </table>
        {isMember && isCurrentVersion && !isPublished && !belongsToAnotherProfile && isEditable &&
            <button className="usa-button padding-x-4" onClick={onAddRule}>Add Rule</button>
        }
    </>);
}
