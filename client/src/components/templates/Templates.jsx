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
import { useRouteMatch, useParams, Switch, Route, NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";

import AddTemplate from "./AddTemplate";
import Template from "./Template";
import CreateTemplateForm from "./CreateTemplateForm";
import SortingTable from '../SortingTable';
import { loadProfileTemplates, deleteTemplate } from "../../actions/templates";

export default function Templates() {
    const { url, path } = useRouteMatch();
    const { versionId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
            dispatch(loadProfileTemplates(versionId));
        }, [dispatch]
    );

    const templates = useSelector((state) => state.templates);
    let data = React.useMemo(() => templates);
    let columns = React.useMemo(() => getColumns(dispatch));

    return (
        <>
            <Switch>
                <Route exact path={path}>
                    <div className="grid-row">
                        <div className="desktop:grid-col">
                            <h2 style={{ marginBottom: 0 }}>Statement Templates</h2>
                        </div>
                    </div>
                    <div className="grid-row">
                        <SortingTable
                            columns={columns}
                            data={data}
                            emptyMessage="There are no statement templates associated with this profile. Add statement templates manually or import from a JSON file." />
                    </div>
                    <div className="grid-row padding-top-2">
                        <div className="desktop:grid-col-3">
                            <NavLink exact
                                to={`${url}/add`}
                                className="usa-button">
                                <span>Add Statement Template</span>
                            </NavLink>
                        </div>
                        <div className="desktop:grid-col-3">
                            <button className="usa-button ">Import from JSON File</button>
                        </div>
                    </div>
                </Route>
                <Route exact path={`${path}/add`}>
                    <AddTemplate rootUrl={url} />
                </Route>
                <Route exact path={`${path}/create`}>
                    <CreateTemplateForm />
                </Route>
                <Route path={`${path}/:templateId`}>
                    <Template />
                </Route>
            </Switch>
        </>
    );
}


function getColumns(dispatch) {
    return [
        {
            Header: 'Name',
            id: 'name',
            accessor: 'name',
            Cell: function NameLink(
                { cell: { value },
                    cell: { row: { original: { uuid } } } }
            ) {
                return (
                    <Link
                            to={`templates/${uuid}`}
                            className="usa-link button-link"
                    >
                        <span>{value}</span>
                    </Link >
                )
            },
            style: {
                width: '48%'
            }
        },
        {
            Header: 'Profile',
            accessor: 'parentProfile.name',
            style: {
                width: '18%'
            }
        },
        {
            Header: 'Updated',
            accessor: 'updatedOn',
            Cell: ({ cell: { value } }) => (new Date(value)).toLocaleDateString(),
            style: {
                width: '25%'
            }
        },
        {
            Header: ' ',
            id: 'remove',
            disableSortBy: true,
            accessor: function removeItem(rowdata) {
                return <button className="usa-button  usa-button--unstyled" onClick={() => dispatch(deleteTemplate(rowdata))}><span className="text-bold">Remove</span></button>
            }
        },
    ]
}