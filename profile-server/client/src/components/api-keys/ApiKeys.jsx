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
import React, { useEffect } from 'react';
import { Switch, Route, Link, useRouteMatch, useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { loadOrgApiKeys, createApiKey, editApiKey, deleteApiKey } from '../../actions/apiKeys';
import ApiKeyTable from './ApiKeyTable';
import CreateApiKeyForm from './CreateApiKeyForm';
import EditApiKey from './EditApiKey';

export default function ApiKeys() {
    const dispatch = useDispatch();
    const history = useHistory();
    const { url, path } = useRouteMatch();
    const { organizationId } = useParams();

    useEffect(() => {
        dispatch(loadOrgApiKeys(organizationId));
    }, [dispatch, organizationId]);

    const apiKeys = useSelector((state) => state.apiKeys);

    function handleCreateSubmit(values) {
        dispatch(createApiKey(values));
        history.push(url);
    }

    function handleEditSubmit(values) {
        dispatch(editApiKey(Object.assign({}, values)));
        history.push(url);
    }

    function handleRemove(apiKeyId) {
        dispatch(deleteApiKey(apiKeyId));
        dispatch(loadOrgApiKeys(organizationId));
        history.push(url)
    }

    return (
        <Switch>
            <Route exact path={path}>
                <div className="grid-row">
                    <div className="grid-col">
                        <h2>API Keys</h2>
                    </div>
                    <div className="grid-col display-flex flex-column flex-align-end">
                        <Link
                            to={`${url}/create`}
                        >
                            <button className="usa-button margin-top-2 margin-right-0">
                                <i className="fa fa-plus margin-right-05"></i>
                                Create New API Key
                            </button>
                        </Link>
                    </div>
                </div>
                <ApiKeyTable apiKeys={apiKeys} />
            </Route>
            <Route exact path={`${path}/create`}>
                <div className="usa-layout-docs usa-layout-docs__main desktop:grid-col-9 usa-prose margin-top-4">
                    <header>
                        <Link to={url}><span className="details-label">api keys</span></Link> <i className="fa fa-angle-right"></i>
                        <h2 className="site-page-title margin-top-0">Create API Key</h2>
                    </header>
                    <p className="site-text-intro">
                        Instructions if needed...
                    </p>
                    <CreateApiKeyForm onSubmit={handleCreateSubmit} onCancel={() => history.goBack()} />
                </div>
            </Route>
            <Route exact path={`${path}/:apiKeyId/edit`}>
                <EditApiKey rootUrl={url} onSubmit={handleEditSubmit} onCancel={() => history.goBack()} onRemove={handleRemove} />
            </Route>
        </Switch>
    )
}
