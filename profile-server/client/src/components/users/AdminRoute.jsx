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
import { Route, Redirect, } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute({ component, ...rest }) {
    let userData = useSelector((store) => store.userData);
    let children = rest.children;
    rest.children = null;
    if (component)
        rest.children = [
            (props) => (

                <component {...props} />

            )
        ]
    if (userData.user && userData.user.type === "admin")
        return <Route {...rest} render={() => children} />
    else
        return "";
        
}

