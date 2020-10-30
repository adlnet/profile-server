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
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as user_actions from "../../actions/user";

export default function AccountButton({controlIndex = 0 }) {
    let dispatch = useDispatch();
    function signOut() {
        dispatch(user_actions.logout())
    }

    useEffect(() => {
        dispatch(user_actions.checkStatus())
    }, [])

    let userData = useSelector((store) => store.userData);

    return (
        userData.user ? <>
            <button className="usa-accordion__button usa-nav__link" aria-expanded="false" aria-controls={`basic-nav-section-two-${controlIndex}`}>
                <span className="text-bold"><i className="fa fa-user margin-right-05"></i>{userData.user.fullname}</span>
            </button>
            <ul id={`basic-nav-section-two-${controlIndex}`} className="usa-nav__submenu" hidden>
                <li className="usa-nav__submenu-item">
                    <NavLink exact to="/user/account"
                        className="usa-link"
                    >
                        My Account
                </NavLink>
                </li>
                <li className="usa-nav__submenu-item">
                    <NavLink exact to="/"
                        className="usa-link"
                        onClick={() => signOut()}
                    >
                        Sign Out
                </NavLink>
                </li>
                <li className="usa-nav__submenu-item">
                    <NavLink exact to="/user/hooks"
                        className="usa-link"

                    >
                        WebHooks
                </NavLink>
                </li>
            </ul></> :
            <NavLink exact to="/user/login"
                className="usa-nav__link"
                activeClassName="usa-current"
            >
                <i className="fa fa-user margin-right-05"></i>
                <span className="text-bold">Sign in</span>
            </NavLink>
    )
}