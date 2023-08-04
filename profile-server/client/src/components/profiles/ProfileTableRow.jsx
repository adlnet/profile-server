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

export default function ProfileTableRow({ profile, site_url, isMember, onOptionalSingleSelect, forceShowDrafts }) {
    if (!isMember && profile && !profile.currentPublishedVersion) 
        return <></>;

    function selectedRow(e) {
        if (onOptionalSingleSelect) {
            onOptionalSingleSelect(profile);
        }
    }

    let canClick = (onOptionalSingleSelect);
    
    let hasDraftVersion = !!profile.currentDraftVersion;
    let hasPublishedVersion = !!profile.currentPublishedVersion;

    return (
        <tr onClick={selectedRow}>
            <th width="20%" scope="row">
                {
                    !isMember && profile && hasPublishedVersion ?
                        <Link
                            to={`/profile/${profile.currentPublishedVersion.uuid}`}
                            className="usa-link button-link"
                            style={canClick ? {pointerEvents: "none"} : null}
                        >
                            {profile.currentPublishedVersion.name}
                        </Link>
                        :
                        profile && hasDraftVersion ?
                            <Link
                                to={`${site_url}/profile/${profile.uuid}/version/${profile.currentDraftVersion.uuid}`}
                                className="usa-link button-link"
                                style={canClick ? {pointerEvents: "none"} : null}
                            >
                                {profile.currentDraftVersion.name}
                            </Link> 
                            :
                            <Link
                                to={`${site_url}/profile/${profile.uuid}/version/${profile.currentPublishedVersion?.uuid}`}
                                className="usa-link button-link"
                                style={canClick ? {pointerEvents: "none"} : null}
                            >
                                {profile.currentPublishedVersion != undefined ? profile.currentPublishedVersion.name : profile.currentPublishedVersion.uuid}
                                {profile.currentPublishedVersion?.isVerified && <img className="margin-left-1" src="/assets/uswds/2.4.0/img/verified.svg" alt="This profile is verified" title="This profile is verified" width="18px" height="18px" />}
                            </Link>
                }
            </th>
            <td>{profile.currentDraftVersion && isMember ? 'Draft' : profile.currentPublishedVersion && profile.currentPublishedVersion.isVerified ? 'Verified' : 'Published'}</td>
            <td><span className="font-sans-3xs">{(profile.updatedOn) ? (new Date(profile.updatedOn)).toLocaleDateString() : 'Unknown'}</span></td>
        </tr>
    )
}
