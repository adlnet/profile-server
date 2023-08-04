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
import { Route, Switch, useRouteMatch, useHistory, useParams, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { createProfile } from "../actions/profiles";
import { requestJoinOrganization, selectOrganization } from "../actions/organizations";
import LoadingSpinner from '../components/LoadingSpinner';
import CreateProfile from './CreateProfile';
import CreateProfileForm from '../components/profiles/CreateProfileForm';
import Profile from './Profile';
import ErrorPage from '../components/errors/ErrorPage';
import Members from "../components/members/Members"
import OrganizationHeader from '../components/organizations/OrganizationHeader';
import Profiles from '../components/profiles/Profiles';
import ApiKeys from '../components/api-keys/ApiKeys';
import About from '../components/organizations/About';
import EditOrganization from '../components/organizations/EditOrganization';
import Lock from '../components/users/lock';
import PrivateRoute from '../components/users/PrivateRoute';

export default function Organization() {

    const dispatch = useDispatch();
    const history = useHistory();
    const { path, url } = useRouteMatch();
    const { organizationId } = useParams();
    const [showModal, setShowModal] = useState(false);

    const organization = useSelector((state) => state.application.selectedOrganization);
    const user = useSelector((state) => state.userData.user);

    useEffect(() => {
        dispatch(selectOrganization(organizationId));
    }, [dispatch, organizationId])

    if (!organization) {
        return '';
    }
    
    //A org with empty members means you're not part of it. 
    let isMember = organization.membership;

    function handleProfileCreate(values) {
        dispatch(createProfile(organizationId, values));
        history.push(url);
    }

    function handleCancelProfileCreate() {
        history.push(url);
    }

    async function joinAction() {
        dispatch(requestJoinOrganization(organization.uuid, user));
        setShowModal(true);
        setTimeout(
            () => setShowModal(false),
            3000
        )
    }


    return (<>
        <LoadingSpinner></LoadingSpinner>
        <Switch>
            <PrivateRoute exact path={`${path}/profile/create`}>
                <CreateProfile>
                    <CreateProfileForm handleSubmit={handleProfileCreate} handleCancel={handleCancelProfileCreate} />
                </CreateProfile>
            </PrivateRoute>
            <PrivateRoute path={`${path}/profile/:profileId/version/:versionId`}>
                <Profile rootUrl={url} />
            </PrivateRoute>
            <Route path={path}>
                <OrganizationHeader user={user} organization={organization} organizationId={organizationId} url={url} isMember={isMember} joinAction={joinAction}></OrganizationHeader>
                {
                    showModal &&
                    <div className="grid-row">
                        <div className="usa-alert usa-alert--info" style={{ width: "100%" }}>
                            <div className="usa-alert__body">
                                <h3 className="usa-alert__heading">Request Sent</h3>
                                <p className="usa-alert__text">Your request to the working group was sent.</p>
                            </div>
                        </div>
                    </div>
                }
                <main id="main-content" className={"grid-container  padding-bottom-4"}>
                    <Switch>
                        <Route exact path={`${path}/about`}>
                            <About organization={organization} isMember={isMember} rootUrl={url} />
                        </Route>
                        <PrivateRoute exact path={`${path}/edit`}>
                            <Lock resourceUrl={`/org/${organizationId}`}>
                                <EditOrganization organization={organization} rootUrl={url} />
                            </Lock>
                        </PrivateRoute>
                        <Route exact path={path}>
                            <Profiles profiles={organization.profiles} isMember={isMember} />
                        </Route>
                        <PrivateRoute path={`${path}/members`}>
                            <Members isMember={isMember} />
                        </PrivateRoute>
                        <PrivateRoute path={`${path}/apiKeys`}>
                            {isMember === 'admin' ?
                                <ApiKeys />
                                :
                                <Redirect to={`${url}/about`} />
                            }
                        </PrivateRoute>


                        <Route>
                            <ErrorPage />
                        </Route>
                    </Switch>
                </main>
            </Route>

            <Route>
                <ErrorPage />
            </Route>
        </Switch>
    </>);
}
