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
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrganizations, deleteOrganization } from '../actions/organizations';


function RenderOrganizationLink({ uuid, name }) {
    return (
        <p>
            <Link to={'/organization/' + uuid}>
                {' '}
                {name || "No Name"}
                {' '}
            </Link>

        </p>
    );
}


function OrgTableRow(props) {


    let dispatch = useDispatch();
    function removeClick() {
        //return dispatch(removeConcept(props))
    }
    return (
        <tr>
            <th width="20%" scope="row">
                <RenderOrganizationLink {...props.organization} />
            </th>
            <td><span className="font-sans-3xs">{props.organization.name}</span></td>
            <td><span className="font-sans-3xs">{props.organization.members}</span></td>
            <td>
                <button onClick={() => removeClick()} className="usa-button  usa-button--unstyled"><span onClick={() => dispatch(deleteOrganization(props.organization.uuid))} className="text-bold">Remove</span></button>
            </td>

        </tr>
    );
}

export default function Organizations(props) {


    const dispatch = useDispatch();
    const organizations = useSelector(
        (state) => state.organizations
    );
    useEffect(() => { dispatch(getOrganizations()); return; }, [dispatch]);
    //<LoadingSpinner></LoadingSpinner>

    return (<>
        <header className="usa-header usa-header--extended">
            <div className="usa-navbar bg-base-lightest">
                <div className="usa-logo" id="extended-logo">
                    <span className="text-uppercase text-thin font-sans-3xs">Home</span>
                    <em className="usa-logo__text"><a href="/" title="Home" aria-label="Home">{"Demo User"}</a></em>
                </div>
                <button className="usa-menu-btn">Menu</button>
            </div>
            <nav aria-label="Primary navigation" className="usa-nav">
                <div className="usa-nav__inner">
                    <button className="usa-nav__close"><img src="/assets/img/close.svg" alt="close" /></button>
                    <ul className="usa-nav__primary usa-accordion">
                        <li className={`usa-nav__primary-item`}>
                            <Link exact
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span>Account</span>
                            </Link>

                        </li>
                        <li className={`usa-nav__primary-item`}>
                            <Link exact
                                className="usa-nav__link"
                                activeClassName="usa-current">
                                <span>My Organizations</span>
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
                <h2>Organizations</h2>
            </div>
            <div className="grid-row">
                <table className="usa-table usa-table--borderless" width="100%">
                    <thead>
                        <tr>
                            <th width="50%" scope="col">Name</th>
                            <th width="20%" scope="col">Created</th>
                            <th width="20%" scope="col">Members</th>
                            <th width="10%" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody style={{ lineHeight: 3 }}>
                        {(organizations && organizations.length > 0)
                            ? organizations.map((organization, i) => <OrgTableRow organization={organization} key={i} site_url={props.url} />)
                            : <tr key={1}><td className="font-sans-xs" colSpan="6">There are no profiles in this organization</td></tr>}
                    </tbody>
                </table>
            </div>
            <div className="grid-row padding-top-2">
                <div className="desktop:grid-col-3">
                    <Link
                        to={`/organization/create`}>
                        <button className="usa-button ">Create Organization</button>
                    </Link>
                </div>
            </div>
        </main> </>
    );
}


/*

const mapStateToProps = (state, ownProps) => ({
    organizations: state.organizations || [],
});

const mapDispatchToProps = (dispatch) => ({

    getOrganizations: () => dispatch(getOrganizations()),
    deleteOrganization: (orgId) => dispatch(deleteOrganization(orgId)),

});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withRouter(Organizations));

*/