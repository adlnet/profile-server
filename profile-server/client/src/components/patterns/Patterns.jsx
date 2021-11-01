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
import { Route, Switch, useRouteMatch, NavLink, Link, Redirect } from 'react-router-dom';
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
    let patterns = useSelector((state) => state.patterns);

    // filter out draft components if the viewer is not a member of the wg
    if (!props.isMember && patterns) patterns = patterns.filter(p => p.parentProfile && p.parentProfile.state !== 'draft');

    useEffect(() => {
        dispatch(loadProfilePatterns(selectedProfileVersionId));
    }, [selectedProfileVersionId])

    let data = React.useMemo(() => patterns, [patterns]);
    let columns = React.useMemo(() => getColumns(dispatch, props.isMember, props.isCurrentVersion, selectedProfileVersionId), [props.isMember, props.isCurrentVersion, selectedProfileVersionId]);

    return (<>
        <ErrorBoundary errorType="patterns" />
        <Switch>
            <Route exact path={path}>
                <div className="grid-row">
                    <div className="desktop:grid-col">
                        <h2 style={{ marginBottom: 0 }}>Patterns</h2>
                    </div>
                    {props.isMember && props.isCurrentVersion &&
                        <div className="grid-col display-flex flex-column flex-align-end">
                            <NavLink exact
                                to={`${url}/add`}
                                className="usa-button margin-top-2 margin-right-0">
                                <i className="fa fa-plus margin-right-05"></i> <span> Add Pattern</span>
                            </NavLink>
                        </div>
                    }
                </div>
                <div className="grid-row">
                    <SortingTable
                        {...props}
                        columns={columns}
                        data={data}
                        emptyMessage="There are no patterns associated with this profile. Add a pattern to define relationships between your xAPI statements." />
                </div>
            </Route>
            <Route exact path={`${path}/add`}>
                {(props.isMember && props.isCurrentVersion) ?
                    <AddPattern root_url={url} />
                    : <Redirect to={url} />
                }
            </Route>
            <Route path={`${path}/create`}>
                {(props.isMember && props.isCurrentVersion) ?
                    <CreatePattern {...props} root_url={url} />
                    : <Redirect to={url} />
                }
            </Route>
            <Route path={`${path}/:patternId`}>
                <PatternDetail {...props} root_url={url} isOrphan={props.isOrphan} />
            </Route>
            {/* <Redirect from="/" to="" /> */}
        </Switch>
    </>);
}

function getColumns(dispatch, isMember, isCurrentVersion, selectedProfileVersionId) {
    const cols = [
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
            Header: 'Profile',
            accessor: 'parentProfile.name',
            style: {
                width: '18%'
            }
        },
        {
            Header: 'Status',
            accessor: (orow, rowidx, row) => {
                return row.original.isDeprecated ? 'Deprecated' : row.original.parentProfile.state === 'draft' ? 'Unpublished' : 'Published';
            },
            Cell: function Status({ cell: { value } }) {
                return value
            },
            style: {
                width: '15%'
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
    // if (isMember && isCurrentVersion) {
    //     cols.push({
    //         Header: ' ',
    //         id: 'remove',
    //         disableSortBy: true,
    //         accessor: function removeItem(rowdata) {
    //             return <button className="usa-button  usa-button--unstyled" onClick={() => dispatch(deletePattern(rowdata))}><span className="text-bold">Remove</span></button>
    //         }
    //     });
    // }

    return cols;
}
