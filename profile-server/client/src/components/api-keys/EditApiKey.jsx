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
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import CreateApiKeyForm from './CreateApiKeyForm';
import { selectApiKey } from '../../actions/apiKeys';

export default function EditApiKey({ rootUrl, onSubmit, onCancel, onRemove }) {
    const dispatch = useDispatch();
    const { apiKeyId } = useParams();

    useEffect(() => {
        dispatch(selectApiKey(apiKeyId));
    }, [dispatch, apiKeyId]);

    const initialValues = useSelector((state) => state.application.selectedApiKey);
    if (!initialValues) return '';

    return (
        <div className="usa-layout-docs usa-layout-docs__main desktop:grid-col-9 usa-prose margin-top-4">
            <header>
                <Link to={rootUrl}><span className="details-label">api keys</span></Link> <i className="fa fa-angle-right"></i>
                <h2 className="site-page-title margin-top-0">Edit API Key</h2>
            </header>
            <p className="site-text-intro">
                Instructions if needed...
            </p>
            <CreateApiKeyForm initialValues={initialValues} onSubmit={onSubmit} onCancel={onCancel} onRemove={onRemove} />
        </div>
    )
}
