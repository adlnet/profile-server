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
import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router-dom';


import Organizations from './pages/Organizations';
import Organization from './pages/Organization';
import CreateOrganization from './components/organizations/CreateOrganization';
import ErrorPage from './components/errors/ErrorPage';


import Search from "./components/search/Search";
import Users from './pages/Users';

import history from "./history";

import OfficialBanner from './components/OfficialBanner';
import TitleBanner from './components/home/TitleBanner';
import PrivateRoute from './components/users/PrivateRoute';
import GlobalErrorBoundary from "./components/errors/GlobalErrorBoundary"
import ErrorBoundary from './components/errors/ErrorBoundary';
export default class App extends Component {

    render() {
        return (<>
            <OfficialBanner />
            <Router history={history}>
                <TitleBanner />
                    <GlobalErrorBoundary>
                        <Switch>
                            <Route exact path="/">
                                <Organizations />
                            </Route>
                            <PrivateRoute exact path="/organization/create">
                                <CreateOrganization />
                            </PrivateRoute>
                            <PrivateRoute path="/organization/:organizationId">
                                <Organization />
                            </PrivateRoute>
                            <Route path="/user">
                                <Users></Users>
                            </Route>
                            <Route path="/search">
                                <Search></Search>
                            </Route>
                            <Route>
                                <ErrorPage />
                            </Route>
                        </Switch>
                    </GlobalErrorBoundary>
                    <ErrorBoundary />
                <footer className="usa-footer usa-footer--slim">
                    <div className="grid-container usa-footer__return-to-top">
                        <a href="#">Return to top</a>
                    </div>
                    <div className="usa-footer__primary-section">
                        <div className="usa-footer__primary-container grid-row">
                        <div className="mobile-lg:grid-col-8">
                            <nav className="usa-footer__nav" aria-label="Footer navigation">
                            <ul className="grid-row grid-gap">
                                <li className="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content">
                                <a className="usa-footer__primary-link" href="javascript:void(0);">Primary link</a>
                                </li>
                                <li className="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content">
                                <a className="usa-footer__primary-link" href="javascript:void(0);">Primary link</a>
                                </li>
                                <li className="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content">
                                <a className="usa-footer__primary-link" href="javascript:void(0);">Primary link</a>
                                </li>
                                <li className="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content">
                                <a className="usa-footer__primary-link" href="javascript:void(0);">Primary link</a>
                                </li>
                            </ul>
                            </nav>
                        </div>
                        <div className="mobile-lg:grid-col-4">
                            <address className="usa-footer__address">
                            <div className="grid-row grid-gap">
                                <div className="grid-col-auto mobile-lg:grid-col-12 desktop:grid-col-auto">
                                <div className="usa-footer__contact-info">
                                    <a href="tel:1-800-555-5555">(800) CALL-GOVT</a>
                                </div>
                                </div>
                                <div className="grid-col-auto mobile-lg:grid-col-12 desktop:grid-col-auto">
                                <div className="usa-footer__contact-info">
                                    <a href="mailto:info@agency.gov">info@agency.gov</a>
                                </div>
                                </div>
                            </div>
                            </address>
                        </div>
                        </div>
                    </div>
                    <div className="usa-footer__secondary-section">
                        <div className="grid-container">
                        <div className="usa-footer__logo grid-row grid-gap-2">
                            <div className="grid-col-auto">
                                <img className="usa-footer__logo-img" src="/assets/img/logo-img.png" alt="" />
                            </div>
                            <div className="grid-col-auto">
                            <h3 className="usa-footer__logo-heading">Name of Agency</h3>
                            </div>
                        </div>
                        </div>
                    </div>
                </footer>
            </Router>
        </>);
    }
}
