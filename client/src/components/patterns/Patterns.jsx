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
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import AddPattern from './AddPattern';
import CreatePattern from './CreatePattern';
import PatternTable from './PatternTable';
import PatternDetail from './PatternDetail';

// this is very similar to statement template page
export function Patterns(props) {
    let { path, url } = useRouteMatch();

    return (
        <Switch>
            <Route exact path={path}>
                <PatternTable {...props} root_url={url} />
            </Route>
            <Route exact path={`${path}/add`}>
                <AddPattern {...props} root_url={url} />
            </Route>
            <Route path={`${path}/create`}>
                <CreatePattern {...props} root_url={url} />
            </Route>
            <Route exact path={`${path}/:id`}>
                <PatternDetail {...props} />
            </Route>
        </Switch>
    );
}
