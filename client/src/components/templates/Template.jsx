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
import React, { useEffect } from 'react';
import { useRouteMatch, Switch, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import TemplateDetail from "./TemplateDetail";
import EditTemplateDetails from './EditTemplateDetails';
import  ConceptTable  from '../concepts/ConceptTable';
import { selectTemplate } from "../../actions/templates";
import { createConceptInTemplate } from "../../actions/concepts";
import TemplateConceptDetail from "./TemplateConceptDetail";
import CreateConceptForm from "../concepts/CreateConceptForm";
import AddConcepts from "../concepts/AddConcepts";
import {addSelectedConceptsToTemplate} from "../../actions/concepts";
import RuleTable from '../rules/RuleTable';
import DeterminingPropertyTable from '../determining-properties/DeterminingPropertyTable';

export default function Template() {
    let match = useRouteMatch();

    let { url, path } = match;
    
    let dispatch = useDispatch();
    let template = useSelector((state) => state.application.selectedTemplate)
    let allConcepts = useSelector((state)=>state.concepts);
    
    useEffect(() => { 
        dispatch(selectTemplate(match.params.templateId)) }, 
        [dispatch, match.params.templateId]
    );
    
    if (!template) return "Template not populated";
    
    let concepts = [];
    
    for(let i of template.concepts)
    {
        for(let j of allConcepts)
        {
            if(j.uuid === i)
                concepts.push(j);
        }
    }

    return (
        <div>
            <div><h2>{template.name}</h2></div>
            <Switch>
                <Route exact path={path + "/concepts/add"}>
                    <AddConcepts addToName="Template" onAdd={(concepts) => dispatch(addSelectedConceptsToTemplate(concepts))} createUrl={url + "/concepts/create"} ></AddConcepts>
                    
                </Route>
                <Route exact path={path+ "/concepts/create"}>
                    <CreateConceptForm onCreated={(concept)=>dispatch(createConceptInTemplate(concept))}></CreateConceptForm>
                </Route>
                <Route exact path={path+ "/concepts/:conceptId"}>
                    <TemplateConceptDetail > </TemplateConceptDetail>
                </Route>
                <Route path={path}>
                    <div className="usa-alert usa-alert--info padding-2 margin-top-2" >
                        <div className="usa-alert__body">
                            <p className="usa-alert__text">
                                This statement template belongs to {template.parentProfileName}.
                    </p>
                        </div>
                    </div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="true"
                                aria-controls="a1"
                            >
                                Statement Template Details
                            </button>
                        </h2>
                        <div id="a1" className="usa-accordion__content">
                            <Switch>
                                <Route exact path={path}>
                                    <TemplateDetail />
                                </Route>
                                <Route exact path={`${path}/edit`}>
                                    <EditTemplateDetails 
                                        initialValues={template}
                                    />
                                </Route>
                            </Switch>
                        </div>
                    </div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="true"
                                aria-controls="a2"
                            >
                                Concepts ({template.concepts.length})
                    </button>
                        </h2>
                        <div id="a2" className="usa-accordion__content usa-prose">
                            <ConceptTable inTemplate={true} addConceptLinkPath={url+"/concepts/add"} concepts={concepts} url={`${url}/concepts`} />
                        </div>
                    </div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="true"
                                aria-controls="a3"
                            >
                                Determining Properties (0)
                    </button>
                        </h2>
                        <div id="a3" className="usa-accordion__content usa-prose">
                            <DeterminingPropertyTable />
                        </div>
                    </div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="true"
                                aria-controls="a4"
                            >
                                Rules (0)
                    </button>
                        </h2>
                        <div id="a4" className="usa-accordion__content usa-prose">
                            <RuleTable rules={template.rules} />
                        </div>
                    </div>
                    <div className="usa-accordion usa-accordion--bordered margin-top-2">
                        <h2 className="usa-accordion__heading">
                            <button className="usa-accordion__button"
                                aria-expanded="true"
                                aria-controls="a5"
                            >
                                Statement Example
                    </button>
                        </h2>
                        <div id="a5" className="usa-accordion__content usa-prose">
                            {template.statementExample}
                        </div>
                    </div>
                </Route>
            </Switch>
        </div>
    );
}
