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
import React, { useState } from 'react';
import { Switch, Route, useRouteMatch, Link, Redirect } from 'react-router-dom';

import PatternTypes from './PatternTypes';
import CreateSequencePattern from './CreateSequencePattern';
import CreateAlternatesPattern from './CreateAlternatesPattern';
import CreateOptionalPattern from './CreateOptionalPattern';
import CreateOneOrMorePattern from './CreateOneOrMorePattern';
import CreateZeroOrMorePattern from './CreateZeroOrMorePattern';

export default function CreatePattern(props) {
    // const dispatch = useDispatch();
    let { path } = useRouteMatch();

    let [type, updateType] = useState();
    // let [form, updateForm] = useState();


    return (
        <div className="grid-container">
            <div className="grid-row margin-top-3">
                <div className="grid-col">
                    <Link to={props.root_url}><span className="text-uppercase font-sans-3xs">patterns</span></Link> <i className="fa fa-angle-right fa-xs"></i>
                    <h2>Create New Pattern{type ? (<><span>: </span><span className="text-primary-dark" style={{ textTransform: "capitalize" }}>{type}</span></>) : ""}</h2>
                </div>
            </div>
            <Switch>
                <Route path={`${path}/sequence`}>
                    <CreateSequencePattern updateType={updateType} />
                </Route>
                <Route exact path={`${path}/alternate`}>
                    <CreateAlternatesPattern updateType={updateType} />
                </Route>
                <Route exact path={`${path}/optional`}>
                    <CreateOptionalPattern updateType={updateType} />
                </Route>
                <Route exact path={`${path}/oneormore`}>
                    <CreateOneOrMorePattern updateType={updateType} />
                </Route>
                <Route exact path={`${path}/zeroormore`}>
                    <CreateZeroOrMorePattern updateType={updateType} />
                </Route>
                <Route exact path="">
                    <PatternTypes />
                </Route>
                <Redirect from="/" to="" />
            </Switch>
        </div>
    );
}

