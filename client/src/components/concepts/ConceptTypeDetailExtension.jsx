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

import { Detail, LinkDetails } from '../DetailComponents';

// props.concept
export default function ConceptTypeDetailExtention(props) {
    let detailExtention = <></>;

    switch (props.type) {
        case 'Activity':
            detailExtention = (
                <>
                    <Detail title="activity type">
                        {props.activityType}
                    </Detail>
                </>
            );
            break;
        case 'Verb':
            detailExtention = (
                <>
                    <Detail title="similar terms">
                        <LinkDetails linkDetails={props.similarTerms} />
                    </Detail>
                </>
            );
            break;
        case 'Document':
            detailExtention = (
                <>
                    <Detail title="document resource type">
                        {props.documentResourceType}
                    </Detail>
                    <Detail title="mediaType">
                        {props.mediaType}
                    </Detail>
                    <Detail title="context iri">
                        {props.contextIri}
                    </Detail>
                    <Detail title="schema iri">
                        {props.schemaIri}
                    </Detail>
                </>
            );
            break;
        case 'Extension':
            detailExtention = (
                <>
                    <Detail title="extension type">
                        {props.extensionType}
                    </Detail>
                    <Detail title="similar terms">
                        <LinkDetails linkDetails={props.recommendedTerms} />
                    </Detail>
                    <Detail title="context iri">
                        {props.contextIri}
                    </Detail>
                    <Detail title="schema iri">
                        {props.schemaIri}
                    </Detail>
                </>
            );
            break;
        default:
            break;
    }

    return detailExtention;
}
