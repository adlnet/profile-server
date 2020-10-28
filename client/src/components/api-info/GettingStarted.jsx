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
import PageTemplate, { Header, Description, SubHeader, CodeSpan, Notice } from './util/PageTemplate';

export default function GettingStarted() {
    return (
        <PageTemplate>
            <Header>
                getting started
            </Header>
            <Description>
                The xAPI Profile Server has an API for performing basic operations on the server, such as importing,
                updating and validating profiles. It also provides a SPARQL endpoint to make more in-depth queries to the
                server. Finally the API provides a mechanism via webhooks to listen to events about a specific profile.
            </Description>
            <Description>
                There are two types of endpoints: protected and public routes. Public routes are accessible without the need to
                authenticate. These include getting published profiles, getting a single published profile, and validating a
                JSON-LD profile document. Other endpoints are protected from unauthenticated access, such as publishing a profile
                or editing a draft.
            </Description>
            <SubHeader>
                API Key
            </SubHeader>
            <Description>
                To begin sending HTTP requests to the protected routes of the API, one first needs to create an API key. API keys
                are owned by, and associated to a working group. More than one API key can be created, and each key can be scoped to
                read, write, or both. The key contains a UUID which is the value for the HTTP Header property
                (<CodeSpan>x-api-key</CodeSpan>). Below are the steps to get set up:
                <Notice>
                    Creating and viewing access keys is only available to working group admins. Contact your working group admin
                    if you need a key.
                </Notice>
                <ol>
                    <li>Create an account or login</li>
                    <li>Join a working group or select the working group under which you want to create the key</li>
                    <li>Select API Keys from the working group menu</li>
                    <li>Click the Create New API Key button</li>
                    <li>Fill in the name, choose read and write permissions, keep the status 'Enabled'</li>
                    <li>Click the Create API Key button</li>
                    <li>The UUID in the Key column of the table is the value used in the HTTP Header (x-api-key)</li>
                </ol>
            </Description>
            <SubHeader>
                Profile States
            </SubHeader>
            <Description>
                Profiles can be in different states, with different visibility and permissions.
                <table className="usa-table usa-table--borderless font-ui-2xs font-base">
                    <thead>
                        <tr className="text-primary-darker">
                            <th scope="col">State</th>
                            <th scope="col">Description</th>
                            <th scope="col">Visibility</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">Draft</th>
                            <td>
                                A profile version that is not published. The profile details and the components that
                                were created in this draft can be modified.
                            </td>
                            <td>Working Group Members</td>
                        </tr>
                        <tr>
                            <th scope="row">Published</th>
                            <td>
                                A profile version that is published and publicly visible. Edits are limited to translations of
                                descriptions and the edits of scope notes. Working group members can publish profiles they created.
                                See Import/Create Profile and Update Profile Status.
                            </td>
                            <td>Public</td>
                        </tr>
                        <tr>
                            <th scope="row">Verified</th>
                            <td>
                                A profile version that was reviewed by the administrators and deemed of high quality. Working group
                                members can issue a request to have their profile verified by the administrators. See Update Profile
                                Status.
                            </td>
                            <td>Public</td>
                        </tr>
                    </tbody>
                </table>
            </Description>
        </PageTemplate>
    )
}