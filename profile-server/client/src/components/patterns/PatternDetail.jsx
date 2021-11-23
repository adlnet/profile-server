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
import { useRouteMatch, useParams, useHistory, Link, Switch, Route, Redirect, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Detail, Tags, Translations } from '../DetailComponents';
import { selectPattern, editPattern, deletePattern, claimPattern } from '../../actions/patterns';
import EditPattern from './EditPattern';
import Lock from '../users/lock';
import { useState } from 'react';
import Breadcrumb from '../controls/breadcrumbs';
import DeprecatedAlert from '../controls/deprecatedAlert';
import { DEPRECATED } from '../../actions/successAlert';
import ClaimButton from '../controls/ClaimButton';


export default function PatternDetail({ isMember, isCurrentVersion, breadcrumbs, root_ur, isOrphan }) {
    const { url, path } = useRouteMatch();
    const [isEditing, setIsEditing] = useState(false);
    const params = useParams();
    const dispatch = useDispatch();
    const history = useHistory();
    let { patternId } = useParams();
    const profileVersion = useSelector(state => state.application.selectedProfileVersion);
    const { selectedOrganizationId, selectedProfileId,
        selectedProfileVersionId } = useSelector((state) => state.application);

    const isPublicView = !params.organizationId;

    useEffect(() => {
        dispatch(selectPattern(patternId));
    }, [patternId]);

    const pattern = useSelector((state) => state.application.selectedPattern);

    function handleEditPattern(values, actualAction) {
        dispatch(editPattern(Object.assign({}, pattern, values), actualAction));
        history.push(url);
        // history.push(root_url);
    }

    function onDeprecate(reasonInfo) {
        handleEditPattern({ isDeprecated: true, deprecatedReason: reasonInfo }, DEPRECATED)
    }

    async function handleOnDelete() {
        await dispatch(deletePattern(pattern));
        history.push(`/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}`);
    }

    function onDelete() {
        handleOnDelete();
    }

    async function onClaimPattern(profile) {
        await dispatch(claimPattern(selectedOrganizationId, profile._id, selectedProfileVersionId, patternId));
        history.push(`/deleted-items/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}`);
    }

    if (!pattern) return '';

    const renderBreadcrumbs = () => {
        if (breadcrumbs) return <Breadcrumb breadcrumbs={breadcrumbs} />

        const patternsBreadcrumbURL = isPublicView ? `/profile/${selectedProfileId}/patterns` : `/organization/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/patterns`;
        return <Breadcrumb breadcrumbs={[{ to: patternsBreadcrumbURL, crumb: 'patterns' }]} />;
    }

    // is the current pattern in the list of profile patterns
    const isLinkedFromExternalProfile = !(pattern.parentProfile && pattern.parentProfile.parentProfile && pattern.parentProfile.parentProfile.uuid === selectedProfileId);
    const isEditable = isMember && isCurrentVersion && !pattern.isDeprecated;
    const isPublished = pattern.parentProfile.state !== 'draft';

    return (<>
        <div className="grid-row border-bottom-2px border-base-lighter display-flex flex-row " style={{ marginTop: '2em' }}>

            <div className="grid-col padding-bottom-2">
                {renderBreadcrumbs()}
                <h2 style={{ marginBottom: 0, marginTop: '.5em', textTransform: "capitalize" }}><span style={{ fontWeight: 'lighter' }}>{pattern.type}:</span> <span className="text-primary-dark">{pattern.name}</span></h2>
            </div>
            <div className="grid-col display-flex flex-column flex-align-end">
                {
                    !isLinkedFromExternalProfile && isEditable && !isEditing && !isOrphan &&
                    <Link
                        to={`${url}/edit/`}
                        className="usa-button padding-x-105 margin-top-2 margin-right-0 "
                    >
                        <span className="fa fa-pencil fa-lg margin-right-1"></span>
                        Edit Pattern
                    </Link>
                }
                {isOrphan &&
                    <div className="grid-col display-flex flex-column flex-align-end">
                        <ClaimButton
                            className="usa-button claim-btn margin-top-2 margin-right-0"
                            onConfirm={onClaimPattern} />
                    </div>
                }
            </div>
        </div>
        <Switch>
            <Route path={`${path}/edit`}>
                {!isLinkedFromExternalProfile && isEditable ?
                    <Lock resourceUrl={`/org/${selectedOrganizationId}/profile/${selectedProfileId}/version/${selectedProfileVersionId}/pattern/${pattern.uuid}`}>
                        <EditPattern
                            pattern={pattern}
                            onEdit={handleEditPattern}
                            onCancel={() => { history.push(url) }}
                            root_url={url}
                            isPublished={isPublished}
                            setEditing={setIsEditing}
                            onDeprecate={onDeprecate}
                            onDelete={onDelete}
                        />
                    </Lock>
                    : <Redirect to={url} />
                }
            </Route>

            <Route exact path={path}>
                <PatternDetailHome
                    pattern={pattern}
                    setIsEditing={setIsEditing}
                    isPublished={isPublished}
                    isEditable={isEditable}
                    isLinkedFromExternalProfile={isLinkedFromExternalProfile}
                />
            </Route>
        </Switch>
    </>);
}

function PatternComponentsTable({ components, patternType }) {
    let singleComponent = false;
    if (!Array.isArray(components)) {
        singleComponent = true;
        components = [components];
    }
    return (<>
        <div className="padding-top-1">
            <h2>{<span style={{ textTransform: 'capitalize' }}>{patternType}</span>}{` Component${singleComponent ? '' : 's'}`} {(!singleComponent) ? (components && components.length > 0) ? `(${components.length})` : '0' : ''}</h2>
        </div>
        <table className="usa-table usa-table--borderless" width="100%">
            <thead>
                <tr>
                    <th width="45%" scope="col">Name</th>
                    <th width="15%" scope="col">Type</th>
                    <th width="23%" scope="col">Profile</th>
                </tr>
            </thead>
            <tbody style={{ lineHeight: 3 }}>
                {(components && components.length > 0) ?
                    components.map((component, i) => <PatternComponentTableRow key={i} component={component} />) :
                    <tr key={1}><td className="font-sans-xs" colSpan="5">There are no components associated with this profile. Add a component to define relationships between your xAPI statements.</td></tr>
                }
            </tbody>
        </table>
    </>);
}

function PatternComponentTableRow({ component }) {
    return (
        <>
            {component ?
                <tr>
                    <th scope="row">
                        <Link
                            to={`../${component.componentType}s/${component.component.uuid}`}
                            className="usa-link button-link"
                        >
                            <span>{component.component.name || component.component.iri}</span>
                        </Link >
                    </th>
                    <td><span className="font-sans-3xs" style={{ textTransform: 'capitalize' }}>{(component.componentType) === 'template' ? `statement ${component.componentType}` : `${component.componentType}`}</span></td>
                    <td><span className="font-sans-3xs">{(component.component.parentProfile && component.component.parentProfile.name) || 'unknown'}</span></td>
                </tr>
                : <tr><td className="font-sans-xs" colSpan="5">There are no components associated with this profile. Add a component to define relationships between your xAPI statements.</td></tr>
            }
        </>
    );
}

function PatternDetailHome({ pattern, setIsEditing, isPublished, isEditable, isLinkedFromExternalProfile }) {
    setIsEditing(false);
    return (
        <>
            {
                isLinkedFromExternalProfile &&
                <div className="usa-alert usa-alert--info padding-2 margin-top-2" >
                    <div className="usa-alert__body">
                        <p className="usa-alert__text">
                            <span style={{ fontWeight: "bold" }}>Linked Pattern.</span> This pattern is defined by another profile, {pattern.parentProfile.name}.
                        </p>
                    </div>
                </div>
            }
            {
                pattern.isDeprecated && <DeprecatedAlert component={pattern} />
            }
            {
                isPublished && !isLinkedFromExternalProfile && isEditable &&
                <div className="usa-alert usa-alert--info usa-alert--slim margin-top-2" >
                    <div className="usa-alert__body">
                        <p className="usa-alert__text">
                            Editing is limited. This pattern has already been published in the profile and may be in use.
                        </p>
                    </div>
                </div>
            }
            <div className="grid-row">
                <div className="desktop:grid-col-8 margin-top-2">
                    <Detail title="IRI" subtitle="The IRI used to identify this in an xAPI statement.">
                        {pattern.iri}
                    </Detail>
                    <div className="grid-row">
                        <div className="grid-col-4">
                            <Detail title="pattern type">
                                {pattern.type}
                            </Detail>
                        </div>
                        <div className="grid-col-4">
                            <Detail title="primary or secondary">
                                {pattern.primary ? 'Primary' : 'Secondary'}
                            </Detail>
                        </div>
                    </div>
                    <Detail title="pattern name" subtitle="English (en)">
                        {pattern.name}
                    </Detail>
                    <Detail title="description" subtitle="English (en)">
                        {pattern.description}
                    </Detail>
                    <Detail title="translations">
                        <Translations translations={pattern.translations} linkable={true} />
                    </Detail>
                    <Detail title="tags">
                        <Tags tags={pattern.tags} />
                    </Detail>
                </div>
                <div className="desktop:grid-col-4 display-flex flex-column flex-align-end">
                    <div className="details-metadata-box margin-top-2 width-full">
                        <Detail title="updated" >
                            {(pattern.updatedOn) ? (new Date(pattern.updatedOn)).toLocaleDateString() : "Unknown"}
                        </Detail>
                        <Detail title="parent profile" >
                            {isLinkedFromExternalProfile ?
                                <Link to={`/profile/${pattern.parentProfile.uuid}`}>{pattern.parentProfile.name}</Link>
                                : pattern.parentProfile.name
                            }
                        </Detail>
                        <Detail title="author" >
                            <Link to={`/organization/${pattern.parentProfile.organization.uuid}`}>{pattern.parentProfile.organization.name}</Link>
                        </Detail>
                    </div>
                </div>
            </div>
            <PatternComponentsTable components={pattern[pattern.type]} patternType={pattern.type} />
        </>
    );
}
