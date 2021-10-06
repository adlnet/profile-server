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
import { Switch, Route, useRouteMatch, Redirect, Link, useHistory, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import PatternTypes from './PatternTypes';
import CreateSequencePattern from './CreateSequencePattern';
import CreateAlternatesPattern from './CreateAlternatesPattern';
import CreateSinglePattern from './CreateSinglePattern';
import { createPattern } from '../../actions/patterns';
import Breadcrumb from '../controls/breadcrumbs';

export default function CreatePattern(props) {
    const history = useHistory();
    const location = useLocation(); 
    const dispatch = useDispatch();
    let { path } = useRouteMatch();

    let [type, updateType] = useState();
    let importedPattern = location.state && location.state.pattern ? {...location.state.pattern} : null;

    async function handleCreatePattern(values) { 
        await dispatch(createPattern(values));

        if(importedPattern){
            dispatch({type:'REMOVE_IMPORT_QUEUE_ITEM', payload:{type:'patterns', index: importedPattern.index}});
        }

        history.push(props.root_url);
    }    

    return (
        <div className="">
            <div className="grid-row margin-top-3">
                <div className="grid-col">
                    <Breadcrumb breadcrumbs={[{ to: props.root_url, crumb: 'patterns' }]} />
                    <h2 style={{ marginTop: '.5em' }}>Create New Pattern{type ? (<><span>: </span><span className="text-primary-dark" style={{ textTransform: "capitalize" }}>{type}</span></>) : ""}</h2>
                </div>
            </div>
            <Switch>
                <Route path={`${path}/sequence`}>
                    <CreateSequencePattern importedPattern={importedPattern} updateType={updateType} type={type} onSubmit={handleCreatePattern} {...props} />
                </Route>
                <Route exact path={`${path}/alternates`}>
                    <CreateAlternatesPattern importedPattern={importedPattern} updateType={updateType} type={type} onSubmit={handleCreatePattern} {...props} />
                </Route>
                <Route exact path={`${path}/optional`}>
                    <CreateSinglePattern importedPattern={importedPattern} updateType={() => updateType("optional")} type={type} onSubmit={handleCreatePattern} {...props} />
                </Route>
                <Route exact path={`${path}/oneOrMore`}>
                    <CreateSinglePattern importedPattern={importedPattern} updateType={() => updateType("oneOrMore")} type={type} onSubmit={handleCreatePattern} {...props} />
                </Route>
                <Route exact path={`${path}/zeroOrMore`}>
                    <CreateSinglePattern importedPattern={importedPattern} updateType={() => updateType("zeroOrMore")} type={type} onSubmit={handleCreatePattern} {...props} />
                </Route>
                <Route exact path="">
                    <PatternTypes />
                </Route>
                <Redirect from="/" to="" />
            </Switch>
        </div>
    );
}

