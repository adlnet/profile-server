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
// usa-nav__primary-item>a:hover and [href]:focus cause the blue box
export default function TitleBanner() {

    return (<>
        <div className="usa-overlay"></div>
        <header className="usa-header usa-header--basic border-bottom border-base-lighter margin-bottom-4">
            <div className="usa-nav-container" style={{marginBottom: '-.05rem'}}>
                <div className="usa-navbar">
                    <div className="usa-logo" id="basic-logo">
                        <em className="usa-logo__text">
                            <a href="/" title="Home" aria-label="Home">ADL xAPI Profile Server</a>
                        </em>
                    </div>
                    <button className="usa-menu-btn">Menu</button>
                </div>
                <nav aria-label="Primary navigation" className="usa-nav">
                    <button className="usa-nav__close"><i className="fa fa-close"></i></button>
                    <ul className="usa-nav__primary usa-accordion">
                        <li className="usa-nav__primary-item">
                            <NavLink exact to="/search"
                                    className="usa-nav__link "
                                    activeClassName="usa-current"
                            >
                                <span className="fa fa-search"></span><span className="text-bold">Search</span>
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
                        <li className="usa-nav__primary-item">
                            <AccountButton></AccountButton>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    </>);
    }
