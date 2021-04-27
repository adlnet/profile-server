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
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


import { selectWebHook } from '../../actions/webhooks';
import CreateWebHookForm from './CreateWebHookForm';

export default function EditWebHook({ onSubmit, onCancel }) {
    const dispatch = useDispatch();
    const { hookId } = useParams();

    useEffect(() => {
        dispatch(selectWebHook(hookId));
    }, [dispatch, hookId]);

    const initialValues = useSelector((state) => state.application.selectedWebHook);
    if (!initialValues) return '';

    return (
        <div className="usa-layout-docs usa-layout-docs__main desktop:grid-col-9 usa-prose">
            <header>
                <h2 className="site-page-title">Edit API Key</h2>
            </header>
            <p className="site-text-intro">

            </p>
            <CreateWebHookForm initialValues={initialValues} onSubmit={onSubmit} onCancel={onCancel} />
        </div>
    )
}
