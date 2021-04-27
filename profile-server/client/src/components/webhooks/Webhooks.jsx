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

import { loadOrgWebHooks, createWebHook, editWebHook, deleteWebHook } from '../../actions/webhooks';
import WebHookTable from './WebHookTable';
import CreateWebHookForm from './CreateWebHookForm';
import EditWebHook from './EditWebHook';


export default function WebHooks() {
    const dispatch = useDispatch();
    const history = useHistory();
    const { url, path } = useRouteMatch();
    const { organizationId } = useParams();

    useEffect(() => {
        dispatch(loadOrgWebHooks(organizationId));
    }, [dispatch, organizationId]);

    const webHooks = useSelector((state) => state.webHooks);

    function handleCreateSubmit(values) {
      
        dispatch(createWebHook(values));
        history.push(url);
    }

    function handleEditSubmit(values) {
        dispatch(editWebHook(Object.assign({}, values)));
        history.push(url);
    }

    function handleRemove(hookID) {
        dispatch(deleteWebHook(hookID));
    }

    return (
        <main id="main-content" className={" grid-container  padding-bottom-4"}>
        <Switch>
            <Route exact path={path}>
                <div className="grid-row">
                    <div className="grid-col">
                        <h2>Webhooks</h2>
                    </div>
                    <div className="grid-col display-flex flex-column flex-align-end">
                        <Link
                                to={`${url}/create`}
                        >
                            <button className="usa-button margin-top-2 margin-right-0">
                                <i className="fa fa-plus margin-right-05"></i>
                                Create New Webhook
                            </button>
                        </Link>
                    </div>
                </div>
                <WebHookTable webHooks={webHooks} onRemove={handleRemove} />
            </Route>
            <Route exact path={`${path}/create`}>
                <div className="usa-layout-docs usa-layout-docs__main desktop:grid-col-9 usa-prose">
                    <header>
                        <h2 className="site-page-title">Create WebHook</h2>
                    </header>
                    <p className="site-text-intro">
                        Instructions if needed...
                    </p>
                    <CreateWebHookForm onSubmit={handleCreateSubmit} onCancel={() => history.goBack()}/>
                </div>
            </Route>
            <Route exact path={`${path}/:hookId/edit`}>
                <EditWebHook onSubmit={handleEditSubmit} onCancel={() => history.goBack()} />
            </Route>
        </Switch>
        </main>
    )
}
