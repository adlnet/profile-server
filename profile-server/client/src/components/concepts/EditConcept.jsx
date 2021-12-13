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
import { useRouteMatch, Switch, Route, Redirect } from 'react-router-dom';

// import ChooseConceptType from './ChooseConceptType';
import CreateSemanticallyRelatableConcept from './CreateSemanticallyRelatableConcept';
import CreateDocumentConcept from './CreateDocumentConcept';
import CreateExtensionConcept from './CreateExtensionConcept';
import CreateActivityConcept from './CreateActivityConcept';
import ErrorPage from '../errors/ErrorPage';

export default function EditConcept({ initialValues, onCancel, onCreate, isPublished, setIsEditing, onDeprecate, onDelete }) {
    const { path } = useRouteMatch();
    setIsEditing(true);
    return (<>
        <Switch>
            <Route exact path={`${path}/document`}>
                <CreateDocumentConcept initialValues={initialValues} onCreate={onCreate} onCancel={onCancel} isPublished={isPublished} onDeprecate={onDeprecate} onDelete={onDelete} />
            </Route>
            <Route exact path={`${path}/extension`}>
                <CreateExtensionConcept initialValues={initialValues} onCreate={onCreate} onCancel={onCancel} isPublished={isPublished} onDeprecate={onDeprecate} onDelete={onDelete} />
            </Route>
            <Route exact path={`${path}/activity`}>
                <CreateActivityConcept initialValues={initialValues} onCreate={onCreate} onCancel={onCancel} isPublished={isPublished} onDeprecate={onDeprecate} onDelete={onDelete} />
            </Route>
            <Route exact path={`${path}/:conceptType(Verb|ActivityType|AttachmentUsageType)?`}>
                <CreateSemanticallyRelatableConcept startingValues={initialValues} onCreate={onCreate} onCancel={onCancel} isPublished={isPublished} onDeprecate={onDeprecate} onDelete={onDelete} />
            </Route>
            <Route>
                <ErrorPage />
            </Route>
            <Redirect from="/" to="" />
        </Switch>
    </>);
}
