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
import React, { useEffect, useState } from 'react';
import { Switch, Route, NavLink, useParams, useRouteMatch, Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import jsDownload from 'js-file-download';
import Lock from "../components/users/lock";
import Templates from '../components/templates/Templates';
import Concepts from '../components/concepts/Concepts';
import Patterns from '../components/patterns/Patterns'
import { selectProfile, selectProfileVersion, publishProfileVersion, createNewProfileDraft, 
    editProfileVersion, resolveProfile, requestVerification, deleteProfile, 
    deleteProfileDraft } from "../actions/profiles";
import history from "../history";
import CreateProfileForm from '../components/profiles/CreateProfileForm';
import ProfileDetails from '../components/profiles/ProfileDetails';
import ErrorPage from '../components/errors/ErrorPage';
import ProfilePublishButton from '../components/profiles/profilePublishButton';
import ProfileImportQueue from '../components/profiles/ProfileImportQueue'
import { selectOrganization } from '../actions/organizations';

import ModalBoxWithoutClose from '../components/controls/modalBoxWithoutClose';
import { Field, Form, Formik } from 'formik';
import api from "../api";
import { v4 as uuidv4 } from 'uuid';

import Import from '../components/profiles/ProfileImport';
import Iri, { isValidIRI } from '../components/fields/Iri';
import ModalBox from '../components/controls/modalBox';
import CancelButton from '../components/controls/cancelButton';
import ErrorValidation from '../components/controls/errorValidation';
import { verificationResponded } from '../actions/successAlert';

import AccountButton from "../components/users/AccountButton"

export default function Profile() {
    let history = useHistory();
    const dispatch = useDispatch();
    const { url, path } = useRouteMatch();
    const { organizationId, profileId, versionId } = useParams();

    const [publishConfirmation, showPublishConfirmation] = useState(false);
    const [publishVerification, showPublishVerification] = useState(false);
    const [copiedToClipBoard, showCopyToClipBoard] = useState(false);
    const [verificationReview, showVerificationReview] = useState(false);
    const [revokeVerificationDialog, showRevokeVerificationDialog] = useState(false);

    const userData = useSelector((state) => state.userData);
    const profile = useSelector((state) => state.application.selectedProfile);
    const profileVersion = useSelector((state) => state.application.selectedProfileVersion);
    const organization = useSelector(state => state.application.selectedOrganization);

    let [searchString, setSearchString] = useState();

    function search(e) {
        history.push({ pathname: "/search", state: { search: searchString } });
        e.preventDefault();
        setSearchString("");
        return false;
    }

    // let isMember = organization
    //     && (organization.membership
    //         || (userData && userData.user && organization.members.map(m => m.user.uuid).includes(userData.user.uuid)));

    let isMember = organization && !!organization.membership;

    async function verifyProfile(values) {
        showVerificationReview(false);
        showRevokeVerificationDialog(false);
        await api.verifyProfile(profileVersion.uuid, values);
        dispatch(verificationResponded(values.approval === 'approve'));
        dispatch(selectProfile(organizationId, profileId));
        dispatch(selectProfileVersion(organizationId, profileId, versionId));
    }
    useEffect(() => {
        // url might be /profile/:uuid .. or /organization/uuid/profile/uuid/version/uuid
        if (profileId && versionId) {
            dispatch(selectProfile(organizationId, profileId));
            dispatch(selectProfileVersion(organizationId, profileId, versionId));
        } else if (profileId) {
            // url must be /profile/:uuid.. figure out what id they sent us
            dispatch(resolveProfile(profileId));
        }

        if (organizationId) {
            dispatch(selectOrganization(organizationId));
        }
    }, [organizationId, profileId, versionId])

    if (!(profile && profileVersion && organization)) return '';

    let versions = [...profile.versions];
    versions.sort((a, b) => b.version - a.version);

    let isCurrentVersion = profileVersion.uuid === versions[0].uuid;

    function getVersionUrl(versionUuid) {
        return `/organization/${organizationId}/profile/${profileId}/version/${versionUuid}`;
    }

    function publishProfile(iri) {
        showPublishConfirmation(false);
        if (profileVersion.state !== 'draft') return;
        if (iri === profile.iri)
            dispatch(publishProfileVersion(profileVersion));
        else
            dispatch(publishProfileVersion(profileVersion, iri));
    }

    function confirmPublish() {
        showPublishConfirmation(true);
    }

    function handleEditProfile(values) {
        if (values.state === 'published') {
            // if editing the published profile, we need to clean up 
            // the values param since we create a new draft from the published version.
            let newVersion = {
                tags: values.tags,
                concepts: values.concepts,
                externalConcepts: values.externalConcepts,
                templates: values.templates,
                patterns: values.patterns,
                translations: values.translations,
                name: values.name,
                description: values.description,
                moreInformation: values.moreInformation,
                version: values.version,
                iri: values.iri
            };
            // Need to verify iri is a new one, not the original published version (profileVersion)
            if (newVersion.iri === profileVersion.iri) delete newVersion.iri;
            dispatch(createNewProfileDraft(newVersion));
        } else {
            dispatch(editProfileVersion(values));
        }
        history.push(url);
    }
    function handleRequestVerification() {
        showPublishVerification(false);
        dispatch(requestVerification())
    }
    function handleCancelEditProfile() {
        history.push(url);
    }

    async function handleDeleteProfile() {
        await dispatch(deleteProfile(organizationId, profile));
        history.push(`/`);
        setTimeout(() => {
            window.location.reload();
        });
    }

    async function handleDeleteProfileDraft() {
        await dispatch(deleteProfileDraft(organizationId, profile));
        history.push(`/`);
        setTimeout(() => {
            window.location.reload();
        });
    }

    function isMaxVersion(version) {
        const max = Math.max(...profile.versions.map(v => v.version));
        return version === max;
    }
    function toggleClipBoardAlert(show) {
        showCopyToClipBoard(show)
    }

    // test
    async function handleExport() {
        try {
            const exportData = await api.exportProfile(profileVersion.uuid);
            jsDownload(exportData, 'profile.jsonld');
        } catch (err) {
            dispatch({
                type: 'ERROR_EXPORT_PROFILE',
                errorType: 'profiles',
                error: err.message,
            });
        }
    }

    let requestDate = new Date(profileVersion.verificationRequest).toDateString();
    let requestedByObj = profileVersion.verificationRequestedBy;
    let requestAuthor = (requestedByObj && requestedByObj.username) 
        ? `${requestedByObj.username} (${requestedByObj.uuid})`  
        : "Unknown User";

    return (<>
        {profileVersion && profileVersion.state !== 'draft' && !profileVersion.isVerified && profileVersion.verificationRequest && userData.user && userData.user.type === "admin" &&
            <div className="outer-alert">
                <div className="usa-alert usa-alert--slim usa-alert--info margin-top-2" >
                    <div className="usa-alert__body" style={{ width: "100%", display: "inline-block" }}>
                        <p className="usa-alert__text" style={{ width: "100%", }}>
                            <span>This profile was sent for verification by {requestAuthor} on {requestDate}. </span> <button className="usa-button usa-button--unstyled text-bold float-right" onClick={() => showVerificationReview(true)}> Verify profile</button>
                        </p>
                    </div>
                </div>
            </div>
        }
        {
            profileVersion.state === 'draft' ?
                <div className="outer-alert">
                    <div className="usa-alert usa-alert--slim usa-alert--info margin-top-2" >
                        <div className="usa-alert__body">
                            <p className="usa-alert__text">
                                This profile is in a DRAFT state and won’t be available for public use until it is published.
                            </p>
                        </div>
                    </div>
                </div> :
                !isMaxVersion(profileVersion.version) && isMember ?
                    <div className="outer-alert">
                        <div className="usa-alert usa-alert--slim usa-alert--warning margin-top-2" >
                            <div className="usa-alert__body">
                                <p className="usa-alert__text">
                                    You are viewing an older version of this profile ({profileVersion.version}).
                                    <Link
                                        to={getVersionUrl(profile.versions[profile.versions.length - 1].uuid)}
                                    > Return to the latest version ({profile.versions[profile.versions.length - 1].version}).
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div> : ''

        }
        {
            copiedToClipBoard &&
            <div className="outer-alert">
                <div className="usa-alert usa-alert--slim usa-alert--info margin-top-2" >
                    <div className="usa-alert__body" style={{ width: "100%", display: "inline-block" }}>
                        <p className="usa-alert__text" style={{ width: "100%", }}>
                            <span>This profile has been copied to your clipboard.</span> <button className="usa-button usa-button--unstyled text-bold float-right" onClick={() => toggleClipBoardAlert(false)}> close</button>
                        </p>
                    </div>
                </div>
            </div>
        }
        <header className="usa-header usa-header--extended margin-top-5">
            <div className="usa-navbar bg-base-lightest usa-navbar-container">
                <div className="usa-navbar-item" style={{ width: "65%" }}>
                    <div className="usa-logo" id="extended-logo" style={{ margin: ".5em 0 0 0", maxWidth: "100%" }}>
                        <h3 className="margin-y-0 margin-right-2" style={{ display: "inline-block" }}><a href={isMember ? `${url}` : `/profile/${profileVersion.uuid}`} title="Home" aria-label="Home">{profileVersion.name}</a></h3>
                        {profileVersion.isVerified && <img className="" src="/assets/uswds/2.4.0/img/verified.svg" alt="This profile is verified" title="This profile is verified" width="28px" height="28px" />}
                    </div>
                    <div style={{ marginBottom: "1em" }}>
                        <span className="text-base font-ui-3xs" style={{ lineHeight: ".1" }}>IRI: {profile.iri}</span>
                    </div>
                </div>
                <div className="usa-navbar-item" style={{ width: "35%" }}>
                    <ProfilePublishButton
                        isMember={isMember}
                        isAdmin={userData.user && userData.user.type === "admin"}
                        isCurrentVersion={isCurrentVersion}
                        verificationRequest={profileVersion.verificationRequest}
                        profileVersionState={profileVersion.state}
                        profileVersionIsVerified={profileVersion.isVerified}
                        onPublish={confirmPublish}
                        onVerification={showPublishVerification}
                        onExport={handleExport}
                        onCopyToClipBoard={() => toggleClipBoardAlert(true)}
                        onRevokeVerification={() => showRevokeVerificationDialog(true)}
                    />
                </div>
            </div>
            <nav aria-label="Primary navigation" className="usa-nav">
                <div className="usa-nav__inner">
                    <button className="usa-nav__close"><i className="fa fa-close"></i></button>
                    <ul className="usa-nav__primary usa-accordion" style={{ marginBottom: '-.15rem' }}>
                        <li className="usa-nav__primary-item main-menu-show">
                            <NavLink to="/profiles"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Profiles</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item main-menu-show">
                            <NavLink to="/organization"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Working Groups</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item main-menu-show">
                            <NavLink to="/api-info"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current">
                                <span className="text-bold">API Info</span>
                            </NavLink>
                        </li>
                        {userData && userData.user && userData.user.type === 'admin' &&
                            <li className="usa-nav__primary-item main-menu-show">
                                <button className="usa-accordion__button usa-nav__link" aria-expanded="false" aria-controls="basic-nav-section-admin1">
                                    <span className="text-bold">Admin</span>
                                </button>
                                <ul id="basic-nav-section-admin1" className="usa-nav__submenu" hidden>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/admin/users"
                                            className="usa-link"
                                        >
                                            Manage Users
                                        </NavLink>
                                    </li>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/admin/verification"
                                            className="usa-link"
                                        >
                                            Verify Profiles
                                        </NavLink>
                                    </li>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/admin/analytics"
                                            className="usa-link"
                                        >
                                            Analytics
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        }
                        <li className="usa-nav__primary-item main-menu-show" style={{ marginLeft: 'auto' }}>
                            <AccountButton controlIndex={1000}></AccountButton>
                        </li>
                        <li className={`usa-nav__primary-item `}>
                            <NavLink exact
                                to={`${url}`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">Profile Details</span>
                            </NavLink>
                        </li>
                        <li className={`usa-nav__primary-item `}>
                            <NavLink
                                to={`${url}/templates`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">Statement Templates ({profileVersion.templates ? profileVersion.templates.length : 0})</span>
                            </NavLink>
                        </li>
                        <li className={`usa-nav__primary-item `}>
                            <NavLink
                                to={`${url}/patterns`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">Patterns ({profileVersion.patterns ? profileVersion.patterns.length : 0})</span>
                            </NavLink>
                        </li>
                        <li className={`usa-nav__primary-item `}>
                            <NavLink
                                to={`${url}/concepts`}
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span className="text-bold">
                                    Concepts ({
                                        profileVersion.concepts && profileVersion.externalConcepts ?
                                            profileVersion.concepts.length + profileVersion.externalConcepts.length : 0
                                    })
                                </span>
                            </NavLink>
                        </li>
                        {(isMember && profileVersion.harvestDatas && profileVersion.harvestDatas.length > 0) &&
                            <li className={`usa-nav__primary-item `}>
                                <NavLink
                                    to={`${url}/queue`}
                                    className="usa-nav__link"
                                    activeClassName="usa-current">
                                    <span className="text-bold">
                                        Import Queue ({
                                            profileVersion.harvestDatas.length
                                        })
                                    </span>
                                </NavLink>
                            </li>
                        }
                        <div className="usa-nav__secondary main-menu-show">
                            <form className="usa-search usa-search--small " onSubmit={search} role="search" style={{ display: 'flex' }}>
                                <label className="usa-sr-only" htmlFor="extended-search-field-small">Search small</label>
                                <input className="usa-input" id="extended-search-field-small" value={searchString} onChange={e => setSearchString(e.target.value)} type="search" name="search" />
                                <button id="site-search" className="usa-button" type="submit" style={{backgroundColor: '#005ea2'}}><span className="usa-sr-only">Search</span></button>
                            </form>
                        </div>
                    </ul>
                </div>
            </nav>
        </header>
        <main id="main-content" className="grid-container padding-bottom-4">

            <Switch>
                <Route exact path={path}>
                    <ProfileDetails isMember={isMember} isCurrentVersion={isCurrentVersion} />
                </Route>
                <Route path={`${path}/templates`} >
                    <Templates isMember={isMember} isCurrentVersion={isCurrentVersion} />
                </Route>
                <Route path={`${path}/patterns`} >
                    <Patterns isMember={isMember} isCurrentVersion={isCurrentVersion} />
                </Route>
                <Route path={`${path}/concepts`} >
                    <Concepts isMember={isMember} isCurrentVersion={isCurrentVersion} />
                </Route>
                <Route path={`${path}/edit`}>
                    {(isMember && isCurrentVersion) ? <>
                        <h2>Edit Profile Details</h2>

                        <Lock resourceUrl={`/org/${organization.uuid}/profile/${profile.uuid}/version/${profileVersion.uuid}`}>
                            <CreateProfileForm
                                handleSubmit={handleEditProfile}
                                handleCancel={handleCancelEditProfile}
                                handleDeleteProfile={handleDeleteProfile}
                                handleDeleteProfileDraft={handleDeleteProfileDraft}
                                initialValue={profileVersion}
                            />
                        </Lock> </>
                        : <p>You do not have permissions to edit this profile. <a href={path} className="usa-link">Go Back</a></p>}
                </Route>
                <Route path={`${path}/import`}>
                    <Import />
                </Route>
                <Route exact path={`${path}/queue`}>
                    <ProfileImportQueue />
                </Route>
                <Route>
                    <ErrorPage />
                </Route>
            </Switch>
            <ModalBoxWithoutClose show={publishVerification}>
                <div style={{ maxWidth: 550 }}>
                    <div className="grid-row">
                        <div className="grid-col">
                            <h2>Submit for Verification</h2>
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-col">
                            <p>Request a review by a server administrator to evaluate the depth and quality of
                            this profile. Verification is not required, but serves as a symbol of quality to help
                            others find robust profiles. Verification should be requested for each published
                            version of a profile.
                            </p>
                            <i>You will receive an email with the results of the review.</i>
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                            <button className="usa-button" style={{ margin: "1.5em 0em" }} onClick={handleRequestVerification}>Submit for Verification</button>
                        </div>
                        <div className="grid-col" style={{ maxWidth: "fit-content" }} >
                            <button className="usa-button usa-button--unstyled" style={{ margin: "2.3em 1.5em", fontWeight: "bold" }} onClick={() => showPublishVerification(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </ModalBoxWithoutClose>
            <ModalBox show={publishConfirmation} onClose={() => { showPublishConfirmation(false) }} isForm={profile.versions && profile.versions.length == 1}>
                <div className="" style={{ padding: "0 0.5em" }}>
                    <div className="grid-row">
                        <div className="grid-col">
                            <h2>Publish to Public</h2>
                        </div>
                    </div>
                    {profile.versions && profile.versions.length > 1 ?
                        <>
                            <div className="grid-row">
                                <div className="grid-col">
                                    <span>Version {profileVersion.version} of this profile will be published to public.</span>
                                </div>
                            </div>
                            <div className="grid-row">
                                <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                                    <button className="usa-button submit-button" style={{ margin: "1.5em 0em" }} onClick={() => publishProfile()}>Publish Now</button>
                                </div>
                                <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                                    <button className="usa-button usa-button--unstyled" onClick={() => showPublishConfirmation(false)} style={{ margin: "2.3em 1.5em" }}><b>Cancel</b></button>
                                </div>
                            </div>
                        </>
                        :
                        <IRIConfirmationForm iri={profile.iri} publishProfile={publishProfile} cancelAction={() => showPublishConfirmation(false)} />
                    }
                </div>
            </ModalBox>
            <ModalBox show={verificationReview} onClose={() => { showVerificationReview(false) }} isForm={true}>
                <ProfileVerificationReviewForm saveVerifiedResponseAction={verifyProfile} cancelAction={() => showVerificationReview(false)} />
            </ModalBox>
            <ModalBox show={revokeVerificationDialog} onClose={() => { showRevokeVerificationDialog(false) }} isForm={true}>
                <ProfileVerificationRevokeForm saveVerifiedResponseAction={verifyProfile} cancelAction={() => showRevokeVerificationDialog(false)} />
            </ModalBox>

        </main>
    </>);
}

function IRIConfirmationForm({ iri, publishProfile, cancelAction }) {
    // assume if the iri starts with profileRootIRI then we generated it
    const profileRootIRI = useSelector(state => state.application.profileRootIRI);
    let iriType = iri.startsWith(profileRootIRI) ? "generated-iri" : "external-iri";

    let initialValues = { confirmed: false, iriType: iriType, extiri: '', geniri: '', };
    let generatedIRIBase;

    if (iriType === "generated-iri") {
        initialValues.geniri = iri;
        generatedIRIBase = iri;
    }
    else {
        initialValues.extiri = iri;
        generatedIRIBase = `${profileRootIRI}/${uuidv4()}`;
    }


    const formValidation = (values) => {
        const errors = {};
        if (values.iriType === 'external-iri') {
            if (!values.extiri) errors.extiri = 'Required';
            if (!isValidIRI(values.extiri)) errors.extiri = 'IRI did not match expected format.';
        }
        return errors;
    }

    return (

        <Formik
            initialValues={initialValues}
            validate={formValidation}
            onSubmit={values => {
                let profileIRI;

                if (values.iriType === 'generated-iri') {
                    profileIRI = generatedIRIBase;
                } else if (values.iriType === 'external-iri') {
                    // remove trailing slashes from IRIs
                    profileIRI = values.extiri.replace(/\/$/, '');
                }
                publishProfile(profileIRI);
            }}
        >
            {(formikProps) => (
                <Form className="usa-form margin-top-2" style={{ width: "640px", maxWidth: "none" }}>
                    <div className="grid-row">
                        <div className="grid-col">
                            <span>Version 1 of this profile will be published to the public.</span>
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-col">
                            <Iri message="This profile already has an IRI that is used in xAPI statements"
                                {...formikProps} generatedIRIBase={generatedIRIBase} profileIRI={true} isPublished={false} labelPrefix='verify' />
                        </div>
                    </div>
                    <div className="grid-row margin-top-2">
                        <div className="grid-col">
                            <span className="text-base font-ui-2xs">
                                This is what you will use to identify this profile in xAPI statements. You may use the IRI that is
                                generated by the profile server or an IRI that you manage elsewhere. Once this profile has been
                                published you will not be able to change it.
                            </span>
                        </div>
                    </div>
                    <div className="grid-row" style={{ marginTop: "2em" }}>
                        <div className="grid-col">
                            <Field aria-label="agree IRI is ok" type="checkbox" name="confirmed" id="confirmed" className="usa-checkbox__input" />
                            <label className="usa-checkbox__label" htmlFor="confirmed">
                                I acknowledge the above IRI is the official, permanent IRI that will be used to identify this profile and cannot be changed later.
                            </label>
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                            <button className="usa-button submit-button" style={{ margin: "1.5em 0em 1em 0em" }} disabled={!formikProps.values.confirmed} type="submit">Publish Now</button>
                        </div>
                        <div className="grid-col" style={{ maxWidth: "fit-content" }}>

                            <CancelButton className="usa-button usa-button--unstyled" cancelAction={cancelAction} style={{ margin: "2.3em 1.5em 1em 1.5em" }} />
                        </div>
                    </div>
                </Form>)}
        </Formik>

    );
}

function ProfileVerificationReviewForm({ saveVerifiedResponseAction, cancelAction }) {

    function formValidation(values) {
        let errors = {}

        if (!values.approval) errors.approval = "Required"

        if (values.approval === 'deny' && !values.reason.trim()) errors.reason = "Required"

        return errors;
    }

    return (
        <Formik
            initialValues={{ approval: '', reason: '' }}
            validate={formValidation}
            onSubmit={values => {
                saveVerifiedResponseAction(values);
            }}
        >
            {(formikProps) => (
                <Form className="usa-form padding-x-2" style={{ width: "640px", maxWidth: "none", maxHeight: "80vh", overflowY: "auto" }}>
                    <div className="grid-row">
                        <div className="grid-col">
                            <h2>Verify this profile</h2>
                        </div>
                    </div>
                    <div className="grid-row margin-top-2">
                        <div className="grid-col">
                            <span className="">
                                A verified status helps users find the highest quality, most robust profile to use for a given topic. Review
                                the profile for the presence of the following qualities that are recommended to be approved for verified status:
                                <ul>
                                    <li>is robust and unique</li>
                                    <li>reuses concepts as much as possible</li>
                                    <li>leverages statement templates and patterns; not just concepts</li>
                                    <li>is managed by a group believed to be experts in the topic</li>
                                </ul>
                            </span>
                        </div>
                    </div>
                    <div className="grid-row margin-top-2">
                        <div className="grid-col">
                            <span className="">
                                Profiles that do not meet the criteria for verification should not be approved for verification.
                                When denying these requests, please provide a brief explanation to the working group.
                            </span>
                        </div>
                    </div>
                    <div className="grid-row" style={{ marginTop: "1em" }}>
                        <div className="grid-col">
                            <div className="usa-radio">
                                <Field className="usa-radio__input"
                                    type="radio"
                                    name="approval"
                                    id="approve"
                                    value="approve"
                                />
                                <label className="usa-radio__label" htmlFor="approve">
                                    <div className="title">Approve</div>
                                    <div className="description">
                                        This profile does meet the recommendations for verified status
                                                </div>
                                </label>
                            </div>

                            <div className="usa-radio">
                                <Field className="usa-radio__input"
                                    type="radio"
                                    name="approval"
                                    id="deny"
                                    value="deny"
                                />
                                <label className="usa-radio__label" htmlFor="deny">
                                    <div className="title">Deny</div>
                                    <div className="description">
                                        This profile does not meet the recommendations for verified status
                                </div>
                                </label>
                            </div>
                            {formikProps.values.approval === 'deny' &&
                                <ErrorValidation name="reason" type="input" style={{ marginTop: "1em", marginBottom: "1em" }}>
                                    <label className="details-label" htmlFor="reason"><span className="text-secondary-darker margin-right-05">*</span>Reason for denying verified status</label>
                                    <Field name="reason" component="textarea" rows="3" className="usa-textarea" id="reason" aria-required="true" ></Field>
                                </ErrorValidation>
                            }
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                            <button className="usa-button submit-button" style={{ margin: "1.5em 0em 1em 0em" }} disabled={!(formikProps.values.approval === 'approve' || (formikProps.values.approval === 'deny' && formikProps.values.reason))} type="submit">Save verified response</button>
                        </div>
                        <div className="grid-col" style={{ maxWidth: "fit-content" }}>

                            <CancelButton className="usa-button usa-button--unstyled" cancelAction={cancelAction} style={{ margin: "2.3em 1.5em 1em 1.5em" }} />
                        </div>
                    </div>
                </Form>)}
        </Formik>
    );
}


function ProfileVerificationRevokeForm({ saveVerifiedResponseAction, cancelAction }) {
    function formValidation(values) {
        let errors = {}

        if (values.approval === 'deny' && !values.reason.trim()) errors.reason = "Required"

        return errors;
    }

    return (
        <Formik
            initialValues={{ approval: 'deny', reason: '' }}
            validate={formValidation}
            onSubmit={values => {
                saveVerifiedResponseAction(values);
            }}
        >
            {(formikProps) => (
                <Form className="usa-form " style={{ width: "640px", maxWidth: "none" }}>
                    <div className="grid-row">
                        <div className="grid-col">
                            <h2>Revoke verification</h2>
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-col">
                            To revoke verification status, supply a reason for why that version is being revoked. A version of a profile may have
                            verification status revoked if
                            <ul>
                                <li>it has been superseded by another profile</li>
                                <li>an issue was detected in the profile after status was granted</li>
                                <li>verification status was accidentally granted</li>
                            </ul>
                        </div>
                    </div>
                    <div className="grid-row" style={{ marginTop: "1em" }}>
                        <div className="grid-col">
                            <ErrorValidation name="reason" type="input" style={{ marginTop: "1em", marginBottom: "1em" }}>
                                <label className="details-label" htmlFor="reason"><span className="text-secondary-darker margin-right-05">*</span>Reason for revoking verified status</label>
                                <Field name="reason" component="textarea" rows="3" className="usa-textarea" id="reason" aria-required="true" ></Field>
                            </ErrorValidation>
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                            <button className="usa-button submit-button" style={{ margin: "1.5em 0em 1em 0em" }} disabled={!(formikProps.values.reason)} type="submit">Revoke verified status</button>
                        </div>
                        <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                            <CancelButton className="usa-button usa-button--unstyled" cancelAction={cancelAction} style={{ margin: "2.3em 1.5em 1em 1.5em" }} />
                        </div>
                    </div>
                </Form>)}
        </Formik>
    );
}