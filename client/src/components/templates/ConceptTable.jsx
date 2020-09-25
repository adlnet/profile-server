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

import ConceptTableRow from "./ConceptTableRow";

export default function ConceptTable({ concepts, url, isMember, isCurrentVersion }) {
    return (
        <>
            <div className="grid-row">
                <table className="usa-table usa-table--borderless" width="100%">
                    <thead>
                        <tr>
                            <th width="20%" scope="col">Name</th>
                            <th width="20%" scope="col">Type</th>
                            <th width="20%" scope="col">Parent Profile</th>
                            <th width="10%" scope="col">Updated</th>
                        </tr>
                    </thead>
                    <tbody style={{ lineHeight: 3 }}>
                        {(concepts && concepts.length > 0)
                            ? concepts.map((concept, i) => <ConceptTableRow key={i} {...concept} site_url={url} isMember={isMember} isCurrentVersion={isCurrentVersion} />)
                            : <tr key={1}><td className="font-sans-xs" colSpan="6" style={{ paddingLeft: '0px' }}><p>There are no concepts in this profile. Concepts created in this profile or added through import or statement templates will appear here.</p></td></tr>}
                    </tbody>
                </table>
            </div>
        </>
    );
}