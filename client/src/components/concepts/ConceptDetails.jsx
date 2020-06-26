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
import React, { useState, useEffect } from 'react';
import { useRouteMatch, useParams, Switch, Route, Link, useHistory } from 'react-router-dom';
import { editConcept, selectConcept } from "../../actions/concepts";
import { Detail, Translations, } from '../DetailComponents';
import { useSelector, useDispatch, } from 'react-redux';
import API from '../../api';
import Lock from "../../components/users/lock";
import ConceptTypeDetailExtension from "./ConceptTypeDetailExtension";
import EditConcept from './EditConcept';


export default function ConceptDetail() {

    const { url, path } = useRouteMatch();
    const dispatch = useDispatch();
    const history = useHistory();
    const { organizationId, profileId, versionId, conceptId } = useParams();

    const {selectedOrganizationId, selectedProfileId,
        selectedProfileVersionId} = useSelector((state) => state.application);

    useEffect(() => {
        dispatch(selectConcept(organizationId, profileId, versionId, conceptId));
    }, [organizationId, profileId, versionId, conceptId]);

    const concept = useSelector((state) => state.application.selectedConcept);

    function handleEditConcept(editedConcept) {
        dispatch(editConcept(Object.assign({}, concept, editedConcept)));
        history.push(url);
    }

    if (!concept) return '';

    const belongsToAnotherProfile = concept.parentProfile.parentProfile.uuid !== profileId;
    
    return (<>
        <Switch>
            <Route path={`${path}/edit`}>
                <Lock resourceUrl={`/org/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/concept/${concept.uuid}`}>
                <EditConcept
                    initialValues={concept}
                    onCreate={handleEditConcept}
                    onCancel={() => history.push(url)}
                />
                </Lock>
            </Route>

            <Route exact path={path}>
                <>
                    {
                        belongsToAnotherProfile &&
                            <div className="usa-alert usa-alert--info padding-2 margin-top-2" >
                                <div className="usa-alert__body">
                                    <p className="usa-alert__text">
                                        This concept belongs to {concept.parentProfile.name}.
                                    </p>
                                </div>
                            </div>
                    }
                    <div className="grid-row">
                        <div className="desktop:grid-col-8">
                            <h2>{concept.name}</h2>
                            <Detail title="iri">
                                {concept.iri}
                            </Detail>
                            <Detail title="concept name">
                                {concept.name}
                            </Detail>
                            <Detail title="concept type">
                                {concept.conceptType}
                            </Detail>
                            <Detail title="description">
                                {concept.description}
                            </Detail>
                            <Detail title="translations">
                                <Translations translations={concept.translations} linkable={true} />
                            </Detail>
                            <ConceptTypeDetailExtension
                                concept={concept}
                                translationLinks={true}
                                similarTermsLinks={true}
                                recommendedTermsLinks={true}
                            />
                        </div>
                        <div className="desktop:grid-col-4 display-flex flex-column flex-align-end">
                            {
                                !belongsToAnotherProfile &&
                                    <Link
                                            to={`${url}/edit/${concept.conceptType}`}
                                            className="usa-button padding-x-105 margin-top-2 margin-right-0 "
                                    >
                                        <span className="fa fa-pencil fa-lg margin-right-1"></span>
                                        Edit Concept
                                    </Link>
                            }
                            <div className="details-metadata-box margin-top-2 width-full">
                                <Detail title="updated">
                                    {(concept.updatedOn) ? (new Date(concept.updatedOn)).toLocaleDateString() : "Unknown"}
                                </Detail>
                                <Detail title="parent profile">
                                    {concept.parentProfile.name}
                                </Detail>
                                <Detail title="author">
                                    {concept.parentProfile.organization.name}
                                </Detail>
                            </div>
                        </div>
                    </div>
                </>
            </Route>
        </Switch>
    </>);
}