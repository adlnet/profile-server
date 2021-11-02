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
import React, { useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ModalBox from '../controls/modalBox';
import ProfileTable from '../profiles/ProfileTable';

export default function ClaimButton({ className, preventDefault, onConfirm }) {
    const [showModal, setShowModal] = useState(false);
    const { url } = useRouteMatch();

    const organization = useSelector((state) => state.application.selectedOrganization);

    function doModal(e) {
        if (preventDefault) e.preventDefault();
        setShowModal(true);
    }

    function onSingleSelection(profile) {
        setShowModal(false);
        onConfirm(profile);
    }

    return (<>
        <button className={className}
                onClick={doModal}>
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
                    <ProfileTable profiles={organization.profiles} 
                        siteUrl={url} 
                        isMember={true} 
                        optionalSingleSelectionCallback={onSingleSelection}
                        forceShowDrafts={true} />
                </div>
            </div>
        </ModalBox>
    </>);
}
