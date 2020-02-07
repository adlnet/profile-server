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
import { useRouteMatch,  Route, Switch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import CreateConceptForm from "./CreateConceptForm";
import {createConcept, addSelectedConceptsToProfile} from "../../actions/concepts";
import EditableConceptTable from "./EditableConceptTable"
import ConceptDetail from "./ConceptDetails"
import AddConcepts from "./AddConcepts"

export default function Concepts() {
    const { path, url } = useRouteMatch();
    
    const concepts = useSelector( (state) => state.concepts)
    const dispatch = useDispatch();
    
    return (
        <div>
            <Switch>
                <Route exact path={path}>
                    <EditableConceptTable addConceptLinkPath={url+"/add"} concepts={concepts} url={`${url}`} />
                </Route>
                <Route exact path={`${path}/create`}>
                    <CreateConceptForm onCreated={(concept)=>dispatch(createConcept(concept))}></CreateConceptForm>
                </Route>
                <Route exact path={`${path}/add`}>
                    <AddConcepts createUrl={`${url}/create`} addToName="Profile" onAdd={()=>dispatch(addSelectedConceptsToProfile())}></AddConcepts>
                </Route>
                <Route exact path={`${path}/:conceptId`}>
                    <ConceptDetail  />
                </Route>
                
            </Switch>
        </div>
    );
}   