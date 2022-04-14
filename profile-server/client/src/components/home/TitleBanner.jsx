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
import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import AccountButton from "../../components/users/AccountButton"
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { loadProfileRootIRI } from '../../actions/profiles';
import API from '../../api';

// usa-nav__primary-item>a:hover and [href]:focus cause the blue box
export default function TitleBanner() {
    const dispatch = useDispatch();
    let userData = useSelector((store) => store.userData);
    let history = useHistory();
    let [searchString, setSearchString] = useState();
    let [orphanProfile, setOrphanProfile] = useState({});

    useEffect(() => {
        dispatch(loadProfileRootIRI())

        API.getOrphanContainerProfile().then((res) => {
            setOrphanProfile(res);
        });
    }, [])
    function search(e) {
        history.push({ pathname: "/search", state: { search: searchString } });
        e.preventDefault();
        setSearchString("");
        return false;
    }

    function getNavlinkForDeletedTab() {
        let path = "/deleted-items/organization/"+orphanProfile.organizationUuid+"/profile/"+orphanProfile.uuid+"/version/"+orphanProfile.currentPublishedVersionUuid;
        return path;
    }
    

    return (<>
        <div className="usa-overlay"></div>
        <header className="usa-header usa-header--extended" id="title-banner">
            <div className="usa-navbar">
                <div className="usa-logo" id="extended-logo">
                    <em className="usa-logo__text">
                        <a href="/" title="Home" aria-label="Home" style={{ color: "white" }}>xAPI Profile Server</a>
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
                            <NavLink to="/"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Home</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item">
                            <NavLink to="/profiles"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Profiles</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item">
                            <NavLink to="/organization"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Working Groups</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item">
                            <NavLink to="/api-info"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current">
                                <span className="text-bold">API Info</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item">
                            <NavLink to="/help"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current">
                                <span className="text-bold">Getting Started</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item">
                            <NavLink to="/FAQs"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current">
                                <span className="text-bold">FAQs</span>
                            </NavLink>
                        </li>
                        {userData && userData.user &&
                        <li className="usa-nav__primary-item">
                            <NavLink to={getNavlinkForDeletedTab()}
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current">
                                <span className="text-bold">Deleted Items</span>
                            </NavLink>
                        </li>
                        }
                        {userData && userData.user && userData.user.type === 'admin' &&
                            <li className="usa-nav__primary-item">
                                <button className="usa-accordion__button usa-nav__link" aria-expanded="false" aria-controls="basic-nav-section-admin">
                                    <span className="text-bold">Admin</span>
                                </button>
                                <ul id="basic-nav-section-admin" className="usa-nav__submenu" hidden>
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
                        <li className="usa-nav__primary-item" style={{ marginLeft: 'auto' }}>
                            <AccountButton></AccountButton>
                        </li>
                    </ul>
                    <div className="usa-nav__secondary">
                        <form className="usa-search usa-search--small " onSubmit={search} role="search" style={{ display: 'flex' }}>
                            <label className="usa-sr-only" htmlFor="extended-search-field-small">Search small</label>
                            <input className="usa-input" id="extended-search-field-small" value={searchString} onChange={e => setSearchString(e.target.value)} type="search" name="search" placeholder='Search for existing content'/>
                            <button id="site-search" className="usa-button" type="submit"><span className="usa-sr-only">Search</span></button>
                        </form>
                    </div>
                </div>
            </nav>
        </header>
    </>);

}
