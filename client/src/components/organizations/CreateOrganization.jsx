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
import { useDispatch } from 'react-redux';

import CreateOrgForm from './CreateOrgForm';
import { createOrganization } from '../../actions/organizations';

export default function CreateOrganization() {
  const dispatch = useDispatch();

  function handleSubmit(values) {
    dispatch(createOrganization(values));
  }

  return (
    <>
      <main className="usa-layout-docs usa-section main-content" id="main-content">
        <div className="grid-container">
          <div className="usa-layout-docs__main desktop:grid-col-9 usa-prose">
            <header>
              <h1 className="site-page-title">Create Working Group</h1>
            </header>
            <span>
              Description or instructions for creating a working group…
            </span>
            <p>
              <em>Once the working group is created, you will be able to add members and create profiles.</em>
            </p>
            <CreateOrgForm onSubmit={handleSubmit} />
          </div>
        </div>
      </main>
    </>
  );
}
