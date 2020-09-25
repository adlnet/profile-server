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

import Home from "./pages/Home";
import Organizations from './pages/Organizations';
import Organization from './pages/Organization';
import Profile from './pages/Profile';
import CreateOrganization from './components/organizations/CreateOrganization';
import ErrorPage from './components/errors/ErrorPage';
import Profiles from "./pages/Profiles";
import APIInfo from "./pages/APIInfo";
import SelectOrganization from "./components/profiles/SelectOrganization";

import Search from "./components/search/Search";
import Users from './pages/Users';

import history from "./history";

import OfficialBanner from './components/OfficialBanner';
import TitleBanner from './components/home/TitleBanner';
import PrivateRoute from './components/users/PrivateRoute';
import GlobalErrorBoundary from "./components/errors/GlobalErrorBoundary"
import ErrorBoundary from './components/errors/ErrorBoundary';
import Webhooks from "./components/webhooks/Webhooks.jsx";
export default class App extends Component {

    render() {
        return (<>
            <OfficialBanner />
            <Router history={history}>
                <TitleBanner />
                <GlobalErrorBoundary>
                    <Switch>
                        <Route path="/profile/:profileId">
                            <Profile />
                        </Route>
                        <Route exact path="/">
                            <Home />
                        </Route>
                        <Route exact path="/organization">
                            <Organizations />
                        </Route>
                        <PrivateRoute exact path="/organization/create">
                            <CreateOrganization />
                        </PrivateRoute>
                        <PrivateRoute path="/organization/:organizationId">
                            <Organization />
                        </PrivateRoute>
                        <PrivateRoute exact path="/profiles/create">
                            <SelectOrganization />
                        </PrivateRoute>
                        <PrivateRoute path="/user/hooks">
                            <Webhooks />
                        </PrivateRoute>
                        <Route path="/user">
                            <Users></Users>
                        </Route>
                        <Route path="/search">
                            <Search></Search>
                        </Route>
                        <Route path="/profiles">
                            <Profiles />
                        </Route>
                        <Route path="/api-info">
                            <APIInfo></APIInfo>
                        </Route>
                        <Route>
                            <ErrorPage />
                        </Route>
                    </Switch>
                </GlobalErrorBoundary>
                <ErrorBoundary />
                <footer className="usa-footer usa-footer--slim">
                    {/* <div className="grid-container usa-footer__return-to-top">
                        <a href="#">Return to top</a>
                    </div> */}
                    <div className="usa-footer__primary-section">
                        <div className="usa-footer__primary-container grid-row">
                            <div className="mobile-lg:grid-col-8">

                            </div>
                            <div className="mobile-lg:grid-col-4">
                                <address className="usa-footer__address">
                                    <div className="grid-row grid-gap">
                                        <div className="grid-col-auto mobile-lg:grid-col-12 desktop:grid-col-auto">
                                            <div className="usa-footer__contact-info">
                                                <a href="tel:+1 (571) 480-4640">+1 (571) 480-4640</a>
                                            </div>
                                        </div>
                                        <div className="grid-col-auto mobile-lg:grid-col-12 desktop:grid-col-auto">
                                            <div className="usa-footer__contact-info">
                                                <a href="mailto:support@adlnet.gov">support@adlnet.gov</a>
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
                                    <h3 className="usa-footer__logo-heading">Advanced Distributed Learning Initiative</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </Router>
        </>);
    }
}
