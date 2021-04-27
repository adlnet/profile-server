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

function CreateProfile({ children }) {

    return (
        <>
            <main className="usa-layout-docs usa-section main-content" id="main-content">
                <div className="grid-container">
                    <div className="usa-layout-docs__main desktop:grid-col-9 usa-prose">
                        <header>
                            <h1 className="site-page-title">Create Profile</h1>
                        </header>
                        <p className="site-text-intro">
                            Profiles are a collection of statement templates and patterns.
                            Each xAPI statement will have a statement template to describe
                            when it will be used and what data is required. Relationships
                            between xAPI statements can be described with patterns.
                            </p>
                        <p>
                            <span className="text-secondary">*</span>
                            <span className="usa-hint font-ui-3xs"> indicates required field</span>
                        </p>
                        {children}
                    </div>
                </div>
            </main>
        </>
    );

}

export default CreateProfile;
