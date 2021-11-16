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
import React, { useState , forward, forwardRef, useImperativeHandle} from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ModalBox from './modalBox';
import Organizations from '../../pages/Organizations';

const SelectOrganizationModal = forwardRef(({ className, preventDefault, onConfirm }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const { url } = useRouteMatch();

    const chosenOrg = null;

    useImperativeHandle(ref, () => ({
        open(e) {
            if (preventDefault) e.preventDefault();
            setShowModal(true);
        }
    }));

    function onSingleSelection(org) {
        setShowModal(false);
        onConfirm(org);
    }

    return (<>
        <ModalBox show={showModal} onClose={() => setShowModal(false)}>
            <div className="grid-row">
                <div className="grid-col">
                    <h2>Select a working group to restore to</h2>
                </div>
            </div>
            <div className="grid-row">
                <div className="grid-col">
                    <Organizations 
                        optionalSingleSelectionCallback={onSingleSelection}
                        hideNonJoined={true} />
                </div>
            </div>
        </ModalBox>
    </>);
});

export default SelectOrganizationModal;