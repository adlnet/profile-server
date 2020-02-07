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

import React, {useState} from 'react';
import { useRouteMatch,  } from 'react-router-dom';
import {editConcept} from "../../actions/concepts";
import { Detail, Translations,  } from '../DetailComponents';
import { useSelector, useDispatch,  } from 'react-redux';

import ConceptTypeDetailExtension from "./ConceptTypeDetailExtension";
import CreateConceptForm from './CreateConceptForm';


export default function ConceptDetail() {
   
    const {  params } = useRouteMatch();
    
    const concepts = useSelector( (state) => state.concepts)
    let concept = concepts.filter( i=> i.uuid == params.conceptId)[0]
    let dispatch = useDispatch();

    let [editing, setEditing] = useState();

    function edited(newConcept)
    {
        setEditing(false);
        dispatch(editConcept(Object.assign({},concept,newConcept)));
    }
    if(!concept) return "Concepts not populated";
    
    if(editing)
    {
        return <>
        <CreateConceptForm initialValue={concept} onCancel={()=>setEditing(false)}  onCreated={(e)=>edited(e)}> </CreateConceptForm>
        </>
    }
    else return (
        <>
            <div className="grid-row">
                <div className="desktop:grid-col">
                    <h2>{concept.name}</h2>
                </div>
                <div className="desktop:grid-col-3">
    {concept.parentProfile.uuid == params.profileId && <button onClick={()=>setEditing(true)} className="usa-button margin-2 float-right">Edit Concept</button> }
                </div>
            </div>
            <div className="grid-row">
                <div className="desktop:grid-col-8">
                    <Detail title="iri">
                        {concept.iri}
                    </Detail>
                    <Detail title="content type">
                        {concept.type}
                    </Detail>
                    <Detail title="description">
                        {concept.description}
                    </Detail>
                    <Detail title="translations">
                        <Translations translations={concept.translations} />
                    </Detail>
                    <Detail title="more information">
                        {concept.moreInformation}
                    </Detail>
                    <ConceptTypeDetailExtension {...concept} />
                </div>
                <div className="desktop:grid-col-3 grid-offset-1">
                    <div className="padding-2 bg-base-lightest">
                        <Detail title="updated">
                            {concept.updatedOn}
                        </Detail>
                        <Detail title="parent profile">
                            {concept.parentProfile.name}
                        </Detail>
                        <Detail title="author">
                            {concept.author || "Unknown"}
                        </Detail>
                    </div>
                </div>
            </div>
        </>
    );
}