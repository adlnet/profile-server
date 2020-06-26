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
import { Formik } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from 'react-redux';
import { getOrganizations, deleteOrganization, searchOrganizations } from '../actions/organizations';


function RenderOrganizationLink({ uuid, name }) {
    return (
        <Link
                to={'/organization/' + uuid}
                className="usa-link button-link"
        >
            {name || "No Name"}
        </Link>
    );
}


function OrgTableRow(props) {
    // let dispatch = useDispatch();

    return (
        <tr>
            <th width="20%" scope="row">
                <RenderOrganizationLink {...props.organization} />
            </th>
            <td><span className="font-sans-3xs">{props.organization.profiles.length}</span></td>
            <td><span className="font-sans-3xs">{props.organization.members.length}</span></td>
            <td><span className="font-sans-3xs">{(props.organization.createdOn) ? (new Date(props.organization.createdOn)).toLocaleDateString() : "Unknown"}</span></td>
            <td>
            {!props.organization.membership && 
                <button
                    className="usa-button  usa-button--unstyled"
                >
                    <span className="text-bold">Join</span>
                </button>
            }
            </td>

        </tr>
    );
}

export default function Organizations(props) {


    const dispatch = useDispatch();
    const organizations = useSelector((state) => state.organizations);
    // const searchResults = useSelector((state) => state.searchResults.organizations);
    
    useEffect(() => {
        dispatch(getOrganizations());
    }, [dispatch]);

    //<LoadingSpinner></LoadingSpinner>

    return (<>
        <main id="main-content" className="grid-container padding-bottom-4">
            <div className="grid-row display-flex flex-row flex-align-end">
                <div className="grid-col">
                    <h1>Working Groups</h1>
                </div>
                <div className="grid-col display-flex flex-column flex-align-end">
                    <Link
                            to="/organization/create"
                    >
                        <button className="usa-button margin-y-2 margin-right-0">
                            <i className="fa fa-plus margin-right-05"></i>
                            Create New Working Group
                        </button>
                    </Link>
                </div>
            </div >
            <div className="grid-row bg-base-lightest">
                <div className="grid-col-8 padding-bottom-3 padding-left-3">
                    <div className="margin-y-1">Search for an existing working group</div>

                    <Formik
                        initialValues={{ search: '', }}
                        validationSchema={Yup.object({
                            search: Yup.string()
                                .required('Required')
                        })}
                        onSubmit={(values) => {
                            dispatch(searchOrganizations(values.search));
                        }}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit
                        }) => (
                                <div className="usa-search">
                                    <div role="search" className={`usa-form-group ${errors.search && touched.search ? "usa-form-group--error" : ""}`} style={{marginTop: '0'}}>
                                        {
                                            errors.search && touched.search && (
                                                <span className="usa-error-message padding-right-1" role="alert">{errors.search}</span>
                                            )
                                        }
                                        <label className="usa-sr-only" htmlFor="search-field">Search</label>
                                        <input className={`usa-input ${errors.search && touched.search ? "usa-input--error" : ""}`} id="search-field" type="search" name="search"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.search} />
                                        <button className="usa-button" type="submit" onClick={handleSubmit} style={{ marginTop: 0 }}>
                                            <span className="usa-search__submit-text">Search</span>
                                        </button>
                                    </div>
                                </div>

                            )}
                    </Formik>
                </div>
            </div>
            <div className="grid-row">
                <table className="usa-table usa-table--borderless maxh-tablet overflow-auto" width="100%">
                    <thead>
                        <tr>
                            <th width="50%" scope="col">Name</th>
                            <th width="10%" scope="col">Profiles</th>
                            <th width="10%" scope="col">Members</th>
                            <th width="20%" scope="col">Date Created</th>
                            <th width="10%" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody style={{ lineHeight: 3 }}>
                        {(organizations && organizations.length > 0)
                            ? organizations.map((organization, i) => <OrgTableRow organization={organization} key={organization.uuid} site_url={props.url} />)
                            : <tr key={1}><td className="font-sans-xs" colSpan="6"><p>There are no organizations.  You need to create one.</p></td></tr>}
                    </tbody>
                </table>
            </div>
        </main> </>
    );
}
