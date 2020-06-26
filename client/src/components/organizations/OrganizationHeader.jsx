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
import { NavLink } from 'react-router-dom';

export default function OrganizationHeader({ organization, url, isMember }) {
    return (
        <header className={" usa-header usa-header--extended"}>
            <div className="usa-navbar bg-base-lightest margin-top-3 padding-y-2">
                <div className="usa-logo" id="extended-logo">
                    <em className="usa-logo__text"><a href="/" title="Home" aria-label="Home">{organization.name}</a></em>
                </div>
                <button className="usa-menu-btn">Menu</button>
            </div>
            <nav aria-label="Primary navigation" className="usa-nav">
                <div className="usa-nav__inner">
                    <button className="usa-nav__close"><i className="fa fa-close"></i></button>
                    <ul className="usa-nav__primary usa-accordion" style={{marginBottom: '-.15rem'}}>
                    <li className={`usa-nav__primary-item`}>
                            <NavLink to={`${url}/about`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">About</span>
                            </NavLink>

                        </li>
                        {isMember && (<>
                            <li className={`usa-nav__primary-item`}>
                                <NavLink 
                                    to={url}
                                    className="usa-nav__link"
                                    exact
                                    activeClassName="usa-current">
                                    <span className="text-bold">{`Profiles (${organization.profiles ? organization.profiles.length : '0'})`}</span>
                                </NavLink>

                            </li>
                            <li className={`usa-nav__primary-item`}>
                                <NavLink to={`${url}/members`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    <span className="text-bold">{`Members (${organization.members ? organization.members.length : '0'})`}</span>
                                </NavLink>

                            </li>
                            <li className={`usa-nav__primary-item`}>
                                <NavLink to={`${url}/apiKeys`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    <span className="text-bold">{`API Keys (${organization.apiKeys ? organization.apiKeys.length : '0'})`}</span>
                                </NavLink>
                            </li>
                        </>)}
                    </ul>
                    {!isMember &&  <div className="usa-nav__secondary">
                        <button className="usa-button usa-button--outline bg-white pull-right margin-right-0">
                            <i className="fa fa-users margin-right-05"></i>
                            Join Working Group
                        </button>
                    </div>}
                </div>
            </nav>
        </header>
    )
}
