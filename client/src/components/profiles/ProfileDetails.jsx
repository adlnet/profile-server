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
import { Link, useRouteMatch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Detail, Translations, Tags } from '../DetailComponents';
import { selectProfileVersion } from '../../actions/profiles';
import history from '../../history';

import Sparkline from "../controls/sparkline";


export default function ProfileDetails({ isMember, isCurrentVersion }) {

    const dispatch = useDispatch();
    const { url } = useRouteMatch();

    const profile = useSelector((state) => state.application.selectedProfile);
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);
    const organization = useSelector(state => state.application.selectedOrganization);

    if (!(profile && profileVersion && organization)) return '';

    let versions = [...profile.versions];
    versions.sort((a, b) => b.version - a.version);

    const changeVersion = (e) => {
        dispatch(selectProfileVersion(organization.uuid, profile.uuid, e.target.value));
        history.push(`/organization/${organization.uuid}/profile/${profile.uuid}/version/${e.target.value}`);
    }

    return (
        <>

            <div className="grid-row profile-edit">
                <h2 className="profile-edit">
                    {isMember && isCurrentVersion &&
                        <Link to={`${url}/edit`}>
                            <button className="usa-button  usa-button--primary ">
                                <span className="font-sans-2xs text-bold ">
                                    <span className="fa fa-pencil fa-lg margin-right-1"></span>
                                    Edit Profile Details</span>
                            </button>
                        </Link>
                    }
                </h2>
                <div className="desktop:grid-col-2">
                    <h2>Profile Details</h2>
                </div>
                <div className="desktop:grid-col-1">

                </div>
            </div>
            <div className="grid-row">
                <div className="desktop:grid-col-8">
                    <Detail title="iri">
                        {profile.iri}
                    </Detail>
                    <Detail title="version iri">
                        {profileVersion.iri}
                    </Detail>
                    <Detail title="profile name">
                        {profileVersion.name}
                    </Detail>
                    <Detail title="description">
                        {profileVersion.description}
                    </Detail>
                    <Detail title="translations">
                        <Translations translations={profileVersion.translations} linkable={true} />
                    </Detail>
                    <Detail title="more information">
                        <a href={profileVersion.moreInformation} className="usa-link">{profileVersion.moreInformation}</a>
                    </Detail>
                    <Detail title="tags">
                        <Tags tags={profileVersion.tags} />
                    </Detail>
                </div>
                <div className="desktop:grid-col-4">
                    <div className="details-metadata-box">
                        <Detail title="version">
                            {
                                !isMember ?
                                    (profileVersion.version + (profileVersion.state === 'verified' ? profileVersion.state : ''))
                                    :

                                    <select
                                        name="type" value={`${profileVersion.uuid}`} onChange={changeVersion} rows="3"
                                        className="profile-version-select" id="type" aria-required="true"
                                    >
                                        {
                                            versions.map((version, idx) => (
                                                <option
                                                    key={version.uuid}
                                                    value={version.uuid}
                                                    disabled={version.isShallowVersion}
                                                >
                                                    {`${version.version} ${version.isVerified ? 'verified' : idx === 0 ? version.state : ''}`}
                                                </option>
                                            ))
                                        }
                                    </select>
                            }
                        </Detail>
                        <Detail title="updated">
                            {(profileVersion.updatedOn) ? (new Date(profileVersion.updatedOn)).toLocaleDateString() : 'Unknown'}
                        </Detail>
                        <Detail title="author">
                            {profileVersion.organization.name}
                        </Detail>
                        <Detail title="total views for the last 30 days">
                            <Sparkline url={`/metrics/profile/${profile.uuid}/usageOverTime`} ></Sparkline>
                        </Detail>
                    </div>
                </div>
            </div>
        </>
    )
}
