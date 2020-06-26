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
import React, {useState} from "react";
import API from "../../api";

import ProfileResult from "./ProfileResult";
import ConceptResult from "./ConceptResult";

import store from "../../store";
const perPage = 10;
export default function Search(props) {
    const [selectedType,setSelectedType] = useState("profiles");
    const [results,setResults] = useState([]);
    const [searchString,setSearchString] = useState("");
    const [searchedString,setSearchedString] = useState("");
    const [page,setPage] = useState(0);

function filterResults(results)
{
    return results;
}
function renderResults()
{
    let renders ={
        profiles:ProfileResult,
        concepts:ConceptResult,
        templates:ConceptResult,
        patterns:ConceptResult,
    }

    if(results.length > 0)
        return <div className="grid-container padding-top-2">
            <div className = "grid-row search-results-header">
                <div className = "results-header">
                    Showing {page * perPage} - {(page+1) * perPage -1} of {filterResults(results).length} {selectedType} for `{searchString}`
                </div>
                <div className = "show-verified">

                </div>
            </div>
        {filterResults(results).map( i => renders[selectedType]({result:i}))}
        </div>
    else
        return <div className="grid-container padding-top-2">
            <div className = "grid-row search-results-header">
                <div className = "results-header">
                    No results for {selectedType} for `{searchedString}`
                </div>
                
            </div>
        </div>
}
function _setSelectedType(type)
{
    setSelectedType(type);
    setResults([]);
    search(searchedString, type);
}
async function search(searchString, type = selectedType)
{
    store.dispatch({type:"START_"});
    setSearchedString(searchString)
    let results = await API.search(type,searchString);
    setResults(results);
    store.dispatch({type:"FINISH_"});
}
    
return <> <header className=" usa-header usa-header--extended">
        <div className="usa-navbar bg-base-lightest margin-top-3 padding-y-4">

            <div className="usa-search full-width">
             <div role="search" className="usa-form-group " ><label className="usa-sr-only" htmlFor="search-field">Search</label><input onChange={(e) => setSearchString(e.target.value)} className="usa-input " id="search-field" type="search" name="search" value={searchString}></input><button onClick={()=>search(searchString)}className="usa-button" type="submit" ><span className="usa-search__submit-text">Search</span></button></div>
            </div>
         
        </div>
        <nav aria-label="Primary navigation" className="usa-nav">
        <div className="usa-nav__inner">
            <button className="usa-nav__close"><i className="fa fa-close"></i></button>
            <ul className="usa-nav__primary usa-accordion">
            
            <li className="usa-nav__primary-item"><a aria-current="page" className="" ><span>Search For:</span></a></li>
                <li className="usa-nav__primary-item" onClick={()=>_setSelectedType("profiles")}> <a className={"usa-nav__link " + (selectedType == "profiles" ? "usa-current" : "")} ><span className="text-bold">Profiles</span></a></li>
                <li className="usa-nav__primary-item" onClick={()=>_setSelectedType("concepts")}> <a className={"usa-nav__link " + (selectedType == "concepts" ? "usa-current" : "")} ><span className="text-bold">Concepts</span></a></li>
                <li className="usa-nav__primary-item" onClick={()=>_setSelectedType("templates")}><a className={"usa-nav__link " + (selectedType == "templates" ? "usa-current" : "")} ><span className="text-bold">Statement Templates</span></a></li>
                <li className="usa-nav__primary-item" onClick={()=>_setSelectedType("patterns")}> <a className={"usa-nav__link " + (selectedType == "patterns" ? "usa-current" : "")} ><span className="text-bold">Patterns</span></a></li>
            </ul>
        </div>
        </nav>
    </header>
    {renderResults()} </>
}