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
import api from "../../api";
import PagingTable from '../PagingTable';
import { useState } from 'react';
var objectPath = require("object-path");


export default function Users(props) {
   
    const user = useSelector((state) => state.userData.user);
  
    const [verificationRequests, setVerificationRequests] = useState([]);
   
    let [sortKey, setSortKey] = useState(null);
    let [sortOrder, setSortOrder] = useState(1);
    
   
    async function getVerificationRequests(){
        let newVerificationRequests = await api.getJSON("/app/admin/verificationRequests");

        if(sortKey)
        {
            newVerificationRequests.requests.sort((i,j) => {
                if(sortOrder == 1)
                return objectPath.get(i,sortKey) > objectPath.get(j,sortKey) ? 1 : -1
                if(sortOrder == -1)
                return objectPath.get(i,sortKey) < objectPath.get(j,sortKey) ? 1 : -1
            })
        }
        setVerificationRequests(newVerificationRequests.requests);
    }

    useEffect(() => {
        getVerificationRequests();
    }, [sortKey,sortOrder]);

    
    let columns = React.useMemo(() => getColumns(genSortHeader), [sortOrder,sortKey]);

    if(!user || !user.type == "admin")
    {
        return "You must be an admin to access this page."
    }


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

    return (<>
        <main id="main-content" className="grid-container padding-bottom-4">
            <div className="grid-row display-flex flex-row flex-align-end">
                <div className="grid-col">
                    <h1>Verify Profiles</h1>
                </div>
                
            </div >
            
            <div className="grid-row">
                <PagingTable
                    resourceType="verification requests"
                    columns={columns}
                    data={verificationRequests}
                    emptyMessage="There are no verification requests" 
                />
            </div>
        </main> </>
    );
}

function getColumns(genSortHeader) {
    const cols = [
        {
            Header: genSortHeader("Profile","name"),
            id: 'name',
            accessor: i => i,
            Cell: i => {  return <Link
                to={`/organization/${i.cell.value.organization.uuid}/profile/${i.cell.value.parentProfile.uuid}/version/${i.cell.value.uuid}`}
                        className="usa-link button-link"
                    >
                        <span>{i.cell.value.name}</span>
            </Link >},
            style: {
                width: '20%',
               
            },
        },
        {
            Header: 'Working Group',
            accessor: 'organization.name',
            style: {
                width: '20%',
            },
            cellStyle: {
               
            }
        },
        {
            Header: 'Requested by',
            id:"type",
            accessor: "requestedBy",
            style: {
                width: '20%',
               
            },
            cellStyle: {
                
            }
        },
        {
            Header: genSortHeader('Date Requested',"verificationRequest"),
            accessor: 'verificationRequest',
            Cell: ({ cell: { value } }) => value ? (new Date(value)).toLocaleDateString() : "Unknown",
            style: {
                width: '20%',
                
            },
            cellStyle: {
              
            }
        },
        {
            Header: "Verification",
            id: 'Verification',
            accessor: i => i,
            Cell: i => {  return <Link
                        to={`/organization/${i.cell.value.organization.uuid}/profile/${i.cell.value.parentProfile.uuid}/version/${i.cell.value.uuid}`}
                        className="usa-link button-link"
                    >
                        <span>Review Profile</span>
            </Link >},
            style: {
                width: '20%',
                textAlign:"right"
            },
            cellStyle: {
                width: '20%',
                textAlign:"right"
            },

        },
    ];

    return cols;
}
