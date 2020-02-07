/** ***********************************************************************
*
* Veracity Technology Consultants
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AddPattern from './AddPattern';
import CreatePattern from './CreatePattern';
import PatternTable from './PatternTable';
import PatternDetail from './PatternDetail';

// this is very similar to statement template page
export function Patterns(props) {
    let patterns = useSelector((state) => state.patterns);
    let { path, url } = useRouteMatch();

    return (
        <Switch>
            <Route exact path={path}>
                <PatternTable {...props} root_url={url} patterns={patterns} />
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
