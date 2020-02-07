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
import React, { Component } from 'react';
import CreateOrgForm from '../components/CreateOrgForm';

class CreateOrg extends Component {
    render() {
        return (
            <>
            <main className="usa-layout-docs usa-section main-content" id="main-content">
                  <div className="grid-container">
                      <div className="usa-layout-docs__main desktop:grid-col-9 usa-prose">
                          <header>
                              <h1 className="site-page-title">Create Organization</h1>
                            </header>
                          <p className="site-text-intro">
                       ...
                            </p>
                          <p>
                              <span className="text-secondary">*</span>
                              <span className="usa-hint font-ui-3xs"> indicates required field</span>
                            </p>
                          <CreateOrgForm />
                        </div>
                    </div>
                </main>
          </>
        );
    }
}

export default CreateOrg;
