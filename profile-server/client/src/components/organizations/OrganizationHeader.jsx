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
import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import AccountButton from "../../components/users/AccountButton"

export default function OrganizationHeader({ organization, url, isMember, user, joinAction }) {
    let [searchString, setSearchString] = useState();
    let history = useHistory();

    const userData = useSelector((state) => state.userData);
    const dispatch = useDispatch();

    function search(e) {
        history.push({ pathname: "/search", state: { search: searchString } });
        e.preventDefault();
        setSearchString("");
        return false;
    }

    const profilecount = (profiles) => {
        if (!profiles) return "0";
        if (isMember) return profiles.length;
        return profiles.reduce((count, profile) => {
            if (profile.currentPublishedVersion) return count + 1;
            return count;
        }, 0);
    }

    return (
        <header className={" usa-header usa-header--extended"}>
            <div className="usa-navbar bg-base-lightest margin-top-5 padding-y-2">
                <div className="usa-logo" id="extended-logo">
                    <em className="usa-logo__text"><a href={`${url}/about`} title="Home" aria-label="Home">{organization.name}</a></em>
                </div>
                {/* <button className="usa-menu-btn">Menu</button> */}
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
                            <AccountButton controlIndex={1001}></AccountButton>
                        </li>
                        <li className={`usa-nav__primary-item`}>
                            <NavLink to={`${url}/about`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">About</span>
                            </NavLink>

                        </li>
                        <li className={`usa-nav__primary-item`}>
                            <NavLink
                                to={url}
                                className="usa-nav__link"
                                exact
                                activeClassName="usa-current">
                                <span className="text-bold">{`Profiles (${profilecount(organization.profiles)})`}</span>
                            </NavLink>

                        </li>
                        {isMember && (<>
                            <li className={`usa-nav__primary-item`}>
                                <NavLink to={`${url}/members`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    <span className="text-bold">{`Members (${organization.members ? organization.members.length : organization.memberCount ? organization.memberCount : '0'})`}</span>
                                </NavLink>

                            </li>
                            {isMember === 'admin' &&
                                <li className={`usa-nav__primary-item`}>
                                    <NavLink to={`${url}/apiKeys`}
                                        className="usa-nav__link"
                                        activeClassName="usa-current">
                                        <span className="text-bold">{`API Keys (${organization.apiKeys ? organization.apiKeys.length : '0'})`}</span>
                                    </NavLink>
                                </li>
                            }
                        </>)}
                        <div className="usa-nav__secondary main-menu-show">
                            <form className="usa-search usa-search--small " onSubmit={search} role="search" style={{ display: 'flex' }}>
                                <label className="usa-sr-only" htmlFor="extended-search-field-small">Search small</label>
                                <input className="usa-input" id="extended-search-field-small" value={searchString} onChange={e => setSearchString(e.target.value)} type="search" name="search" />
                                <button id="site-search" className="usa-button" type="submit" style={{backgroundColor: '#005ea2'}}><span className="usa-sr-only">Search</span></button>
                            </form>
                        </div>
                    </ul>
                    {!isMember && user && <div className="usa-nav__secondary">
                        <button className="usa-button usa-button--outline bg-white pull-right margin-right-0"
                            onClick={() => {
                                joinAction(organization, user)
                            }}>
                            <i className="fa fa-users margin-right-05"></i>
                            Join Working Group
                        </button>
                    </div>}
                </div>
            </nav>
        </header>
    )
}
