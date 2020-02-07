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
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfiles, deleteProfile } from "../actions/profiles";
import { selectOrganization } from "../actions/organizations";
import { Route, Switch, useRouteMatch } from "react-router";
import LoadingSpinner from '../components/LoadingSpinner';
import CreateProfile from './CreateProfile';
import Profile from './Profile';


function RenderProfileLink({ profile, organizationId }) {
    const { uuid, name } = profile;
    return <p key={uuid}><Link to={`/organization/${organizationId}/profile/${uuid}`} > {name} </Link>
    </p>
}

function ProfileTableRow(props) {

    let dispatch = useDispatch();
    function removeClick() {
        dispatch(deleteProfile(props.match.params.organizationId, props.profile))
    }
    return (
        <tr>
            <th width="20%" scope="row">
                <RenderProfileLink profile={props.profile} organizationId={props.match.params.organizationId} />
            </th>
            <td><span className="font-sans-3xs">{props.profile.state}</span></td>
            <td><span className="font-sans-3xs">{props.profile.updatedOn}</span></td>
            <td>
                <button onClick={() => removeClick()} className="usa-button  usa-button--unstyled"><span className="text-bold">Remove</span></button>
            </td>

        </tr>
    );
}

export default function Organization(props) {

    const dispatch = useDispatch();

    const match = useRouteMatch();
    const profiles = useSelector((state) => state.profiles)
    const organization = useSelector((state) => state.application.selectedOrganization)
    // const selectedOrganizationId = useSelector((state) => state.application.selectedOrganizationId)

    let path = match.path;
    let url = match.url;

    useEffect(() => {


        dispatch(selectOrganization(match.params.organizationId));
        dispatch(getProfiles(match.params.organizationId));


    }, [dispatch, match.params.organizationId])

    if (!organization) {
        return "";
    }
    return (
        <>

            <LoadingSpinner></LoadingSpinner>
            <Switch>
                <Route exact path={path}>
                    <header className="usa-header usa-header--extended">
                        <div className="usa-navbar bg-base-lightest">
                            <div className="usa-logo" id="extended-logo">
                                <span className="text-uppercase text-thin font-sans-3xs">Manage Organization</span>
                                <em className="usa-logo__text"><a href="/" title="Home" aria-label="Home">{organization.name}</a></em>
                            </div>
                            <button className="usa-menu-btn">Menu</button>
                        </div>
                        <nav aria-label="Primary navigation" className="usa-nav">
                            <div className="usa-nav__inner">
                                <button className="usa-nav__close"><img src="/assets/img/close.svg" alt="close" /></button>
                                <ul className="usa-nav__primary usa-accordion">
                                    <li className={`usa-nav__primary-item`}>
                                        <Link to="" disabled
                                            className="usa-nav__link"
                                            activeClassName="usa-current">
                                            <span>Details</span>
                                        </Link>

                                    </li>
                                    <li className={`usa-nav__primary-item`}>
                                        <Link to="" disabled
                                            className="usa-nav__link"
                                            activeClassName="usa-current">
                                            <span>Profiles</span>
                                        </Link>

                                    </li>
                                    <li className={`usa-nav__primary-item`}>
                                        <Link to="" disabled
                                            className="usa-nav__link"
                                            activeClassName="usa-current">
                                            <span>Members</span>
                                        </Link>

                                    </li>
                                </ul>
                                <div className="usa-nav__secondary">
                                    <form className="usa-search usa-search--small ">
                                        <select className="usa-select" name="options" id="options">
                                            <option value>Actions</option>
                                            <option value="publish">Publish to Public</option>
                                            <option value="export">Export to File</option>
                                            <option value="import">Import from File</option>
                                            <option value="history">View Version History</option>
                                            <option value="deprecate">Deprecate</option>
                                        </select>
                                    </form>
                                </div>
                            </div>
                        </nav>
                    </header>
                    <main id="main-content" className="grid-container">
                        <div className="grid-row">
                            <h2>Profiles</h2>
                        </div>
                        <div className="grid-row">
                            <table className="usa-table usa-table--borderless" width="100%">
                                <thead>
                                    <tr>
                                        <th width="50%" scope="col">Name</th>
                                        <th width="20%" scope="col">State</th>
                                        <th width="20%" scope="col">Updated</th>
                                        <th width="10%" scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody style={{ lineHeight: 3 }}>
                                    {(profiles && profiles.length > 0)
                                        ? profiles.map((profile, i) => <ProfileTableRow profile={profile} key={i} match={match} site_url={props.url} />)
                                        : <tr key={1}><td className="font-sans-xs" colSpan="6">There are no profiles in this organization</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="grid-row padding-top-2">
                            <div className="desktop:grid-col-3">
                                <Link
                                    to={`${url}/profile/create`}>
                                    <button className="usa-button ">Create Profile</button>
                                </Link>
                            </div>
                        </div>
                    </main>
                </Route>
                <Route exact path={`${path}/profile/create`}>
                    <CreateProfile />
                </Route>
                <Route path={`${path}/profile/:profileId`}>
                    <Profile />
                </Route>
                <Route path={`${path}/profile/:profileId`}>
                    <Profile />
                </Route>
            </Switch>
        </>
    );
}
