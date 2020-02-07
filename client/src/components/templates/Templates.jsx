/** ***********************************************************************
*
* Veracity Technology Consultants
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
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
                    <AddTemplate path={path} parentUrl={url}/>
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