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
import React from 'react';
import { useRouteMatch, Switch, Route } from 'react-router-dom';
import TemplateTable from "./TemplateTable";
import AddTemplate from "./AddTemplate";
import Template from "./Template";
import CreateTemplateForm from "./CreateTemplateForm";

export default function Templates() {
    let { url, path } = useRouteMatch();

    return (
        <>
            <Switch>
                <Route exact path={path}>
                    <TemplateTable />
                </Route>
                <Route exact path={`${path}/add`}>
                    <AddTemplate path={path} parentUrl={url} />
                </Route>
                <Route exact path={`${path}/create`}>
                    <CreateTemplateForm />
                </Route>
                <Route path={`${path}/:templateId`}>
                    <Template />
                </Route>
            </Switch>
        </>
    );
}