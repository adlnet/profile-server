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
 import Templates from '../components/templates/Templates';
 import Concepts from '../components/concepts/Concepts';
 import Patterns from '../components/patterns/Patterns'
 import { selectProfile, selectProfileVersion, resolveProfile } from "../actions/profiles";
 import ProfileDetails from '../components/profiles/ProfileDetails';
 import ErrorPage from '../components/errors/ErrorPage';
 import { selectOrganization } from '../actions/organizations';

 import AccountButton from "../components/users/AccountButton";
 

 export default function DeletedItemsPage(props) {
    const { url, path } = useRouteMatch();
    const { organizationId, profileId, versionId } = useParams();
    const dispatch = useDispatch();

    const userData = useSelector((state) => state.userData);
    const profile = useSelector((state) => state.application.selectedProfile);
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);
    const organization = useSelector(state => state.application.selectedOrganization);

    let isMember = organization
        && (organization.membership
            || (userData && userData.user && Array.isArray(organization.members) && organization.members.map(m => m.user.uuid).includes(userData.user.uuid)));
    
    let isCurrentVersion = true;

    useEffect(() => {
        // url might be /profile/:uuid .. or /organization/uuid/profile/uuid/version/uuid
        if (profileId && versionId) {
            dispatch(selectProfile(organizationId, profileId));
            dispatch(selectProfileVersion(organizationId, profileId, versionId));
        } else if (profileId) {
            console.log('missing version id');
            // url must be /profile/:uuid.. figure out what id they sent us
            dispatch(resolveProfile(profileId));
        }

        if (organizationId) {
            dispatch(selectOrganization(organizationId));
        }
    }, [organizationId, profileId, versionId]);

    if (!(profile && profileVersion && organization)) return '';
  
    return (
        <>
        <header className="usa-header usa-header--extended margin-top-5">
            <div className="usa-navbar bg-base-lightest usa-navbar-container">
                <div className="usa-navbar-item" style={{ width: "65%" }}>
                    <div className="usa-logo" id="extended-logo" style={{ margin: ".5em 0 0 0", maxWidth: "100%" }}>
                        <h3 className="margin-y-0 margin-right-2" style={{ display: "inline-block" }}><a href={isMember ? `${url}` : `/profile/${profileVersion.uuid}`} title="Home" aria-label="Home">{profileVersion.name}</a></h3>
                        {profileVersion.isVerified && <img className="" src="/assets/uswds/2.4.0/img/verified.svg" alt="This profile is verified" title="This profile is verified" width="28px" height="28px" />}
                    </div>
                    <div style={{ marginBottom: "1em" }}>
                        <span className="text-base font-ui-3xs" style={{ lineHeight: ".1" }}>IRI: {profile.iri}</span>
                    </div>
                </div>
            </div>
            <nav aria-label="Primary navigation" className="usa-nav">
                <div className="usa-nav__inner">
                    <button className="usa-nav__close"><i className="fa fa-close"></i></button>
                    <ul className="usa-nav__primary usa-accordion" style={{ marginBottom: '-.15rem' }}>
                        <li className="usa-nav__primary-item main-menu-show">
                            <NavLink to="/profiles"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Profiles</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item main-menu-show">
                            <NavLink to="/organization"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Working Groups</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item main-menu-show">
                            <NavLink to="/api-info"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current">
                                <span className="text-bold">API Info</span>
                            </NavLink>
                        </li>
                        {userData && userData.user && userData.user.type === 'admin' &&
                            <li className="usa-nav__primary-item main-menu-show">
                                <button className="usa-accordion__button usa-nav__link" aria-expanded="false" aria-controls="basic-nav-section-admin1">
                                    <span className="text-bold">Admin</span>
                                </button>
                                <ul id="basic-nav-section-admin1" className="usa-nav__submenu" hidden>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/admin/users"
                                            className="usa-link"
                                        >
                                            Manage Users
                                        </NavLink>
                                    </li>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/admin/verification"
                                            className="usa-link"
                                        >
                                            Verify Profiles
                                        </NavLink>
                                    </li>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/admin/analytics"
                                            className="usa-link"
                                        >
                                            Analytics
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        }
                        <li className="usa-nav__primary-item main-menu-show" style={{ marginLeft: 'auto' }}>
                            <AccountButton controlIndex={1000}></AccountButton>
                        </li>
                        <li className={`usa-nav__primary-item `}>
                            <NavLink exact
                                to={`${url}`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">Profile Details</span>
                            </NavLink>
                        </li>
                        <li className={`usa-nav__primary-item `}>
                            <NavLink
                                to={`${url}/templates`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">Statement Templates ({profileVersion.templates ? profileVersion.templates.length : 0})</span>
                            </NavLink>
                        </li>
                        <li className={`usa-nav__primary-item `}>
                            <NavLink
                                to={`${url}/patterns`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">Patterns ({profileVersion.patterns ? profileVersion.patterns.length : 0})</span>
                            </NavLink>
                        </li>
                        <li className={`usa-nav__primary-item `}>
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
                        {(isMember && profileVersion.harvestDatas && profileVersion.harvestDatas.length > 0) &&
                            <li className={`usa-nav__primary-item `}>
                                <NavLink
                                    to={`${url}/queue`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    <span className="text-bold">
                                        Import Queue ({
                                            profileVersion.harvestDatas.length
                                        })
                                    </span>
                                </NavLink>
                            </li>
                        }
                    </ul>
                </div>
            </nav>
        </header>

        <main id="main-content" className="grid-container padding-bottom-4">
            <Switch>
                <Route exact path={path}>
                    <ProfileDetails isMember={false} isCurrentVersion={isCurrentVersion} />
                </Route>
                <Route path={`${path}/templates`} >
                    <Templates isMember={false} isCurrentVersion={isCurrentVersion} isOrphan={true} />
                </Route>
                <Route path={`${path}/patterns`} >
                    <Patterns isMember={false} isCurrentVersion={isCurrentVersion} isOrphan={true} />
                </Route>
                <Route path={`${path}/concepts`} >
                    <Concepts isMember={false} isCurrentVersion={isCurrentVersion} isOrphan={true} />
                </Route>
                <Route>
                    <ErrorPage />
                </Route>
            </Switch>
        </main>
        </>
    );
  }
  