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
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import debounce from 'debounce-promise';
import { Autocomplete, TextField } from '@cmsgov/design-system';
import { Formik } from 'formik';

import API from '../../api';
import { addMember, removeMember, selectOrganization, updateMember, denyMemberRequest, approveMember } from "../../actions/organizations";
import { useState } from 'react';
import { Detail } from '../DetailComponents';
import ModalBoxWithoutClose from '../controls/modalBoxWithoutClose';



export default function AddMember({ url }) {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();

    let member;
    let pending;

    if (location && location.state) {
        member = location.state.member;
        pending = location.state.pending;
    }

    const [users, setUsers] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const organization = useSelector((state) => state.application.selectedOrganization);

    function handleCancel() {
        history.push(url);
    }

    async function _removeMember() {
        await dispatch(removeMember(member.user.id))
        await dispatch(selectOrganization(organization.uuid));
        history.push(url);
    }

    async function _denyMember() {
        dispatch(denyMemberRequest(member.user.id));
        await dispatch(selectOrganization(organization.uuid));
        history.push(url);
    }

    const searchUsersDebounce = debounce(API.searchUsers.bind(API), 300);

    const searchUsers = async (text) => {
        if (!text) return setUsers([]);

        let res = await searchUsersDebounce(text);

        if (!res || !res.length) return setUsers([]);

        // remove users already in this organization
        res = res.filter(user => organization.members.find(member => member.user.id === user._id) === undefined);

        // remove users already in the member request queue
        res = res.filter(user => organization.memberRequests.find(member => member.user.id === user._id) === undefined);

        setUsers(res.map(v => ({ id: v._id, name: v.username + " - " + (v.fullname || "Name Not Provided") })))
    }

    if (!organization) {
        return '';
    }
    return (
        <div className="container">
            <Formik
                initialValues={{ user: (member && member.user) || '', role: (member && member.level) || 'member' }}
                onSubmit={async (values) => {
                    if (pending)
                        await dispatch(approveMember({ _id: values.user.id }, values.role));
                    else if (member)
                        await dispatch(updateMember({ _id: values.user.id }, values.role))
                    else
                        await dispatch(addMember({ _id: values.user.id }, values.role));
                    await dispatch(selectOrganization(organization.uuid));
                    history.push(url);
                }}
            >
                {(props, form) => (<>
                    <div className="grid-row">
                        <div className="grid-col-12" style={{ marginTop: '2em', marginBottom: '2em' }}>
                            <Link to={url}><span className="details-label">members</span></Link> <i className="fa fa-angle-right"></i>
                            {
                                !member ?
                                    <h2 style={{ marginBottom: 0, marginTop: '.5em' }}>Add Member</h2>
                                    :
                                    pending ? <h2 style={{ marginBottom: 0, marginTop: '.5em' }}>Review Member Request</h2> :
                                        <h2 style={{ marginBottom: 0, marginTop: '.5em' }}>Edit Member</h2>
                            }
                        </div>
                        <form className="usa-form" style={{ width: "100%", maxWidth: "none" }}>
                            <div className="grid-col-12 border-1px border-base-lighter padding-bottom-8 padding-left-4">
                                {
                                    member ?
                                        <div style={{ paddingTop: "1.5em" }}>
                                            <Detail title='username'>
                                                {props.values.user.username}
                                            </Detail>
                                            <Detail title='name'>
                                                {props.values.user.fullname != undefined ? props.values.user.fullname : "Not Made Public"}
                                            </Detail>
                                        </div>
                                        :
                                        <Autocomplete
                                            items={users}
                                            loadingMessage="Loading"
                                            noResultsMessage="No results found"
                                            clearSearchButton={false}
                                            onChange={(selectedItem) => props.setFieldValue('user', selectedItem)}
                                            onInputValueChange={(inputVal) => searchUsers(inputVal)}
                                        >
                                            <TextField
                                                label={<label className="usa-label" htmlFor="user"><span className="details-label">user to add</span></label>}
                                                name="user"
                                                style={{ border: "1px solid #000000", borderRadius: "0" }}
                                            />
                                        </Autocomplete>
                                }
                                <label className="usa-label" htmlFor="role"><span className="details-label">Assign role in group</span></label>
                                <select
                                    className="usa-select"
                                    name="role"
                                    id="role"
                                    style={{ maxWidth: "fit-content" }}
                                    onChange={props.handleChange}
                                    value={props.values.role || "member"}
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Group Admin</option>
                                </select>
                            </div>
                            <div className="grid-col-12">
                                <button
                                    type="button"
                                    onClick={props.handleSubmit}
                                    className="usa-button margin-right-0 text-no-wrap"
                                    disabled={!(props.values.user)}
                                >
                                    {!member ? 'Add Member' : pending ? 'Approve Member' : 'Save Changes'}
                                </button>

                                <button className="usa-button usa-button--unstyled" onClick={handleCancel} style={{ margin: "2em 2em" }} type="button"><b>Cancel</b></button>

                                {
                                    member && !pending ?
                                        <button type="button" className="usa-button usa-button--unstyled pin-right text-secondary-darker" onClick={() => setShowConfirmation(true)} style={{ margin: "2em 0em 2em 2em" }}><b>Remove Member</b></button>
                                        : pending ?
                                            <button type="button" className="usa-button usa-button--unstyled pin-right text-secondary-darker" onClick={() => setShowConfirmation(true)} style={{ margin: "2em 0em 2em 2em" }}><b>Deny member request</b></button>
                                            : ''
                                }
                            </div>
                        </form>
                    </div>


                </>)}
            </Formik>
            {
                member &&
                <ModalBoxWithoutClose show={showConfirmation}>
                    <div className="grid-row">
                        <div className="grid-col">
                            {
                                pending ?
                                    <h3>Deny Member Request</h3>
                                    :
                                    <h3>Remove Member</h3>
                            }
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-col">
                            {
                                pending ?
                                    <span>Are you sure you want to deny <strong>{member.user.username}</strong> from joining <strong>{organization.name}</strong>?</span>
                                    :
                                    <span>Are you sure you want to remove <strong>{member.user.username}</strong> from <strong>{organization.name}</strong>?</span>

                            }
                        </div>
                    </div>
                    <div className="grid-row">
                        <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                            {
                                pending ?
                                    <button className="usa-button submit-button" style={{ margin: "1.5em 0em" }} onClick={_denyMember}>Deny</button>
                                    :
                                    <button className="usa-button submit-button" style={{ margin: "1.5em 0em" }} onClick={_removeMember}>Remove Now</button>
                            }
                        </div>
                        <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                            <button className="usa-button usa-button--unstyled" onClick={() => setShowConfirmation(false)} style={{ margin: "2.3em 1.5em" }}><b>Cancel</b></button>
                        </div>
                    </div>
                </ModalBoxWithoutClose>
            }

        </div>
    )
}
