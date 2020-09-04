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
import React, { useEffect, useState } from 'react';
import { Switch, Route, NavLink, matchPath, useRouteMatch } from 'react-router-dom';
import Login from "../components/users/Login";
import Create from "../components/users/Create";

import NotLoggedInRoute from "../components/users/NotLoggedInRoute";
export default function Users(props) {
    const match = useRouteMatch();

    return <main id="main-content" className="grid-container  padding-bottom-4">
        <Switch>
            <NotLoggedInRoute path={`${match.path}/login`} {...props}>
                <Login></Login>
            </NotLoggedInRoute>
            <NotLoggedInRoute path={`${match.path}/create`} {...props}>
                <Create></Create>
            </NotLoggedInRoute>
        </Switch>
    </main>
}