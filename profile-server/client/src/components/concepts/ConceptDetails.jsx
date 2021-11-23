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
import React, { useEffect } from 'react';
import { useRouteMatch, useParams, Switch, Route, Link, useHistory, Redirect } from 'react-router-dom';
import { editConcept, loadProfileConcepts, selectConcept, removeConceptLink, deleteConcept, claimConcept } from "../../actions/concepts";
import { Detail, Translations, } from '../DetailComponents';
import { useSelector, useDispatch, } from 'react-redux';
import Lock from "../../components/users/lock";
import ConceptTypeDetailExtension from "./ConceptTypeDetailExtension";
import EditConcept from './EditConcept';
import { useState } from 'react';
import ModalBoxWithoutClose from '../controls/modalBoxWithoutClose';
import { reloadCurrentProfile } from '../../actions/profiles';
import Breadcrumb from '../controls/breadcrumbs';
import DeprecatedAlert from '../controls/deprecatedAlert';
import { DEPRECATED } from '../../actions/successAlert';
import ClaimButton from '../controls/ClaimButton';


export default function ConceptDetail({ isMember, isCurrentVersion, breadcrumbs, isOrphan }) {
    const { url, path } = useRouteMatch();
    const params = useParams();
    const dispatch = useDispatch();
    const history = useHistory();
    const [isEditing, setIsEditing] = useState(false);
    const { organizationId, profileId, versionId, conceptId } = useParams();
    const [showModal, setShowModal] = useState(false);

    const isPublicView = !params.organizationId;

    const { selectedOrganizationId, selectedProfileId,
        selectedProfileVersionId } = useSelector((state) => state.application);

    const selectedProfileVersion = useSelector(state => state.application.selectedProfileVersion);

    useEffect(() => {
        dispatch(selectConcept(organizationId, profileId, versionId, conceptId));
    }, [organizationId, profileId, versionId, conceptId]);

    const concept = useSelector((state) => state.application.selectedConcept);

    async function handleEditConcept(editedConcept, actualAction) {
        await dispatch(editConcept(Object.assign({}, concept, editedConcept), actualAction));
        history.push(url);
    }

    function onDeprecate(reasonInfo) {
        handleEditConcept({ isDeprecated: true, deprecatedReason: reasonInfo }, DEPRECATED);
    }

    async function handleDeleteConcept() {
        await dispatch(deleteConcept(params.organizationId, profileId, versionId, concept));
        history.push(`/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}`);
    }

    function onDelete() {
        handleDeleteConcept();
    }

    async function onClaimConcept(profile, targetOrganizationId) {
        await dispatch(claimConcept(targetOrganizationId, profile._id, versionId, conceptId));
        history.push(`/deleted-items/organization/${targetOrganizationId}/profile/${profile.uuid}/version/${selectedProfileVersionId}`);
    }

    if (!concept) return '';

    const renderBreadcrumbs = () => {
        if (breadcrumbs) {
            return <Breadcrumb breadcrumbs={breadcrumbs} />
        }

        const conceptsBreadcrumbURL = isPublicView ? `/profile/${selectedProfileId}/concepts` : `/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/concepts`;
        return <Breadcrumb breadcrumbs={[{ to: conceptsBreadcrumbURL, crumb: 'concepts' }]} />;
    }


    const removeLink = async () => {
        await dispatch(removeConceptLink(organizationId, profileId, versionId, conceptId))

        await dispatch(loadProfileConcepts(selectedProfileVersionId));

        await dispatch(reloadCurrentProfile());

        setShowModal(false);
        if (breadcrumbs) {
            history.push(breadcrumbs[breadcrumbs.length - 1].to);
        }
        history.push(`/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/concepts`);
    }

    const belongsToAnotherProfile = !(selectedProfileVersion.concepts && selectedProfileVersion.concepts.includes(concept._id));
    const isEditable = isMember && isCurrentVersion && !concept.isDeprecated;
    const isPublished = concept.parentProfile.state !== 'draft';

    return (<>
        <div className="grid-row border-bottom-2px border-base-lighter display-flex flex-row " style={{ marginTop: '2em' }}>

            <div className="grid-col padding-bottom-2">
                {renderBreadcrumbs()}
                <h2 style={{ marginBottom: 0, marginTop: '.5em', textTransform: "capitalize" }}><span style={{ fontWeight: 'lighter' }}>{concept.conceptType}:</span> <span className="text-primary-dark">{concept.name}</span></h2>
            </div>
            <div className="grid-col display-flex flex-column flex-align-end">
                {
                    !belongsToAnotherProfile && isEditable && !isEditing &&
                    <Link
                        to={`/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/concepts/${concept.uuid}/edit/${concept.conceptType}`}
                        className="usa-button padding-x-105 margin-top-2 margin-right-0 "
                    >
                        <span className="fa fa-pencil fa-lg margin-right-1"></span>
                        Edit Concept
                    </Link>
                }
                {isOrphan &&
                    <div className="grid-col display-flex flex-column flex-align-end">
                        <ClaimButton
                            className="usa-button claim-btn margin-top-2 margin-right-0"
                            onConfirm={onClaimConcept} />
                    </div>
                }
            </div>
        </div>
        <Switch>
            <Route path={`${path}/edit`}>
                {(!belongsToAnotherProfile && isEditable) ?
                    <Lock resourceUrl={`/org/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/concept/${concept.uuid}`}>
                        <EditConcept
                            initialValues={concept}
                            onCreate={handleEditConcept}
                            onCancel={() => history.push(url)}
                            isPublished={isPublished}
                            setIsEditing={setIsEditing}
                            onDeprecate={onDeprecate}
                            onDelete={onDelete}
                        />
                    </Lock>
                    : <Redirect to={url} />
                }
            </Route>

            <Route exact path={path}>
                <ConceptDetailHome
                    belongsToAnotherProfile={belongsToAnotherProfile}
                    concept={concept}
                    setIsEditing={setIsEditing}
                    breadcrumbs={breadcrumbs}
                    setShowModal={setShowModal}
                    isPublished={isPublished}
                    isEditable={isEditable}
                    isEditing={isEditing}
                />
            </Route>
        </Switch>

        <ModalBoxWithoutClose show={showModal}>
            <div className="grid-row">
                <div className="grid-col">
                    <h3>Remove Link</h3>
                </div>
            </div>
            <div className="grid-row">
                <div className="grid-col">
                    <span>Are you sure you want to remove <strong>{concept.name}</strong> from the <strong>{selectedProfileVersion.name}</strong>?</span>
                </div>
            </div>
            <div className="grid-row">
                <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                    <button className="usa-button submit-button" style={{ margin: "1.5em 0em" }} onClick={removeLink}>Remove Now</button>
                </div>
                <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                    <button className="usa-button usa-button--unstyled" onClick={() => setShowModal(false)} style={{ margin: "2.3em 1.5em" }}><b>Cancel</b></button>
                </div>
            </div>
        </ModalBoxWithoutClose>
    </>);
}

function ConceptDetailHome({ belongsToAnotherProfile, concept, setIsEditing, breadcrumbs, setShowModal, isPublished, isEditing, isEditable }) {
    setIsEditing(false);
    return (
        <>
            {
                belongsToAnotherProfile &&
                <div className="usa-alert usa-alert--info usa-alert--slim margin-top-2" >
                    <div className="usa-alert__body">
                        <p className="usa-alert__text">
                            <span style={{ fontWeight: "bold" }}>Linked Concept.</span> This concept is defined by another profile, {concept.parentProfile.name}. {!breadcrumbs && <button style={{ fontWeight: "bold" }} onClick={() => setShowModal(true)} className="usa-button usa-button--unstyled">Remove Link</button>}
                        </p>
                    </div>
                </div>
            }
            {
                concept.isDeprecated && <DeprecatedAlert component={concept} />
            }
            {
                isPublished && !belongsToAnotherProfile && isEditable &&
                <div className="usa-alert usa-alert--info usa-alert--slim margin-top-2" >
                    <div className="usa-alert__body">
                        <p className="usa-alert__text">
                            Editing is limited. This concept has already been published in the profile and may be in use.
                        </p>
                    </div>
                </div>
            }
            <div className="grid-row margin-top-2">
                <div className="desktop:grid-col-8">
                    <Detail title="iri" subtitle="The IRI used to identify this in an xAPI statement.">
                        {concept.iri}
                    </Detail>
                    <Detail title="concept type">
                        {concept.conceptType}
                    </Detail>
                    <Detail title="concept name" subtitle="English (en)">
                        {concept.name}
                    </Detail>
                    <Detail title="description" subtitle="English (en)">
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

                    <div className="details-metadata-box margin-top-2 width-full">
                        <Detail title="updated">
                            {(concept.updatedOn) ? (new Date(concept.updatedOn)).toLocaleDateString() : "Unknown"}
                        </Detail>
                        <Detail title="profile">
                            {belongsToAnotherProfile ?
                                <Link to={`/profile/${concept.parentProfile.uuid}`}>{concept.parentProfile.name}</Link>
                                : concept.parentProfile.name
                            }
                        </Detail>
                        <Detail title="author">
                            <Link to={`/organization/${concept.parentProfile.organization.uuid}`}>{concept.parentProfile.organization.name}</Link>
                        </Detail>
                    </div>
                </div>
            </div>
        </>
    );
}
