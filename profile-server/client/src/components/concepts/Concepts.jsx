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
import { useRouteMatch, Route, Switch, Link, useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { putHarvest } from '../../actions/profiles';
import { deleteConceptProp } from '../profiles/ProfileImportQueue';

import CreateConcept from "./CreateConcept";
import AddConcepts from './AddConcepts'
import { createConcept, loadProfileConcepts } from "../../actions/concepts";
import ConceptDetail from "./ConceptDetails"
import SortingTable from '../SortingTable';

export default function Concepts({ isMember, isCurrentVersion, isOrphan }) {
    const { path, url } = useRouteMatch();
    const dispatch = useDispatch();
    const location = useLocation();  
    const history = useHistory();
    const { selectedProfileVersionId, selectedProfileVersion } = useSelector(state => state.application);

    useEffect(() => {
        dispatch(loadProfileConcepts(selectedProfileVersionId));
    }, [selectedProfileVersionId])

    const concepts = useSelector((state) => state.concepts)

    let data = React.useMemo(() => concepts, [concepts]);
    let importedConcept = location.state && location.state ? {...location.state} : null;
    let columns = React.useMemo(() => getColumns(selectedProfileVersionId), [selectedProfileVersionId]);

    function onCreateConcept(concept) {
        dispatch(createConcept(concept));
        
        if(importedConcept){ 
            const { concept, updateHarvest } = importedConcept;
            dispatch(putHarvest(deleteConceptProp(updateHarvest, concept.groupIndex, concept.conceptType)));
            history.goBack();
        }else{
            history.push(url);
        }      
    }
    function onCreateCancel(){
        importedConcept ? history.goBack() : history.push(url)
    }

    return (
        <div>
            <Switch>
                <Route exact path={path}>
                    <div className="grid-row">
                        <div className="desktop:grid-col">
                            <h2 style={{ marginBottom: 0 }}>Concepts</h2>
                        </div>
                        {isMember && isCurrentVersion &&
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
                        }
                    </div>
                    <div className="grid-row margin-top-1">
                        <div className="grid-col text-base font-ui-2xs">
                            Concepts are the verbs, activity types, attachment usage types and more that are used or referenced in statement templates.
                        </div>
                    </div>
                    <div className="grid-row margin-top-05">
                        <div className="grid-col text-base font-ui-2xs">
                            <span className="text-italic">Note: When exporting, not all concepts listed here will be included in the JSON-LD. Only the concepts created by this profile will be included in the JSON-LD.</span>
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
                    <CreateConcept rootUrl={url} onCancel={onCreateCancel} onCreate={onCreateConcept} importedConcept={importedConcept}></CreateConcept>
                </Route>
                <Route exact path={`${path}/add`}>
                    <AddConcepts rootUrl={url} addToName="Profile"></AddConcepts>
                </Route>
                <Route path={`${path}/:conceptId`}>
                    <ConceptDetail isMember={isMember} isCurrentVersion={isCurrentVersion} isOrphan={isOrphan} />
                </Route>

            </Switch>
        </div>
    );
}

function getColumns(selectedProfileVersionId) {
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
                        to={`concepts/${uuid}`}
                        className="usa-link button-link"
                    >
                        <span>{value}</span>
                    </Link >
                )
            },
            style: {
                width: '35%'
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
                width: '23%'
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
                width: '12%'
            }
        }
    ];

    return cols;
}
