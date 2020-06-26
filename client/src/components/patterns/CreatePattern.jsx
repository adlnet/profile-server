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
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import PatternTypes from './PatternTypes';
import CreateSequencePattern from './CreateSequencePattern';
import CreateAlternatesPattern from './CreateAlternatesPattern';
import CreateSinglePattern from './CreateSinglePattern';
import { createPattern } from '../../actions/patterns';

export default function CreatePattern() {
    const dispatch = useDispatch();
    let { path } = useRouteMatch();

    let [type, updateType] = useState();

    function handleCreatePattern(values) {
        dispatch(createPattern(values));
    }


    return (
        <div className="grid-container">
            <div className="grid-row margin-top-3">
                <div className="grid-col">
                    <h2>Create New Pattern{type ? (<><span>: </span><span className="text-primary-dark" style={{ textTransform: "capitalize" }}>{type}</span></>) : ""}</h2>
                </div>
            </div>
            <Switch>
                <Route path={`${path}/sequence`}>
                    <CreateSequencePattern updateType={updateType} type={type} onSubmit={handleCreatePattern}/>
                </Route>
                <Route exact path={`${path}/alternates`}>
                    <CreateAlternatesPattern updateType={updateType} type={type} onSubmit={handleCreatePattern}/>
                </Route>
                <Route exact path={`${path}/optional`}>
                    <CreateSinglePattern updateType={() => updateType("optional")} type={type} onSubmit={handleCreatePattern}/>
                </Route>
                <Route exact path={`${path}/oneOrMore`}>
                    <CreateSinglePattern updateType={() => updateType("oneOrMore")} type={type} onSubmit={handleCreatePattern}/>
                </Route>
                <Route exact path={`${path}/zeroOrMore`}>
                    <CreateSinglePattern updateType={() => updateType("zeroOrMore")} type={type} onSubmit={handleCreatePattern}/>
                </Route>
                <Route exact path="">
                    <PatternTypes />
                </Route>
                <Redirect from="/" to="" />
            </Switch>
        </div>
    );
}

