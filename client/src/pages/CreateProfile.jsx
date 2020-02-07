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
import CreateProfileForm from '../components/CreateProfileForm';

function CreateProfile() {

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
                        <CreateProfileForm />
                    </div>
                </div>
            </main>
        </>
    );

}

export default CreateProfile;
