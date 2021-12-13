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
import React, { useState } from 'react'
import ModalBoxWithoutClose from './modalBoxWithoutClose';

export default function DeleteButton({ style, className, type, preventDefault, componentType, onConfirm }) {
    const [showModal, setShowModal] = useState(false);

    function doModal(e) {
        if (preventDefault) e.preventDefault();
        setShowModal(true);
    }
    
    return (<>
        <button className={className} style={style} type={type ? type : 'button'} onClick={doModal}>Delete <span style={{ textTransform: "capitalize" }}>{componentType}</span></button>
        <ModalBoxWithoutClose show={showModal}>
            <div className="grid-row">
                <div className="grid-col">
                    <h2>Delete this <span style={{ textTransform: "capitalize" }}>{componentType}</span></h2>
                </div>
            </div>
            <div className="grid-row">
                <div className="grid-col">
                    <span>
                        Are you sure you want to delete this {componentType}? This action cannot be undone!
                    </span>
                </div>
            </div>
            <div className="grid-row">
                <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                    <button 
                    className="usa-button delete-button" 
                    style={{ margin: "1.5em 0em" }} 
                    type="button"
                    onClick={() => {onConfirm(); setShowModal(false);}}>Delete</button>
                </div>
                <div className="grid-col" style={{ maxWidth: "fit-content" }}>
                    <button className="usa-button usa-button--unstyled" onClick={() => setShowModal(false)} type="button" style={{ margin: "2.3em 1.5em" }}><b>Cancel</b></button>
                </div>
            </div>
        </ModalBoxWithoutClose>
    </>);
}
