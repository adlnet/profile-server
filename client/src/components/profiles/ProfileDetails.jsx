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
import React, { useEffect } from 'react';
import { Link, useParams, useRouteMatch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// import API from '../../api';
import { Detail, Translations, Tags } from '../DetailComponents';
import { selectProfile, selectProfileVersion } from '../../actions/profiles';

import Sparkline from "../controls/sparkline";


export default function ProfileDetails() {
    // const [orgdata, setOrgData] = useState({});
    const dispatch = useDispatch();
    const { url } = useRouteMatch();
    const { organizationId, profileId, versionId } = useParams();

    const profile = useSelector((state) => state.application.selectedProfile);
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);

    useEffect(() => {
        dispatch(selectProfile(organizationId, profileId));
        dispatch(selectProfileVersion(organizationId, profileId, versionId));
    }, [dispatch]);
    if (!profile || !profileVersion) return '';

    let versions = [...profile.versions];
    versions.sort((a, b) => b.version - a.version);

    return (
        <>
             <Sparkline url={`/org/${organizationId}/profile/${profileId}/usage`} ></Sparkline>
            <div className="grid-row profile-edit">
                <h2 className="profile-edit">
                    <Link to={`${url}/edit`}>
                        <button className="usa-button  usa-button--primary ">
                            <span className="font-sans-2xs text-bold ">
                                <span className="fa fa-pencil fa-lg margin-right-1"></span>
                                Edit Profile Details</span>
                        </button>
                    </Link>
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
                        <Translations translations={profileVersion.translations} />
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
                            <select
                                name="type" value={`${profileVersion.uuid}`} onChange={(e) => dispatch(selectProfileVersion(organizationId, profileId, e.target.value))} rows="3"
                                className="profile-version-select" id="type" aria-required="true"
                            >
                                {
                                    versions.map(version => (
                                        <option key={version.uuid} value={version.uuid}>{`${version.version} ${version.state ? version.state : ''}`}</option>
                                    ))
                                }
                            </select>
                        </Detail>
                        <Detail title="updated">
                            {(profileVersion.updatedOn) ? (new Date(profileVersion.updatedOn)).toLocaleDateString() : 'Unknown'}
                        </Detail>
                        <Detail title="author">
                            {profileVersion.organization.name}
                        </Detail>
                    </div>
                </div>
            </div>
        </>
    )
}
