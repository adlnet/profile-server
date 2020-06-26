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
import { useRouteMatch, Route, Switch, Link, useHistory, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import CreateConcept from "./CreateConcept";
import AddConcepts from './AddConcepts'
import { createConcept, loadProfileConcepts } from "../../actions/concepts";
import ConceptDetail from "./ConceptDetails"
import SortingTable from '../SortingTable';

export default function Concepts() {
    const { path, url } = useRouteMatch();
    const { versionId } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        dispatch(loadProfileConcepts(versionId));
    }, [dispatch, versionId])

    const concepts = useSelector((state) => state.concepts)
    

    let data = React.useMemo(() => concepts);
    let columns = React.useMemo(() => getColumns(dispatch));

    function onCreateConcept(concept) {
        dispatch(createConcept(concept));
        history.push(url);
    }

    return (
        <div>
            <Switch>
                <Route exact path={path}>
                    <div className="grid-row">
                        <div className="desktop:grid-col">
                            <h2 style={{ marginBottom: 0 }}>Concepts</h2>
                        </div>
                        <div className="grid-col display-flex flex-column flex-align-end">
                            <Link
                                to={`${url}/add`}
                            >
                                <button className="usa-button margin-top-2 margin-right-0">
                                    <i className="fa fa-plus margin-right-05"></i>
                                    Add Concept
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="grid-row">
                        <SortingTable
                            columns={columns}
                            data={data}
                            emptyMessage="There are no concepts in this profile. Concepts created in this profile or added through import or statement templates will appear here." />
                    </div>
                </Route>
                <Route path={`${path}/create`}>
                    <CreateConcept onCancel={() => history.push(url)} onCreate={onCreateConcept}></CreateConcept>
                </Route>
                <Route exact path={`${path}/add`}>
                    <AddConcepts rootUrl={url} addToName="Profile"></AddConcepts>
                </Route>
                <Route path={`${path}/:conceptId`}>
                    <ConceptDetail />
                </Route>

            </Switch>
        </div>
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
                            to={`concepts/${uuid}`}
                            className="usa-link button-link"
                    >
                        <span>{value}</span>
                    </Link >
                )
            },
            style: {
                width: '30%'
            }
        },
        {
            Header: 'Type',
            accessor: 'conceptType',
            style: {
                width: '15%'
            },
            cellStyle: {
                textTransform: 'capitalize'
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
            Header: function StmtCountHeader() { return <span>Statement<br />Template Count</span> },
            accessor: 'templates.length',
            style: {
                width: '18%'
            }
        },
        {
            Header: 'Updated',
            accessor: 'updatedOn',
            Cell: ({ cell: { value } }) => (new Date(value)).toLocaleDateString(),
            style: {
                width: '15%'
            }
        },
        // {
        //     Header: ' ',
        //     id: 'remove',
        //     disableSortBy: true,
        //     accessor: function removeItem(rowdata) {
        //         //TODO: verify this will show with correct values
        //         return rowdata.fromTemplate == 0 || rowdata.inTemplate ? <button className="usa-button  usa-button--unstyled" onClick={() => removeClick(rowdata, dispatch)}><span className="text-bold">Remove</span></button> : ""
        //     }
        // },
    ]
}
