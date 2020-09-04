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
import { Route, Switch, useRouteMatch, Link, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { deletePattern, loadProfilePatterns } from './../../actions/patterns';
import AddPattern from './AddPattern';
import CreatePattern from './CreatePattern';
import PatternDetail from './PatternDetail';
import { useSelector } from 'react-redux';
import SortingTable from '../SortingTable';
import ErrorBoundary from '../errors/ErrorBoundary';

// this is very similar to statement template page
export default function Patterns(props) {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const { selectedProfileVersionId } = useSelector(state => state.application);
    const patterns = useSelector((state) => state.patterns);

    useEffect(() => {
        dispatch(loadProfilePatterns(selectedProfileVersionId));
    }, [selectedProfileVersionId])

    let data = React.useMemo(() => patterns, [patterns]);
    let columns = React.useMemo(() => getColumns(dispatch, props.isMember), [props.isMember]);

    return (<>
        <ErrorBoundary errorType="patterns" />
        <Switch>
            <Route exact path={path}>
                <div className="grid-row">
                    <div className="desktop:grid-col">
                        <h2 style={{ marginBottom: 0 }}>Patterns</h2>
                    </div>
                </div>
                <div className="grid-row">
                    <SortingTable
                        {...props}
                        columns={columns}
                        data={data}
                        emptyMessage="There are no patterns associated with this profile. Add a pattern to define relationships between your xAPI statements." />
                </div>
                {props.isMember &&
                    <div className="grid-row padding-top-2">
                        <div className="desktop:grid-col-3">
                            <Link to={`${url}/add`} className="usa-button">Add Pattern</Link>
                        </div>
                    </div>
                }
            </Route>
            <Route exact path={`${path}/add`}>
                {props.isMember ?
                    <AddPattern root_url={url} />
                    : <Redirect to={url} />
                }
            </Route>
            <Route path={`${path}/create`}>
                {props.isMember ?
                    <CreatePattern {...props} root_url={url} />
                    : <Redirect to={url} />
                }
            </Route>
            <Route path={`${path}/:patternId`}>
                <PatternDetail {...props} />
            </Route>
            {/* <Redirect from="/" to="" /> */}
        </Switch>
    </>);
}

function getColumns(dispatch, isMember) {
    const cols = [
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
                        to={`patterns/${uuid}`}
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
            Header: 'Primary',
            accessor: 'primary',
            Cell: ({ cell: { value } }) => (value) ? 'Primary' : 'Secondary',
            style: {
                width: '12%'
            }
        },
        {
            Header: 'Type',
            accessor: 'type',
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
            Header: 'Updated',
            accessor: 'updatedOn',
            Cell: ({ cell: { value } }) => (new Date(value)).toLocaleDateString(),
            style: {
                width: '15%'
            }
        }
    ]
    if (isMember) {
        cols.push({
            Header: ' ',
            id: 'remove',
            disableSortBy: true,
            accessor: function removeItem(rowdata) {
                return <button className="usa-button  usa-button--unstyled" onClick={() => dispatch(deletePattern(rowdata))}><span className="text-bold">Remove</span></button>
            }
        });
    }

    return cols;
}
