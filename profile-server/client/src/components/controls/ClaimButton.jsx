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
import React, { useState, useRef } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import ModalBox from '../controls/modalBox';
import ProfileTable from '../profiles/ProfileTable';
import SelectOrganizationModal from './SelectOrganizationModal';
import { selectOrganization } from "../../actions/organizations";


export default function ClaimButton({ className, preventDefault, onConfirm }) {
    const [showModal, setShowModal] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [targetOrganizationUuid, setTargetOrganizationUuid] = useState();
    const dispatch = useDispatch();
    const { url } = useRouteMatch();
    const orgModal = useRef();


    function doProfileModal(e) {
        if (preventDefault) e.preventDefault();
        setShowModal(true);
    }

    function doOrganizationModal(e) {
        if (preventDefault) e.preventDefault();
        console.log(orgModal);
        orgModal.current.open();
    }

    function onSelectedProfile(profile) {
        setShowModal(false);
        onConfirm(profile, targetOrganizationUuid);
    }

    function onSelectedOrg(org) {
        return new Promise(async (resolve, reject) => {
            await dispatch(selectOrganization(org.uuid, (res) => {
                // targetOrganizationUuid = res.uuid;
                setTargetOrganizationUuid(res.uuid);
                setProfiles(res.profiles);
                setShowModal(true);
            }));
        });
    }

    return (<>
        <button className={className}
                onClick={doOrganizationModal}>
            <i className="fa fa-plus margin-right-05"></i>Claim
        </button>
        <ModalBox show={showModal} onClose={() => setShowModal(false)}>
            <div className="grid-row">
                <div className="grid-col">
                    <h2>Select a profile to restore to</h2>
                </div>
            </div>
            <div className="grid-row">
                <div className="grid-col">
                    <ProfileTable profiles={profiles}
                        siteUrl={url} 
                        isMember={true} 
                        optionalSingleSelectionCallback={onSelectedProfile}
                        forceShowDrafts={true} />
                </div>
            </div>
        </ModalBox>
        <SelectOrganizationModal ref={orgModal} onConfirm={onSelectedOrg} />
    </>);
}
