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
import { NavLink, useRouteMatch } from 'react-router-dom';

export default function SideNav() {
    const { url } = useRouteMatch();
    return (
        <div className="usa-layout-docs__sidenav desktop:grid-col-3">
            <nav aria-label="Secondary navigation" className="pin-left pin-y position-sticky">
                <ul className="usa-sidenav">
                    <li className="usa-sidenav__item">
                        <NavLink
                            to={`${url}`}
                            exact
                            className="usa-nav__link"
                            activeClassName="usa-current">
                            Getting Started
                        </NavLink>
                    </li>
                    <li className="usa-sidenav__item">
                        <NavLink
                            to={`${url}/get/single`}
                            className="usa-nav__link"
                            activeClassName="usa-current">
                            Get Profile
                        </NavLink>
                        <ul className="usa-sidenav__sublist">
                            <li className="usa-sidenav__item">
                                <NavLink
                                    to={`${url}/get/single`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    Get a Profile
                                </NavLink>
                            </li>
                            <li className="usa-sidenav__item">
                                <NavLink
                                    to={`${url}/get/by-iri`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    Get a Profile by IRI
                                </NavLink>
                            </li>
                            <li className="usa-sidenav__item">
                                <NavLink
                                    to={`${url}/get/many`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    Get Profiles
                                </NavLink>
                            </li>
                        </ul>
                    </li>
                    <li className="usa-sidenav__item">
                        <NavLink
                            to={`${url}/validate`}
                            className="usa-nav__link"
                            activeClassName="usa-current">
                            Validate Profile
                        </NavLink>
                    </li>
                    <li className="usa-sidenav__item">
                        <NavLink
                            to={`${url}/post`}
                            className="usa-nav__link"
                            activeClassName="usa-current">
                            Import/Create Profile
                        </NavLink>
                    </li>
                    <li className="usa-sidenav__item">
                        <NavLink
                            to={`${url}/put`}
                            className="usa-nav__link"
                            activeClassName="usa-current">
                            Edit Profile
                        </NavLink>
                    </li>
                    <li className="usa-sidenav__item">
                        <NavLink
                            to={`${url}/metadata`}
                            className="usa-nav__link"
                            activeClassName="usa-current">
                            Get Profile Metadata
                        </NavLink>
                    </li>
                    <li className="usa-sidenav__item">
                        <NavLink
                            to={`${url}/status`}
                            className="usa-nav__link"
                            activeClassName="usa-current">
                            Update Profile Status
                        </NavLink>
                    </li>
                    <li className="usa-sidenav__item">
                        <NavLink
                            to={`${url}/delete`}
                            className="usa-nav__link"
                            activeClassName="usa-current">
                            Delete Draft Profile
                        </NavLink>
                    </li>
                    <li className="usa-sidenav__item">
                        <NavLink
                            to={`${url}/sparql`}
                            className="usa-nav__link"
                            activeClassName="usa-current">
                            SPARQL
                        </NavLink>
                    </li>
                </ul>
            </nav>

        </div>
    )
}