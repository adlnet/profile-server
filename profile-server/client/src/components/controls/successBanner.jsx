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
import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { clear } from '../../actions/successAlert';

export default function SuccessBanner() {
    const successAlert = useSelector(state => state.successAlert);
    const [fadeclass, setFadeClass] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        if (successAlert.message) {
            setFadeClass("success-fade")
            setTimeout(() => {
                setFadeClass("");
                dispatch(clear());
            }, 3000);
        }
    }, [successAlert.message])

    return (
        successAlert.message &&
        <div className="outer-alert">
            <div className={`usa-alert usa-alert--slim usa-alert--success margin-top-2 ${fadeclass}`} >
                <div className="usa-alert__body">
                    <p className="usa-alert__text">
                        {successAlert.subject && <span className="text-bold">{successAlert.subject} </span>}{successAlert.message}
                    </p>
                </div>
            </div>
        </div>
    )
}