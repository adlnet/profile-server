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
import React, {useEffect, useState} from "react";
import API from "../../api";

import ProfileResult from "./ProfileResult";
import ConceptResult from "./ConceptResult";
import { useHistory } from 'react-router-dom'  
import Pagination from "./Pagination"
import store from "../../store";

export default function Search(props) {
    const [selectedType,setSelectedType] = useState("profiles");
    let [results,setResults] = useState([]);
    
    const [searchString,setSearchString] = useState("");
    let [deprecated,setDeprecated] = useState(false);
    let [verified,setVerified] = useState(false);
    const [searchedString,setSearchedString] = useState("");
    const [page,setPage] = useState(0);
    const history = useHistory() 
    useEffect(()=>{
        
        var urlParams = new URLSearchParams(window.location.search);
        let str = urlParams.get("search") || "";
        setSearchString(str)
        search(str, "profiles");
        return history.listen((location) => { 
            var urlParams = new URLSearchParams(window.location.search);
            let s = urlParams.get("search");
            setSearchString(s)
            if(s) search(s, "profiles");
         }) 
         
      
        
    },[])

async function _setVerified(bool)
{
    await setVerified(bool);
    verified = bool;
    search();
}

async function _setDeprecated(bool)
{
    await setDeprecated(bool);
    deprecated = bool;
    search();
}

function filterResults(results)
{
    return results;
}
function renderResults()
{
    let perPage = 10;
    let renders ={
        profiles:ProfileResult,
        concepts:ConceptResult,
        templates:ConceptResult,
        patterns:ConceptResult,
    }
    let renderResults = results.concat([]);
    if(selectedType == "all")
    {
        perPage = 3;
        renderResults.forEach( i => i.results = i.results.slice(0,3))
    }
    if(renderResults.length > 0)
        return renderResults.map( result => <div key={result.type} className="grid-container padding-2">
            <div className = "grid-row search-results-header">
                <div className = "results-header">

                    {
                    result.results.length === 0 ? `No results for ${selectedType} for "${searchedString}"` : <span><b>{result.type}:</b> Showing {page * perPage + 1} - {Math.min((page+1) * perPage , result.total)} of {result.total} results for `{searchedString}`</span>
                    }    
                    <div className="pull-right">
                    
                        {selectedType !== "all" && result.type !== "profiles" && <div className="usa-checkbox">
                          <input className="usa-checkbox__input" id="deprecated" type="checkbox" name="deprecated" value={deprecated} onChange={e => _setDeprecated(e.target.checked)}></input>
                          <label className="usa-checkbox__label" htmlFor="deprecated">Include Deprecated</label>
                        </div>}
                        {selectedType !== "all" && result.type == "profiles" && <div className="usa-checkbox">
                          <input className="usa-checkbox__input" id="verified" type="checkbox" name="verified"  value={verified} onChange={e => _setVerified(e.target.checked)} ></input>
                          <label className="usa-checkbox__label" htmlFor="verified">Verified only</label>
                        </div>}

                        {selectedType == "all" && result.results.length > 0 && result.type == "profiles" && <div onClick={(p) =>  _setSelectedType(result.type)} className="usa-link button-link margin-1">
                          <strong>View all results for profiles <i className="fa fa-arrow-right"></i></strong>
                        </div>}

                        {selectedType == "all" && result.results.length > 0 && result.type == "concepts" && <div onClick={(p) =>  _setSelectedType(result.type)} className="usa-link button-link margin-1">
                        <strong>View all results for concepts <i className="fa fa-arrow-right"></i></strong>
                        </div>}

                        {selectedType == "all" && result.results.length > 0 && result.type == "templates" && <div onClick={(p) =>  _setSelectedType(result.type)} className="usa-link button-link margin-1">
                        <strong> View all results for templates <i className="fa fa-arrow-right"></i></strong>
                        </div>}
                        {selectedType == "all" && result.results.length > 0 && result.type == "patterns" && <div onClick={(p) =>  _setSelectedType(result.type)} className="usa-link button-link margin-1">
                        <strong> View all results for patterns <i className="fa fa-arrow-right"></i></strong>
                        </div>}

                    </div>
                </div>
                <div className = "show-verified">

                </div>
                
            </div>
        {filterResults(result.results).map( i => renders[result.type]({result:i, type: result.type}))}
        {selectedType !== "all" && <Pagination current = {page} total={result.total/10} pageChanged={(p) =>  _setPage(p, result.type)}></Pagination>}
        </div>)
    else
        return <div className="grid-container padding-2">
            <div className = "grid-row search-results-header">
                <div className = "results-header">
                    No results for {selectedType} for `{searchedString}`
                </div>
                
            </div>
        </div>
}
function _setPage(page, type = selectedType)
{
    setPage(page)
    search(searchedString, type, page);
}
function _setSelectedType(type)
{
    setSelectedType(type);
    setResults([{type,results:[]}]);
    search(searchedString, type);
}
async function search(searchString = searchedString, type = selectedType, page= 0)
{
    store.dispatch({type:"START_"});
    setSearchedString(searchString)
    setPage(page)
    if(type !== "all")
    {

        let results = await API.getJSON("app/search/" +type + "?search="+encodeURIComponent(searchString)+"&page="+page +"&deprecated=" + !deprecated + "&verified=" + verified);
        results.type = type;
        setResults([results]);
        
    }else
    {
        let allRes = [];
        let profiles = await API.getJSON("app/search/profiles?search="+encodeURIComponent(searchString)+"&page="+page+"&deprecated=" + !deprecated + "&verified=" + verified);
        profiles.type = "profiles";
        allRes.push(profiles)
        
        let concepts = await API.getJSON("app/search/concepts?search="+encodeURIComponent(searchString)+"&page="+page+"&deprecated=" + !deprecated + "&verified=" + verified);
        concepts.type = "concepts";
        allRes.push(concepts)

        let templates = await API.getJSON("app/search/templates?search="+encodeURIComponent(searchString)+"&page="+page+"&deprecated=" + !deprecated + "&verified=" + verified);
        templates.type = "templates";
        allRes.push(templates)

        let patterns = await API.getJSON("app/search/patterns?search="+encodeURIComponent(searchString)+"&page="+page+"&deprecated=" + !deprecated + "&verified=" + verified);
        patterns.type = "patterns";
        allRes.push(patterns)

      
        
        
        
        setResults(allRes);
        
    }
    store.dispatch({type:"FINISH_"});
}
    
function _search(e)
{
    history.push("/search?search=" + e);
    
    return false;
}
return <div id="main-content"> <header className=" usa-header usa-header--extended">
        <div className="usa-navbar bg-base-lightest margin-top-3 padding-y-4">

            <div className="usa-search full-width">
             <div role="search" className="usa-form-group " ><h1 style={{    padding: "0",margin: "-4.5px .5em"}} htmlFor="search-field">Search</h1><input onChange={(e) => setSearchString(e.target.value)} className="usa-input " id="search-field" type="search" name="search" value={searchString}></input><button onClick={()=>_search(searchString)}className="usa-button" type="submit" ><span className="usa-search__submit-text">Search</span></button></div>
            </div>
         
        </div>
        <nav aria-label="Primary navigation" className="usa-nav">
        <div className="grid-container bg-base-lightest usa-nav__inner">
            <button className="usa-nav__close"><i className="fa fa-close"></i></button>
            <ul className="usa-nav__primary usa-accordion">
            
            <li className="usa-nav__primary-item" onClick={()=>_setSelectedType("all")}> <a className={"usa-nav__link " + (selectedType == "all" ? "usa-current" : "")} ><span className="text-bold">All</span></a></li>
                <li className="usa-nav__primary-item" onClick={()=>_setSelectedType("profiles")}> <a className={"usa-nav__link " + (selectedType == "profiles" ? "usa-current" : "")} ><span className="text-bold">Profiles</span></a></li>
                <li className="usa-nav__primary-item" onClick={()=>_setSelectedType("concepts")}> <a className={"usa-nav__link " + (selectedType == "concepts" ? "usa-current" : "")} ><span className="text-bold">Concepts</span></a></li>
                <li className="usa-nav__primary-item" onClick={()=>_setSelectedType("templates")}><a className={"usa-nav__link " + (selectedType == "templates" ? "usa-current" : "")} ><span className="text-bold">Statement Templates</span></a></li>
                <li className="usa-nav__primary-item" onClick={()=>_setSelectedType("patterns")}> <a className={"usa-nav__link " + (selectedType == "patterns" ? "usa-current" : "")} ><span className="text-bold">Patterns</span></a></li>
            </ul>
        </div>
        </nav>
    </header>
    {renderResults()} </div>
}