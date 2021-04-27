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
    const [searchterm, setSearchterm] = useState("");
    const [users, setUsers] = useState([]);
   
    let [sortKey, setSortKey] = useState(null);
    let [sortOrder, setSortOrder] = useState(1);
    
   
    async function getUsers(){
        let newUsers = await api.getJSON("/app/admin/users?search="+searchterm);

        if(sortKey)
        {
            newUsers.users.sort((i,j) => {
                if(sortOrder == 1)
                return objectPath.get(i,sortKey) > objectPath.get(j,sortKey) ? 1 : -1
                if(sortOrder == -1)
                return objectPath.get(i,sortKey) < objectPath.get(j,sortKey) ? 1 : -1
            })
        }
        setUsers(newUsers.users);
    }

    useEffect(() => {
        getUsers();
    }, [sortKey,sortOrder,searchterm]);

    

    
    let columns = React.useMemo(() => getColumns(genSortHeader), [sortOrder,sortKey]);

    if(!user || !user.type == "admin")
    {
        return "You must be an admin to access this page."
    }

    const clearSearch = () => {
       
        setSearchterm('')
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
                    <h1>Manage Users</h1>
                </div>
                
            </div >
            <div className="grid-row bg-base-lightest">
                <div className="grid-col-12 padding-3">

                    <Formik
                        initialValues={{ search: '', }}
                        validationSchema={Yup.object({
                            search: Yup.string()
                                .required('Required')
                        })}
                        onSubmit={(values, { resetForm }) => {
                            setSearchterm(values.search);
                            
                            resetForm({ values: '' })
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
                                <form id="search">
                                    <div className="usa-search usa-search--big">
                                        <div role="search" className={`usa-form-group ${errors.search && touched.search ? "usa-form-group--error" : ""}`} style={{ marginTop: '0' }}>
                                            {
                                                errors.search && touched.search && (
                                                    <span className="usa-error-message padding-right-1" role="alert">{errors.search}</span>
                                                )
                                            }
                                            <label className="usa-sr-only" htmlFor="search-field">Search</label>
                                            <input className={`usa-input ${errors.search && touched.search ? "usa-input--error" : ""}`}
                                                id="search-field"
                                                type="search"
                                                name="search"
                                                placeholder="Search for an existing user"
                                                style={{ maxWidth: "100%", paddingLeft: "1em" }}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.search} />
                                            <button className="usa-button" type="submit" onClick={handleSubmit} style={{ marginTop: 0, paddingLeft: "1em", paddingRight: "1em" }}>
                                                <span className="usa-search__submit-text"
                                                    style={{ whiteSpace: "nowrap", fontSize: "1.15rem", display: "flex", alignItems: "center" }}>Search Users</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                    </Formik>
                </div>
            </div>

            <div className="grid-row">
                <PagingTable
                    resourceType="users"
                    columns={columns}
                    data={users}
                    emptyMessage="There are no users"
                    searchTerm={searchterm}
                    clearSearch={clearSearch}
                />
            </div>
        </main> </>
    );
}

function getColumns(genSortHeader) {
    const cols = [
        {
            Header: genSortHeader("Name","lastname"),
            id: 'name',
            accessor: i => i,
            Cell: i => {  return <Link
                        to={`users/${i.cell.value.uuid}`}
                        className="usa-link button-link"
                    >
                        <span>{i.cell.value.lastname}, {i.cell.value.firstname}</span>
            </Link >},
            style: {
                width: '21%',
               
            },
        },
        {
            Header: 'Email',
            accessor: 'email',
            style: {
                width: '30%',
              
            },
            cellStyle: {
               
            }
        },
        {
            Header: 'Admin',
            id:"type",
            accessor: i => i,
            Cell: i => <span>{i.cell.value.type === "admin" ? "Admin" :""}</span>,
            style: {
                width: '11%',
               
            },
            cellStyle: {
                
            }
        },
        {
            Header: 'Date Added',
            accessor: '_created',
            Cell: ({ cell: { value } }) => value ? (new Date(value)).toLocaleDateString() : "Unknown",
            style: {
                width: '38%',
                textAlign:"right"
            },
            cellStyle: {
                textAlign:"right"
            }
        },
    ];

    return cols;
}
