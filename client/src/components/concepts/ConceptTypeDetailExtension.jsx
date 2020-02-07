/** ***********************************************************************
*
* Veracity Technology Consultants
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/

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
