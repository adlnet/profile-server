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
import { clearOrganizationSearchResults, getOrganizations, searchOrganizations } from '../actions/organizations';
import PagingTable from '../components/PagingTable';
import { useState } from 'react';
import api from "../api";
import MostViewedGraph from "../components/controls/MostViewedGraph.jsx";
import MostExportedGraph from "../components/controls/MostExportedGraph.jsx"
import MetricCount from "../components/controls/metricCount.jsx";

var objectPath = require("object-path");



function getCols( genSortHeader)
{


const cols = [
    {
        Header: genSortHeader("Profiles","name"),
        id: 'name',
        accessor: i => i,
        Cell: function NameLink(
            data
        ) {
            let value = data.cell.value
            return (
                <Link
                    to={`/profile/${value.parentProfile.uuid}`}
                    className="usa-link button-link"
                >
                    <span>{value.name}</span>
                </Link >
            )
        },
        style: {
            width: '30%'
        }
    },
    {
        Header: genSortHeader("Working Group","organization.name"),
        id: 'organization',
        accessor: i => i,
        Cell: function NameLink(
            data
        ) {
            let value = data.cell.value
            return (
                <Link
                    to={`organization/${value.organization.uuid}/`}
                    className="usa-link button-link"
                >
                    <span>{value.organization.name}</span>
                </Link >
            )
        },
        style: {
            width: '30%'
        }
    },

    {
        Header: genSortHeader("Updated","updatedOn"),
        accessor: 'updatedOn',
        Cell: ({ cell: { value } }) => value ? (new Date(value)).toLocaleDateString() : "Unknown",
        style: {
            width: '16%',
            textAlign: 'center'
        },
        cellStyle: {
            textAlign: 'center'
        }
    },
    {
        Header: <div><div>Views</div><div className="headerSub">Last 30 Days</div></div>,
        Cell: ({cell:{value}}) => <MetricCount url={`/metrics/profile/${value.parentProfile.uuid}/viewTotal`} ></MetricCount>,
        id:"views",
        accessor: i => i,
        style: {
            width: '12%',
            textAlign: 'center'
        },
        cellStyle: {
            textAlign: 'center'
        }
    },
    {
        Header: <div><div>Exports</div><div className="headerSub">Last 30 Days</div></div>,
        Cell: ({cell:{value}}) => <MetricCount url={`/metrics/profile/${value.parentProfile.uuid}/exportTotal`} ></MetricCount>,
        id:"exports",
        accessor: i => i,
        style: {
            width: '12%',
            textAlign: 'center'
        },
        cellStyle: {
            textAlign: 'center'
        }
    },
];
return cols
}

export default function Profiles(props) {

    let [profiles, setProfiles] = useState([]);
    let [sortKey, setSortKey] = useState(null);
    let [sortOrder, setSortOrder] = useState(1);

    function gotData(p)  {

        if(sortKey)
        {
             p.sort((i,j) => {
                if(sortOrder == 1)
                return objectPath.get(i,sortKey) > objectPath.get(j,sortKey) ? 1 : -1
                if(sortOrder == -1)
                return objectPath.get(i,sortKey) < objectPath.get(j,sortKey) ? 1 : -1
            })
        }
        setProfiles(p)
        
    }

    useEffect(() => {
        api.getPublishedProfiles().then(gotData)
    }, [sortKey,sortOrder]);

    function sort(accessor,order)
    {
       
        setSortKey(accessor);
        setSortOrder(order);
       
     
    }
    function genSortHeader(title,accessor)
    {
        return function SortHeader()
        {
            return <span onClick={()=>{sort(accessor,sortOrder * -1)}}>{title}
            {
                sortKey == accessor && sortOrder == 1 && <i className="fa fa-arrow-up"></i> 
            }
            {
                sortKey == accessor && sortOrder == -1 && <i className="fa fa-arrow-down"></i> 
            }
            </span>
        }
    }

    let columns = React.useMemo(() => getCols(genSortHeader), [sortOrder,sortKey]);



    //<LoadingSpinner></LoadingSpinner>

    return (<>
        <main id="main-content" >
            <div className="grid-container ">


                <div className="grid-row display-flex flex-row flex-align-end">
                    <div className="grid-col">
                        <h1>Profiles</h1>
                    </div>
                    <div className="grid-col display-flex flex-column flex-align-end">
                        <Link
                            to="/profiles/create"
                        >
                            <button className="usa-button margin-y-2 margin-right-0">
                                <i className="fa fa-plus margin-right-05"></i>
                            Create Profile
                        </button>
                        </Link>
                    </div>
                </div >
            </div>
            <div className="usa-footer__primary-section">

                <div className="grid-container">
                    <div className="grid-row display-flex flex-row flex-align-end bg1">
                        <div className="grid-col">
                            <MostViewedGraph a></MostViewedGraph >
                        </div>
                        <div className="grid-col">
                            <MostExportedGraph b></MostExportedGraph>
                        </div>
                    </div >
                </div>
            </div>
            <div className="grid-container padding-bottom-4">
                <div className="grid-row display-flex flex-row flex-align-end">
                    <div className="grid-col">
                        <h2>All Published Profiles</h2>
                    </div>
                    <div className="grid-col display-flex flex-column flex-align-end">

                        <div className="usa-checkbox">
                            <input className="usa-checkbox__input" id="washington" type="checkbox" name="historical-figures-1" value="washington"></input>
                            <label className="usa-checkbox__label" htmlFor="washington">Show Verified Only</label>
                        </div>

                    </div>
                </div >

                <div className="grid-row">
                    <PagingTable
                        columns={columns}
                        data={profiles}
                        emptyMessage="There are published profiles"
                        showPageHeader={false}
                        clearSearch={() => { }}
                    />
                </div>
            </div>
        </main> </>
    );
}

