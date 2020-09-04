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
import { Switch, Route, NavLink, useParams, useRouteMatch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Lock from "../components/users/lock";
import Templates from '../components/templates/Templates';
import Concepts from '../components/concepts/Concepts';
import Patterns from '../components/patterns/Patterns'
import { selectProfile, selectProfileVersion, publishProfileVersion, createNewProfileDraft, editProfileVersion, resolveProfile } from "../actions/profiles";
import history from "../history";
import CreateProfileForm from '../components/profiles/CreateProfileForm';
import ProfileDetails from '../components/profiles/ProfileDetails';
import ErrorPage from '../components/errors/ErrorPage';
import ProfilePublishButton from '../components/profiles/profilePublishButton';
import { selectOrganization } from '../actions/organizations';

export default function Profile() {
    const dispatch = useDispatch();
    const { url, path } = useRouteMatch();
    const { organizationId, profileId, versionId } = useParams();

    const profile = useSelector((state) => state.application.selectedProfile);
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);
    const organization = useSelector(state => state.application.selectedOrganization);

    let isMember = !!organizationId && organization && organization.membership;

    useEffect(() => {
        // url might be /profile/:uuid .. or /organization/uuid/profile/uuid/version/uuid
        if (profileId && versionId) {
            dispatch(selectProfile(organizationId, profileId));
            dispatch(selectProfileVersion(organizationId, profileId, versionId));
        } else if (profileId) {
            // url must be /profile/:uuid.. figure out what id they sent us
            dispatch(resolveProfile(profileId));
        }

        if (organizationId) {
            dispatch(selectOrganization(organizationId));
        }
    }, [organizationId, profileId, versionId])

    if (!(profile && profileVersion && organization)) return '';


    function publishProfile() {
        if (profileVersion.state !== 'draft') return;
        dispatch(publishProfileVersion(profileVersion));
    }

    function handleEditProfile(values) {
        if (values.state === 'published') {
            // if editing the published profile, we need to clean up 
            // the values param since we create a new draft from the published version.
            let newVersion = {
                tags: values.tags,
                concepts: values.concepts,
                externalConcepts: values.externalConcepts,
                templates: values.templates,
                patterns: values.patterns,
                translations: values.translations,
                name: values.name,
                description: values.description,
                moreInformation: values.moreInformation,
                version: values.version,
                iri: values.iri
            };
            // Need to verify iri is a new one, not the original published version (profileVersion)
            if (newVersion.iri === profileVersion.iri) delete newVersion.iri;
            dispatch(createNewProfileDraft(newVersion));
        } else {
            dispatch(editProfileVersion(values));
        }

        history.push(url);
    }

    function handleCancelEditProfile() {
        history.push(url);
    }

    function isMaxVersion(version) {
        const max = Math.max(...profile.versions.map(v => v.version));
        return version === max;
    }

    return (<>
        {
            profileVersion.state === 'draft' ?
                <div className="outer-alert">
                    <div className="usa-alert usa-alert--slim usa-alert--info margin-top-2" >
                        <div className="usa-alert__body">
                            <p className="usa-alert__text">
                                This profile is in a DRAFT state and won’t be available for public use until it is published.
                            </p>
                        </div>
                    </div>
                </div> :
                !isMaxVersion(profileVersion.version) ?
                    <div className="outer-alert">
                        <div className="usa-alert usa-alert--slim usa-alert--warning margin-top-2" >
                            <div className="usa-alert__body">
                                <p className="usa-alert__text">
                                    You are viewing an older version of this profile ({profileVersion.version}). Return to the latest version (version #).
                                </p>
                            </div>
                        </div>
                    </div> : ''

        }
        <header className="usa-header usa-header--extended">
            <div className="usa-navbar bg-base-lightest">
                <div className="usa-logo" id="extended-logo">
                    <span className="text-uppercase text-thin font-sans-3xs">Manage Profile</span>
                    <em className="usa-logo__text"><a href="/" title="Home" aria-label="Home">{profileVersion.name}</a></em>
                </div>
                <button className="usa-menu-btn">Menu</button>
            </div>
            <nav aria-label="Primary navigation" className="usa-nav">
                <div className="usa-nav__inner">
                    <button className="usa-nav__close"><i className="fa fa-close"></i></button>
                    <ul className="usa-nav__primary usa-accordion" style={{ marginBottom: '-.15rem' }}>
                        <li className={`usa-nav__primary-item`}>
                            <NavLink exact
                                to={`${url}`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">Details</span>
                            </NavLink>
                        </li>
                        <li className={`usa-nav__primary-item`}>
                            <NavLink
                                to={`${url}/templates`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">Statement Templates ({profileVersion.templates ? profileVersion.templates.length : 0})</span>
                            </NavLink>
                        </li>
                        <li className={`usa-nav__primary-item`}>
                            <NavLink
                                to={`${url}/patterns`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">Patterns ({profileVersion.patterns ? profileVersion.patterns.length : 0})</span>
                            </NavLink>
                        </li>
                        <li className={`usa-nav__primary-item`}>
                            <NavLink
                                to={`${url}/concepts`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">
                                    Concepts ({
                                        profileVersion.concepts && profileVersion.externalConcepts ?
                                            profileVersion.concepts.length + profileVersion.externalConcepts.length : 0
                                    })
                                </span>
                            </NavLink>
                        </li>
                    </ul>
                    {isMember &&
                        <div className="usa-nav__secondary">
                            <div className="pull-right">
                                <ProfilePublishButton onPublish={publishProfile} />
                            </div>
                        </div>
                    }
                </div>
            </nav>
        </header>
        <main id="main-content" className="grid-container padding-bottom-4">

            <Switch>
                <Route exact path={path}>
                    <ProfileDetails isMember={isMember} />
                </Route>
                <Route path={`${path}/templates`} >
                    <Templates isMember={isMember} />
                </Route>
                <Route path={`${path}/patterns`} >
                    <Patterns isMember={isMember} />
                </Route>
                <Route path={`${path}/concepts`} >
                    <Concepts isMember={isMember} />
                </Route>
                <Route path={`${path}/edit`}>
                    {isMember ? <>
                        <h2>Edit Profile Details</h2>

                        <Lock resourceUrl={`/org/${organization.uuid}/profile/${profile.uuid}/version/${profileVersion.uuid}`}>
                            <CreateProfileForm
                                handleSubmit={handleEditProfile}
                                handleCancel={handleCancelEditProfile}
                                initialValue={profileVersion}
                            />
                        </Lock> </>
                        : <p>You do not have permissions to edit this profile. <a href={path} className="usa-link">Go Back</a></p>}
                </Route>
                <Route>
                    <ErrorPage />
                </Route>
            </Switch>
        </main>
    </>);
}
