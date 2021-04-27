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

import CreateOrgForm from './CreateOrgForm';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { editOrganization } from '../../actions/organizations'

export default function EditOrganization({ organization, rootUrl }) {
    const dispatch = useDispatch();
    const history = useHistory();

    function handleSubmit(values) {
        dispatch(editOrganization(values));
        history.push(`${rootUrl}/about`);
    }

    return (
        <main>
          <div className="usa-layout-docs__main desktop:grid-col-9 usa-prose">
            <header>
              <h2 className="site-page-title">Edit Working Group</h2>
            </header>
            <p>
              Description or instructions for editing a working group…
            </p>
            <CreateOrgForm initialValues={organization} onSubmit={handleSubmit} />
          </div>
      </main>
    )
}
