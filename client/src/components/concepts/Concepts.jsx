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
import { useRouteMatch, Route, Switch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import CreateConceptForm from "./CreateConceptForm";
import { createConcept, addSelectedConceptsToProfile } from "../../actions/concepts";
import EditableConceptTable from "./EditableConceptTable"
import ConceptDetail from "./ConceptDetails"
import AddConcepts from "./AddConcepts"

export default function Concepts() {
    const { path, url } = useRouteMatch();

    const concepts = useSelector((state) => state.concepts)
    const dispatch = useDispatch();

    return (
        <div>
            <Switch>
                <Route exact path={path}>
                    <EditableConceptTable addConceptLinkPath={url + "/add"} concepts={concepts} url={`${url}`} />
                </Route>
                <Route exact path={`${path}/create`}>
                    <CreateConceptForm onCreated={(concept) => dispatch(createConcept(concept))}></CreateConceptForm>
                </Route>
                <Route exact path={`${path}/add`}>
                    <AddConcepts createUrl={`${url}/create`} addToName="Profile" onAdd={() => dispatch(addSelectedConceptsToProfile())}></AddConcepts>
                </Route>
                <Route exact path={`${path}/:conceptId`}>
                    <ConceptDetail />
                </Route>

            </Switch>
        </div>
    );
}   