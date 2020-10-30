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
import React, { useEffect, useState } from "react";
import API from "../../api";

import { useSelector, useDispatch } from 'react-redux';


import ProfileResult from "./ProfileResult";
import ConceptResult from "./ConceptResult";
import { useHistory, useLocation, NavLink } from 'react-router-dom'
import Pagination from "./Pagination"
import store from "../../store";
import Flyout from "../controls/flyout";
import { Detail } from "../DetailComponents";
import AccountButton from "../../components/users/AccountButton"

export default function Search(props) {
    const [selectedType, setSelectedType] = useState("all");
    let [results, setResults] = useState([]);
    const [showFlyout, setShowFlyout] = useState(false);

    const userData = useSelector((state) => state.userData);

    const location = useLocation();
    let tmpSearch = '';
    if (location.state && location.state.search)
        tmpSearch = location.state.search;
    const [searchString, setSearchString] = useState(tmpSearch);
    let [deprecated, setDeprecated] = useState(false);
    let [verified, setVerified] = useState(false);
    const [searchedString, setSearchedString] = useState(tmpSearch);
    const [page, setPage] = useState(0);
    const history = useHistory()

    useEffect(() => {
        if(location.state.category){
            setSelectedType(location.state.category);
            search(searchString, location.state.category);
        }else{
            setSearchString(searchString)
            search(searchString, selectedType);
        }
    }, [searchedString]);

    useEffect(() => {
        if(location.state.category){
            setSelectedType(location.state.category)
        }
        setSearchString(location.state.search)
        search(location.state.search, location.state.category? location.state.category : selectedType);

    }, [location.state.search])

    async function _setVerified(bool) {
        await setVerified(bool);
        verified = bool;
        search();
    }

    async function _setDeprecated(bool) {
        await setDeprecated(bool);
        deprecated = bool;
        search();
    }

    function filterResults(results) {
        return results;
    }
    function renderResults() {
        let perPage = 10;
        let renders = {
            profiles: ProfileResult,
            concepts: ConceptResult,
            templates: ConceptResult,
            patterns: ConceptResult,
        }
        let renderResults = results.concat([]);
        if (selectedType == "all") {
            perPage = 3;
            renderResults.forEach(i => i.results = i.results.slice(0, 3))
        }
        if (renderResults.length > 0)
        {
            if(selectedType === "all" && renderResults.reduce( (p,c) => p + c.results.length, 0) === 0)
            return <div className="grid-container padding-2">
                        <div className="grid-row search-results-header">
                            <div className="results-header">
                                {`No results for "${searchedString}"`} 
                            </div>
                        </div>
                    </div>
            return renderResults.map(result => <div key={result.type} className="grid-container padding-2">
                <div className="grid-row search-results-header">
                    <div className="results-header">

                        {
                            result.results.length === 0 ? (selectedType !== "all" && `No results for ${selectedType} for "${searchedString}"`) : <span><b>{result.type}:</b> Showing {page * perPage + 1} - {Math.min((page + 1) * perPage, result.total)} of {result.total} results for `{searchedString}`</span>
                        }
                        <div className="pull-right">

                            {selectedType !== "all" && result.type !== "profiles" && <div className="usa-checkbox">
                                <input className="usa-checkbox__input" id="deprecated" type="checkbox" name="deprecated" value={!deprecated} onChange={e => _setDeprecated(e.target.checked)}></input>
                                <label className="usa-checkbox__label" htmlFor="deprecated">Include Deprecated</label>
                            </div>}
                            {selectedType !== "all" && result.type == "profiles" && <div className="usa-checkbox">
                                <input className="usa-checkbox__input" id="verified" type="checkbox" name="verified" value={verified} onChange={e => _setVerified(e.target.checked)} ></input>
                                <label className="usa-checkbox__label" htmlFor="verified">Verified only</label>
                            </div>}

                            {selectedType == "all" && result.results.length > 0 && result.type == "profiles" && <div onClick={(p) => _setSelectedType(result.type)} className="usa-link button-link margin-1">
                                <strong>View all results for profiles <i className="fa fa-arrow-right"></i></strong>
                            </div>}

                            {selectedType == "all" && result.results.length > 0 && result.type == "concepts" && <div onClick={(p) => _setSelectedType(result.type)} className="usa-link button-link margin-1">
                                <strong>View all results for concepts <i className="fa fa-arrow-right"></i></strong>
                            </div>}

                            {selectedType == "all" && result.results.length > 0 && result.type == "templates" && <div onClick={(p) => _setSelectedType(result.type)} className="usa-link button-link margin-1">
                                <strong> View all results for templates <i className="fa fa-arrow-right"></i></strong>
                            </div>}
                            {selectedType == "all" && result.results.length > 0 && result.type == "patterns" && <div onClick={(p) => _setSelectedType(result.type)} className="usa-link button-link margin-1">
                                <strong> View all results for patterns <i className="fa fa-arrow-right"></i></strong>
                            </div>}

                        </div>
                    </div>
                    <div className="show-verified">

                    </div>

                </div>
                {filterResults(result.results).map(i => renders[result.type]({ result: i, type: result.type, openFlyout: () => setShowFlyout(i) }))}
                {selectedType !== "all" && <Pagination current={page} total={result.total / 10} pageChanged={(p) => _setPage(p, result.type)}></Pagination>}
                <Flyout
                    show={showFlyout}
                    onClose={() => setShowFlyout(false)}
                >
                    <div>
                        <div className="padding-top-4 padding-left-4">
                            <span className="border-2px padding-05 text-uppercase text-thin text-base font-sans-3xs">profile</span>
                            <h2>{showFlyout && showFlyout.name}</h2><br />
                        </div>
                        <div className="infopanel margin-right-2">
                            <div className="margin-left-4">
                                <Detail title="iri">
                                    <span className="field-word-break">{showFlyout && showFlyout.iri}</span>
                                </Detail>
                                <Detail title="description" subtitle="English (en)">
                                    {showFlyout && showFlyout.description}
                                </Detail>
                                <Detail title="this profile contains">
                                    <div className="grid-row flex-row">
                                        <div className="bg-base-lightest border border-base text-base profile-search-counts grid-col flex-auto margin-right-1">
                                            <div className="display-flex flex-column flex-align-center">
                                                <div className="font-ui-lg text-bold">{showFlyout && showFlyout.concepts.length}</div> <div>concepts</div>
                                            </div>
                                        </div>
                                        <div className="bg-base-lightest border border-base text-base profile-search-counts grid-col flex-auto margin-right-1">
                                            <div className="display-flex flex-column flex-align-center">
                                                <div className="font-ui-lg text-bold">{showFlyout && showFlyout.templates.length}</div> <div>templates</div>
                                            </div>
                                        </div>
                                        <div className="bg-base-lightest border border-base text-base profile-search-counts grid-col flex-auto margin-right-1">
                                            <div className="display-flex flex-column flex-align-center">
                                                <div className="font-ui-lg text-bold">{showFlyout && showFlyout.patterns.length}</div> <div>patterns</div>
                                            </div>
                                        </div>
                                    </div>
                                </Detail>
                                <Detail title="similar profiles">
                                    {showFlyout && showFlyout.similarProfiles.map((v, i) => <><a key={i} href={`/profile/${v.uuid}`} rel="noreferrer">{v.name}</a><br /><br /></>)}
                                </Detail>
                            </div>
                        </div>
                    </div>
                </Flyout>
            </div>)
        }else
            return <div className="grid-container padding-2">
                <div className="grid-row search-results-header">
                    <div className="results-header">
                        No results for {selectedType} for `{searchedString}`
                </div>

                </div>
            </div>
    }
    function _setPage(page, type = selectedType) {
        setPage(page)
        search(searchedString, type, page);
    }
    function _setSelectedType(type) {
        setSelectedType(type);
        setResults([{ type, results: [] }]);
        search(searchedString, type);
    }
    async function search(searchString = searchedString, type = selectedType, page = 0) {
        store.dispatch({ type: "START_" });
        setSearchedString(searchString)
        setPage(page)
        if (type !== "all") {

            let results = await API.getJSON("app/search/" + type + "?search=" + encodeURIComponent(searchString) + "&page=" + page + "&deprecated=" + deprecated + "&verified=" + verified);
            results.type = type;
            setResults([results]);

        } else {
            let allRes = [];
            let profiles = await API.getJSON("app/search/profiles?search=" + encodeURIComponent(searchString) + "&page=" + page + "&deprecated=" + deprecated + "&verified=" + verified);
            profiles.type = "profiles";
            allRes.push(profiles)

            let concepts = await API.getJSON("app/search/concepts?search=" + encodeURIComponent(searchString) + "&page=" + page + "&deprecated=" + deprecated + "&verified=" + verified);
            concepts.type = "concepts";
            allRes.push(concepts)

            let templates = await API.getJSON("app/search/templates?search=" + encodeURIComponent(searchString) + "&page=" + page + "&deprecated=" + deprecated + "&verified=" + verified);
            templates.type = "templates";
            allRes.push(templates)

            let patterns = await API.getJSON("app/search/patterns?search=" + encodeURIComponent(searchString) + "&page=" + page + "&deprecated=" + deprecated + "&verified=" + verified);
            patterns.type = "patterns";
            allRes.push(patterns)





            setResults(allRes);

        }
        store.dispatch({ type: "FINISH_" });
    }

    function _search(e) {

        setSearchedString(searchString)

        return false;
    }
    return <div id="main-content"> <header className=" usa-header usa-header--extended">
        <div className="usa-navbar bg-base-lightest margin-top-3 padding-y-4">

            <div className="usa-search full-width">
                <div role="search" className="usa-form-group " ><h1 style={{ padding: "0", margin: "-4.5px .5em" }} htmlFor="search-field">Search</h1><input onChange={(e) => setSearchString(e.target.value)} className="usa-input " id="search-field" type="search" name="search" value={searchString}></input><button onClick={() => _search(searchString)} className="usa-button" type="submit" ><span className="usa-search__submit-text">Search</span></button></div>
            </div>

        </div>
        <nav aria-label="Primary navigation" className="usa-nav">
            <div className="grid-container bg-base-lightest usa-nav__inner">
                <button className="usa-nav__close"><i className="fa fa-close"></i></button>
                <ul className="usa-nav__primary usa-accordion">
                <li className="usa-nav__primary-item main-menu-show">
                            <NavLink to="/profiles"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Profiles</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item main-menu-show">
                            <NavLink to="/organization"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current"
                            >
                                <span className="text-bold">Working Groups</span>
                            </NavLink>
                        </li>
                        <li className="usa-nav__primary-item main-menu-show">
                            <NavLink to="/api-info"
                                className="usa-nav__link nav-link-adjustment"
                                activeClassName="usa-current">
                                <span className="text-bold">API Info</span>
                            </NavLink>
                        </li>
                        {userData && userData.user && userData.user.type === 'admin' &&
                            <li className="usa-nav__primary-item main-menu-show">
                                <button className="usa-accordion__button usa-nav__link" aria-expanded="false" aria-controls="basic-nav-section-admin1">
                                    <span className="text-bold">Admin</span>
                                </button>
                                <ul id="basic-nav-section-admin1" className="usa-nav__submenu" hidden>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/admin/users"
                                            className="usa-link"
                                        >
                                            Manage Users
                                        </NavLink>
                                    </li>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/admin/verification"
                                            className="usa-link"
                                        >
                                            Verify Profiles
                                        </NavLink>
                                    </li>
                                    <li className="usa-nav__submenu-item">
                                        <NavLink exact to="/admin/analytics"
                                            className="usa-link"
                                        >
                                            Analytics
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        }
                        <li className="usa-nav__primary-item main-menu-show" style={{ marginLeft: 'auto' }}>
                            <AccountButton controlIndex={999}></AccountButton>
                        </li>
                    <li className="usa-nav__primary-item" onClick={() => _setSelectedType("all")}> <a className={"usa-nav__link " + (selectedType == "all" ? "usa-current" : "")} ><span className="text-bold">All</span></a></li>
                    <li className="usa-nav__primary-item" onClick={() => _setSelectedType("profiles")}> <a className={"usa-nav__link " + (selectedType == "profiles" ? "usa-current" : "")} ><span className="text-bold">Profiles</span></a></li>
                    <li className="usa-nav__primary-item" onClick={() => _setSelectedType("concepts")}> <a className={"usa-nav__link " + (selectedType == "concepts" ? "usa-current" : "")} ><span className="text-bold">Concepts</span></a></li>
                    <li className="usa-nav__primary-item" onClick={() => _setSelectedType("templates")}><a className={"usa-nav__link " + (selectedType == "templates" ? "usa-current" : "")} ><span className="text-bold">Statement Templates</span></a></li>
                    <li className="usa-nav__primary-item" onClick={() => _setSelectedType("patterns")}> <a className={"usa-nav__link " + (selectedType == "patterns" ? "usa-current" : "")} ><span className="text-bold">Patterns</span></a></li>
                </ul>
            </div>
        </nav>
    </header>
        {renderResults()} </div>
}