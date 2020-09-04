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
import AccountButton from "../../components/users/AccountButton"
import { useSelector } from 'react-redux';
// usa-nav__primary-item>a:hover and [href]:focus cause the blue box
export default function TitleBanner() {
    let userData = useSelector((store) => store.userData);

    return (<>
        <div className="usa-overlay"></div>
        <header className="usa-header usa-header--extended" id="title-banner">
            <div className="usa-navbar">
                <div className="usa-logo" id="extended-logo">
                    <em className="usa-logo__text">
                        <a href="/" title="Home" aria-label="Home">xAPI Profile Server</a>
                    </em>
                </div>
                <button className="usa-menu-btn">Menu</button>
            </div>
            <nav aria-label="Primary navigation" className="usa-nav">
                <div className="usa-nav__inner">
                    <button className="usa-nav__close">
                        <i className="fa fa-close" role="img" alt="close"></i>
                    </button>
                    <ul className="usa-nav__primary usa-accordion">
                        <li className="usa-nav__primary-item">
                            <NavLink exact to="/profiles"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Profiles</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item">
                            <NavLink exact to="/"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Working Groups</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item">
                            <NavLink exact to="/api-info"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current">
                                <span className="text-bold">API Info</span>
                            </NavLink>
                        </li>
                        {userData && userData.user && userData.user.type === 'admin' &&
                            <li className="usa-nav__primary-item">
                                <button className="usa-accordion__button usa-nav__link" aria-expanded="false" aria-controls="basic-nav-section-two">
                                    <span className="text-bold">Admin</span>
                                </button>
                                <ul id="basic-nav-section-two" className="usa-nav__submenu" hidden>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/"
                                            className="usa-link"
                                        >
                                            Manage Users
                                        </NavLink>
                                    </li>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/"
                                            className="usa-link"
                                        >
                                            Verify Profiles
                                        </NavLink>
                                    </li>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/"
                                            className="usa-link"
                                        >
                                            Analytics
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        }
                        <li className="usa-nav__primary-item" style={{ marginLeft: 'auto' }}>
                            <AccountButton></AccountButton>
                        </li>
                    </ul>
                    <div className="usa-nav__secondary">
                        <form className="usa-search usa-search--small " role="search" style={{ display: 'flex' }}>
                            <label className="usa-sr-only" htmlFor="extended-search-field-small">Search small</label>
                            <input className="usa-input" id="extended-search-field-small" type="search" name="search" />
                            <button className="usa-button" type="submit"><span className="usa-sr-only">Search</span></button>
                        </form>
                    </div>
                </div>
            </nav>
        </header>
    </>);

}
