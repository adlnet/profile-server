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
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import ErrorValidation from '../controls/errorValidation';
import { useDispatch, useSelector } from 'react-redux';
import { Detail, } from '../DetailComponents';
import * as user_actions from "../../actions/user";
import { getOrganizations, removeMember, revokeMemberRequest } from "../../actions/organizations";
import ModalBoxWithoutClose from '../controls/modalBoxWithoutClose';
import api from "../../api"
export default function AccountDetails(props) {
    let dispatch = useDispatch();
    let userData = useSelector((store) => store.userData)
    const organizations = useSelector((state) => state.organizations);
    const isAdmin = userData.type === 'admin';
    const history = useHistory();
    const [showDialog, setShowDialog] = useState(false);
    const [orgToLeave, setOrgToLeave] = useState();
    const [isEditing, setIsEditing] = useState(false);


    useEffect(() => {
        dispatch(getOrganizations());
    }, [dispatch, userData]);

    const myOrgs = organizations && organizations.filter(org => org.members.find(mem => mem.user.uuid === userData.user.uuid));
    const myOrgRequests = organizations && organizations.filter(org => org.memberRequests.find(mem => mem.user.uuid === userData.user.uuid))

    function join() {
        history.push('/organization');
    }

    async function leaveWorkingGroup() {
        setShowDialog(false);
        const member = orgToLeave.members.find(mem => mem.user.uuid === userData.user.uuid);
        if (member && member.user.id)
            await dispatch(removeMember(member.user.id, orgToLeave.uuid))
        else {
            const candidate = orgToLeave.memberRequests.find(mem => mem.user.uuid === userData.user.uuid);
            if (candidate && candidate.user.id)
                await dispatch(revokeMemberRequest(candidate.user.id, orgToLeave.uuid));
        }

        await dispatch(user_actions.checkStatus())
        setOrgToLeave();
    }

    async function saveAccountEdits(newAccountDetails) {
        dispatch(user_actions.checkStatus())
        setIsEditing(false)
    }

    return (<>
        <div className="grid-container" style={{ padding: 0 }}>
            {
                isEditing ?
                    <MyAccountForm user={userData.user} isAdmin={isAdmin} saveAction={saveAccountEdits} cancelAction={() => setIsEditing(false)} />
                    :
                    <MyAccountDetails user={userData.user} isAdmin={isAdmin} editAction={() => setIsEditing(true)} />
            }
        </div>
        <div className="grid-container" style={{ padding: 0 }}>
            <div className="grid-row margin-top-6">
                <h1>My Working Groups</h1>
            </div>
            <MyWorkingGroupsTable orgs={myOrgs} orgReqs={myOrgRequests} user={userData.user} setShowDialog={setShowDialog} setOrgToLeave={setOrgToLeave}></MyWorkingGroupsTable>
            <div className="grid-row">
                <button className="usa-button" onClick={join}><i className="fa fa-users margin-right-05"></i>Join Working Group</button>
            </div>
        </div>

        {
            showDialog &&
            <ModalBoxWithoutClose show={setShowDialog}>
                <div className="grid-row">
                    <div className="grid-col">
                        <h3>Leave Working Group?</h3>
                    </div>
                </div>
                <div className="grid-row">
                    <div className="grid-col">
                        Are you sure you want to leave the working group?
                        </div>
                </div>
                <div className="grid-row">
                    <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                        <button className="usa-button submit-button" style={{ margin: "1.5em 0em" }} onClick={leaveWorkingGroup}>Leave</button>
                    </div>
                    <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                        <button className="usa-button usa-button--unstyled" onClick={() => setShowDialog(false)} style={{ margin: "2.3em 1.5em" }}><b>Cancel</b></button>
                    </div>
                </div>
            </ModalBoxWithoutClose>
        }
    </>);
}

function MyWorkingGroupsTable({ orgs, orgReqs, user, setShowDialog, setOrgToLeave }) {
    return <div className="grid-row">
        <table className="usa-table usa-table--borderless margin-top-0" width="100%">
            <thead>
                <tr>
                    <th width="45%" scope="col">Name</th>
                    <th width="30%" scope="col">Role</th>
                    <th width="25%" scope="col"></th>
                </tr>
            </thead>
            <tbody style={{ lineHeight: 3 }}>
                {!((orgs && orgs.length > 0) || (orgReqs && orgReqs.length > 0)) &&
                    <tr key={1}><td className="font-sans-xs" colSpan="6">You are not a member of any working groups.</td></tr>
                }
                {(orgReqs && orgReqs.length > 0)
                    && orgReqs.map((org) => <WorkingGroupRow org={org} user={user} key={org.id} pending={true} setShowDialog={setShowDialog} setOrgToLeave={setOrgToLeave} />)
                }
                {(orgs && orgs.length > 0)
                    && orgs.map((org) => <WorkingGroupRow org={org} user={user} key={org.id} setShowDialog={setShowDialog} setOrgToLeave={setOrgToLeave} />)
                }
            </tbody>
        </table>
    </div>
}

function WorkingGroupRow({ org, user, pending, setShowDialog, setOrgToLeave }) {
    let member = org.members.find(mem => mem.user.uuid === user.uuid);
    return (
        <tr >
            <th scope="row">
                <Link to={`/organization/${org.uuid}`}>
                    {org.name}
                </Link>
            </th>
            <td>
                {pending ?
                    <span className="text-italic">Pending approval</span>
                    : <span style={{ textTransform: "capitalize" }}>{member && member.level}</span>}
            </td>
            {
                member && member.level === 'owner' ?
                    <td></td>
                    :
                    pending ?
                        <td>
                            <button className="usa-button usa-button--unstyled" onClick={() => { setShowDialog(true); setOrgToLeave(org) }}>Cancel Request to Join</button>
                        </td>
                        :
                        <td>
                            <button className="usa-button usa-button--unstyled" onClick={() => { setShowDialog(true); setOrgToLeave(org) }}>Leave Working Group</button>
                        </td>
            }
        </tr>
    )
}

function MyAccountDetails({ user, isAdmin, editAction }) {
    return (<>
        <div className="grid-row margin-top-4">
            <h1>My Account</h1>
        </div>
        <div className="grid-row">
            <div className="grid-col-4">
                <Detail title='first name'>
                    {user.firstname}
                </Detail>
            </div>
            <div className="grid-col">
                <Detail title='email'>
                    {user.email}
                </Detail>
            </div>
        </div>
        <div className="grid-row">
            <div className="grid-col-4">
                <Detail title='last name'>
                    {user.lastname}
                </Detail>
            </div>
            {
                isAdmin &&
                <div className="grid-col-4">
                    <Detail title='Server role'>
                        Administrator
                    </Detail>
                </div>
            }
        </div>
        <div className="grid-row">
            <button className="usa-button" onClick={editAction}><i className="fa fa-pencil"></i> Edit Account</button>
        </div>
    </>)
}

function MyAccountForm({ user, isAdmin, saveAction, cancelAction }) {
    const [showPassword, setShowPassword] = useState();
    const [setPassword, setSetPassword] = useState();
    const [error, setError] = useState();
    function cancel() {
        setShowPassword(false);
        setSetPassword(false);
        cancelAction();
    }
    return (
        <Formik
            initialValues={{
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                newEmail: '',
                type: user.type,
                password: '',
                password2: ''
            }}
            validationSchema={Yup.object({
                email: Yup.string().email(),
                lastname: Yup.string()
                    .required('Required'),
                firstname: Yup.string()
                    .required('Required'),
                password: Yup.string(),
                password2: Yup.string()
                    .oneOf([Yup.ref('password'), null], "Passwords don't match")

            })}
            onSubmit={async (values) => {


                let res = await api.postJSON("/app/user/update", values);
                if (res.success) {
                    saveAction(values);
                } else {
                    setError(res.err)
                }


            }}
        >
            {(formikProps) => (
                <div className="display-flex flex-column flex-align-center margin-top-5">
                    <Form className="usa-form padding-x-4 padding-top-3 padding-bottom-4 border border-base-light" style={{ width: "100%", maxWidth: "100%" }}>
                        <div className="grid-row ">
                            <h3 className="margin-y-05">Edit Your Account Information</h3>
                        </div>
                        <fieldset className="usa-fieldset">
                            <div className="display-flex ">
                                <div className="grid-col padding-right-2">

                                    <ErrorValidation name="firstname" type="input">
                                        <label className="usa-label" htmlFor="firstname"><span className="text-secondary">*</span> <span className="details-label">First Name</span></label>
                                        <Field name="firstname" type="text" className="usa-input" id="input-firstname" aria-required="true" />
                                    </ErrorValidation>
                                    <ErrorValidation name="lastname" type="input">
                                        <label className="usa-label" htmlFor="lastname"><span className="text-secondary">*</span> <span className="details-label">Last Name</span></label>
                                        <Field name="lastname" type="text" className="usa-input" id="input-lastname" aria-required="true" />
                                    </ErrorValidation>
                                </div>
                                <div className="grid-col padding-left-2">

                                    <ErrorValidation name="email" type="input">
                                        <label className="usa-label" htmlFor="email"><span className="text-secondary">*</span> <span className="details-label">Email Address</span></label>
                                        <Field name="email" type="text" className="usa-input" id="input-email" aria-required="true" />
                                    </ErrorValidation>
                                    {setPassword && <><ErrorValidation name="password" type="input">
                                        <label className="usa-label" htmlFor="password"><span className="text-secondary">*</span> <span className="details-label">New Password</span></label>
                                        <Field name="password" type={showPassword ? "text" : "password"} className="usa-input" id="input-password" aria-required="true" />
                                    </ErrorValidation>
                                        <ErrorValidation name="password2" type="input">
                                            <label className="usa-label" htmlFor="password2"><span className="text-secondary">*</span> <span className="details-label">Re-enter new Password</span></label>
                                            <Field name="password2" type={showPassword ? "text" : "password"} className="usa-input" id="input-password" aria-required="true" />
                                        </ErrorValidation></>
                                    }
                                    {!setPassword && <>
                                        <label className="usa-label" htmlFor="password"><span className="text-secondary">*</span> <span className="details-label">Password</span></label>
                                        <div className="display-flex" style={{ justifyContent: "space-between" }}> <p>********</p>
                                            <button onClick={() => setSetPassword(!setPassword)} className="usa-button usa-button--unstyled" style={{ marginTop: "0.5em" }} type="button">Edit Password</button>
                                        </div>
                                    </>

                                    }
                                    {setPassword ? <div className="display-flex flex-column flex-align-end">
                                        <button onClick={() => setShowPassword(!showPassword)} className="usa-button usa-button--unstyled" style={{ marginTop: "0.5em" }} type="button">Show password</button>
                                    </div> : null}
                                </div>
                            </div>

                        </fieldset>
                        <div className="grid-row">
                            <button className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>Save Changes</button>
                            <button className="usa-button usa-button--unstyled" onClick={cancel} type="reset"><b>Cancel</b></button>
                        </div>
                        {error && <div className="grid-row">
                            <span className="usa-error-message" id="input-error-message" role="alert">{error}</span>
                        </div>}
                    </Form>
                </div>
            )}

        </Formik>
    )
}
