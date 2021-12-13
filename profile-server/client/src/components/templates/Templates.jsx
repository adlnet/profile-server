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
import { useRouteMatch, Switch, Route, NavLink, Link, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";

import AddTemplate from "./AddTemplate";
import Template from "./Template";
import CreateTemplateForm from "./CreateTemplateForm";
import SortingTable from '../SortingTable';
import { loadProfileTemplates } from "../../actions/templates";

export default function Templates({ isMember, isCurrentVersion, isOrphan }) {
    const { url, path } = useRouteMatch();
    const dispatch = useDispatch();
    const { selectedProfileVersionId, selectedProfileId } = useSelector(state => state.application);
    let templates = useSelector((state) => state.templates);

    // filter out draft components if the viewer is not a member of the group
    if (!isMember && templates) templates = templates.filter(t => t.parentProfile && t.parentProfile.state !== 'draft')

    useEffect(() => {
        dispatch(loadProfileTemplates(selectedProfileVersionId));
    }, [selectedProfileVersionId]);

    let data = React.useMemo(() => templates, [templates]);
    let columns = React.useMemo(() => getColumns(selectedProfileId), [selectedProfileId]);

    return (
        <>
            <Switch>
                <Route exact path={path}>
                    <div className="grid-row">
                        <div className="desktop:grid-col">
                            <h2 style={{ marginBottom: 0 }}>Statement Templates</h2>
                        </div>
                        {isMember && isCurrentVersion &&
                            <div className="grid-col display-flex flex-column flex-align-end">
                                <NavLink exact
                                    to={`${url}/add`}
                                    className="usa-button margin-top-2 margin-right-0">
                                    <i className="fa fa-plus margin-right-05"></i> <span> Add Statement Template</span>
                                </NavLink>
                            </div>
                        }
                    </div>
                    <div className="grid-row">
                        <SortingTable
                            columns={columns}
                            data={data}
                            emptyMessage="There are no statement templates associated with this profile." />
                    </div>
                </Route>
                <Route exact path={`${path}/add`}>
                    {(isMember && isCurrentVersion) ?
                        <AddTemplate rootUrl={url} />
                        : <Redirect to={url} />
                    }
                </Route>
                <Route exact path={`${path}/create`}>
                    {(isMember && isCurrentVersion) ?
                        <CreateTemplateForm rootUrl={url} />
                        : <Redirect to={url} />
                    }
                </Route>
                <Route path={`${path}/:templateId`}>
                    <Template isMember={isMember} isCurrentVersion={isCurrentVersion} isOrphan={isOrphan} />
                </Route>
            </Switch>
        </>
    );
}


function getColumns() {
    const cols = [
        {
            Header: 'Name',
            id: 'name',
            accessor: 'name',
            Cell: function NameLink(
                { cell: { value },
                    cell: { row: { original: { uuid, description } } } }
            ) {
                return (<>
                    <Link
                        to={`templates/${uuid}`}
                        className="usa-link button-link"
                    >
                        <span>{value}</span>
                    </Link >
                    <div className="font-ui-3xs">{description}</div>
                </>)
            },
            cellStyle: {
                width: '35%',
                paddingRight: "2em"
            }
        },
        {
            Header: 'Required Concepts',
            Cell: getDeterminingProperties,
            cellStyle: {
                width: '20%'
            }
        },
        {
            Header: 'Profile',
            accessor: 'parentProfile.name',
            cellStyle: {
                width: '20%'
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
            cellStyle: {
                width: '15%'
            }
        }
    ]

    return cols;
}

function getDeterminingProperties({ row: { original } }) {
    const template = original;
    const propertyTypes = [
        'verb', 'objectActivityType', 'contextCategoryActivityType', 'contextGroupingActivityType',
        'contextOtherActivityType', 'contextParentActivityType', 'attachmentUsageType'
    ]

    let determiningProperties = propertyTypes
        .filter(propertyType => (template[propertyType] ?
            (Array.isArray(template[propertyType]) ?
                (template[propertyType].length > 0 ?
                    true : false) : true) : false))
        .map(propertyType => ({ propertyType: propertyType, properties: template[propertyType] }));

    let links = [];
    if (determiningProperties && determiningProperties.length) {
        for (const c of determiningProperties) {
            if (c.properties.parentProfile && c.properties.parentProfile.uuid) {
                links.push(<br key={`br-${c.name}`} />)
                links.push(<Link key={c.properties.uuid} to={`/profile/${c.properties.parentProfile.uuid}/concepts/${c.properties.uuid}`}>{c.properties.name}</Link>)
            }
        }
    }

    return links.slice(1);
}