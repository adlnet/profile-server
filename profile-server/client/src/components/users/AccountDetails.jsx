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
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';

const MakePublicCheckbox = ({ field }) => {

    return (
        <div className="usa-checkbox">
            <input {...field} type="checkbox" style={{width: "20px", height: "20px", margin: "5px"}}/>
            <span className="details-label">Show Your Name?</span>
        </div>  
    );
}

export default function AccountDetails(props) {
    let dispatch = useDispatch();
    let userData = useSelector((store) => store.userData)
    const organizations = useSelector((state) => state.organizations);
    const isAdmin = userData.type === 'admin';
    const needsUsername = !userData.user.usernameChosen;

    const history = useHistory();
    const [showDialog, setShowDialog] = useState(false);
    const [orgToLeave, setOrgToLeave] = useState();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        dispatch(getOrganizations());
    }, [dispatch, userData]);

    const myOrgs = organizations && organizations.filter(org => Array.isArray(org.members) ? org.members.find(mem => mem.user.uuid === userData.user.uuid) : []);
    const myOrgRequests = organizations && organizations.filter(org => Array.isArray(org.memberRequests) ? org.memberRequests.find(mem => mem.user != undefined && mem.user.uuid === userData.user.uuid) : [])

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
        let res = await api.postJSON("/app/user/update", newAccountDetails);
        if (res.success) {
            dispatch(user_actions.checkStatus());
            setIsEditing(false);
        }
        return res;
    }

    return (<>
        <div className="grid-container" style={{ padding: 0 }}>
            {
                isEditing ?
                    <MyAccountForm user={userData.user} needsUsername={needsUsername} isAdmin={isAdmin} saveAction={saveAccountEdits} cancelAction={() => setIsEditing(false)} />
                    :
                    <MyAccountDetails user={userData.user} needsUsername={needsUsername} isAdmin={isAdmin} editAction={() => setIsEditing(true)} />
            }
        </div>
        <div className="grid-container" style={{ padding: 0 }}>
            <div className="grid-row margin-top-6">
                <h1>My Working Groups</h1>
            </div>
            <MyWorkingGroupsTable MyWorkingGroupsTable orgs={myOrgs} orgReqs={myOrgRequests} user={userData.user} setShowDialog={setShowDialog} setOrgToLeave={setOrgToLeave}></MyWorkingGroupsTable>
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

export function MyWorkingGroupsTable({ orgs, adminView, orgReqs, user, setShowDialog, setOrgToLeave }) {
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
                    <tr key={1}><td className="font-sans-xs" colSpan="6">
                        {!adminView && "You are not a member of any working groups."}
                        {adminView && "User is not a member of any working groups."}
                    </td></tr>
                }
                {(orgReqs && orgReqs.length > 0)
                    && orgReqs.map((org) => <WorkingGroupRow adminView={adminView} org={org} user={user} key={org.id} pending={true} setShowDialog={setShowDialog} setOrgToLeave={setOrgToLeave} />)
                }
                {(orgs && orgs.length > 0)
                    && orgs.map((org) => <WorkingGroupRow adminView={adminView} org={org} user={user} key={org.id} setShowDialog={setShowDialog} setOrgToLeave={setOrgToLeave} />)
                }
            </tbody>
        </table>
    </div>
}

export function WorkingGroupRow({ org, user, adminView, pending, setShowDialog, setOrgToLeave }) {
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
                adminView ?
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

export function MyAccountDetails({ user, needsUsername, isAdmin, editAction, adminView }) {
    return (<>
        <div className="grid-row margin-top-4">
            {!adminView && <h1>My Account</h1>}


        </div>
        <div className="grid-row ">
            {adminView && <h3>Account Information</h3>}
            {
                isAdmin &&
                <div className="grid-col-4">
                    <Detail title='Server role'>
                        (Administrator)
                    </Detail>
                </div>
            }
        </div>
        <div className="grid-row">
            <div className="grid-col-4">
                <Detail title='first name'>
                    {user.firstname}
                </Detail>
            </div>
            <div className="grid-col">
                <Detail title='username'>
                    {user.username}
                </Detail>
            </div>
        </div>
        <div className="grid-row">
            <div className="grid-col-4">
                <Detail title='last name'>
                    {user.lastname}
                </Detail>
            </div>
            <div className="grid-col">
                <Detail title='email'>
                    {user.email}
                </Detail>
            </div>
        </div>
        <div className="grid-row">
            <button className="usa-button" onClick={editAction}><i className="fa fa-pencil"></i> Edit Account</button>
            {
                needsUsername && 
                <a className="usa-button usa-button--accent-cool" href="/user/username"><i className="fa fa-pencil"></i> Select Username</a>
            }
        </div>
    </>)
}

export function MyAccountForm({ user, currentUser, isAdmin, saveAction, cancelAction, adminView }) {
    const [showPassword, setShowPassword] = useState();
    const [setPassword, setSetPassword] = useState();
    const [error, setError] = useState();
    const [showModal, setShowModal] = useState(false);
    function cancel() {
        setShowModal(false);
        setShowPassword(false);
        setSetPassword(false);
        cancelAction();
    }
    return (<>
        <Formik
            initialValues={{
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                publicizeName: !!user.publicizeName,
                newEmail: '',
                type: user.type,
                password: '',
                password2: '',
                admin: user.type === "admin",
                needsUsername: !user.usernameChosen
            }}
            validationSchema={Yup.object({
                publicizeName: Yup.bool(),
                username: Yup.string(),
                email: Yup.string().email(),
                lastname: Yup.string()
                    .required('Required'),
                firstname: Yup.string()
                    .required('Required'),
                password: Yup.string(),
                password2: Yup.string()
                    .oneOf([Yup.ref('password'), null], "Passwords don't match")

            })}
            validateOnMount={true}
            onSubmit={async (values) => {
                if (values.admin) {
                    values.type = "admin";
                    delete values.admin;
                } else {
                    values.type = "user";
                }
                let res = await saveAction(values);

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
                            <h3 className="margin-y-05">
                                {!adminView && "Edit Your Account Information"}
                                {adminView && "Edit Account Information"}
                            </h3>
                        </div>
                        <fieldset className="usa-fieldset">
                            <div className="display-flex ">
                                <div className="grid-col padding-right-2">

                                    <ErrorValidation name="username" type="input">
                                        <label className="usa-label" htmlFor="firstname"><span className="text-secondary">*</span> <span className="details-label">Username</span></label>
                                        <Field name="username" type="text" disabled className="usa-input" id="input-username" aria-required="true" />
                                    </ErrorValidation>
                                    <ErrorValidation name="firstname" type="input">
                                        <label className="usa-label" htmlFor="firstname"><span className="text-secondary">*</span> <span className="details-label">First Name</span></label>
                                        <Field name="firstname" type="text" className="usa-input" id="input-firstname" aria-required="true" />
                                    </ErrorValidation>
                                    <ErrorValidation name="lastname" type="input">
                                        <label className="usa-label" htmlFor="lastname"><span className="text-secondary">*</span> <span className="details-label">Last Name</span></label>
                                        <Field name="lastname" type="text" className="usa-input" id="input-lastname" aria-required="true" />
                                    </ErrorValidation>
                                    <br/>
                                    <ErrorValidation name="publicizeName" type="input">
                                        <Field 
                                            name="publicizeName" 
                                            type="checkbox" 
                                            checked={formikProps.values.publicizeName}
                                            component={MakePublicCheckbox} 
                                        />
                                        <br/>
                                        <span className="usa-checkbox__label-description text-light">
                                            Enabling this will cause your name to be publicly visible with your profile.  
                                            If unchecked, only your username will be visible.
                                        </span>
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
                            {adminView && <div className="display-flex ">
                                <div className="grid-col padding-right-2">

                                    <div className="usa-checkbox">
                                        <Field className="usa-checkbox__input" id="isAdmin" type="checkbox" name="admin" disabled={user.uuid === currentUser.uuid}></Field>
                                        <label className="usa-checkbox__label" htmlFor="isAdmin">Has admin permissions for the server</label>
                                    </div>

                                </div>
                            </div>}

                        </fieldset>
                        <div className="grid-row">
                            <ValidationControlledSubmitButton errors={formikProps.errors} className="usa-button submit-button" type="button" onClick={formikProps.handleSubmit}>Save Changes</ValidationControlledSubmitButton>
                            <button className="usa-button usa-button--unstyled" onClick={() => setShowModal(true)} type="reset"><b>Cancel</b></button>
                        </div>
                        {error && <div className="grid-row">
                            <span className="usa-error-message" id="input-error-message" role="alert">{error}</span>
                        </div>}
                    </Form>
                </div>
            )}

        </Formik>
        <ModalBoxWithoutClose show={showModal}>
            <div className="grid-row">
                <div className="grid-col">
                    <h3>Discard Changes</h3>
                </div>
            </div>
            <div className="grid-row">
                <div className="grid-col">
                    <span>Are you sure you want to discard the changes you have made?</span>
                </div>
            </div>
            <div className="grid-row">
                <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                    <button className="usa-button submit-button" style={{ margin: "1.5em 0em" }} onClick={cancel}>Discard changes</button>
                </div>
                <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                    <button className="usa-button usa-button--unstyled" onClick={() => setShowModal(false)} style={{ margin: "2.3em 1.5em" }}><b>Continue editing</b></button>
                </div>
            </div>
        </ModalBoxWithoutClose>
    </>)
}
