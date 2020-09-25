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

import React, { useEffect } from "react";

import { searchConcepts } from "../actions/concepts";
import { getProfiles } from "../actions/profiles";

import { useDispatch, useSelector } from "react-redux";

import CardList from "../components/home/CardList";

import { Link } from "react-router-dom";

import { pick } from "../utils";

const Home = () => {
    const dispatch = useDispatch();

    // format data to use within the CardList component
    const profilesResults = useSelector((state) => state.profiles)
        .map(pick("uuid", "currentPublishedVersion", "organization"))
        .map((item) => {
            return {
                uuid: item.uuid,
                name: item.currentPublishedVersion.name,
                subName: item.organization.name,
                url: `/profile/${item.uuid}`,
            };
        });

    // let is used since concepts isn't defined and returning undefined instead of an empty array
    let conceptResults = useSelector((state) => state.searchResults.concepts);

    // format data to use within the CardList component
    conceptResults = conceptResults
        ? conceptResults
            .map(pick("uuid", "name", "parentProfile", "createdOn"))
            .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
            .slice(0, 3)
            .map((item) => {
                return {
                    uuid: item.uuid,
                    name: item.name,
                    subName: item.parentProfile.name,
                    url: `/profile/${item.parentProfile.uuid}/concepts/${item.uuid}`,
                };
            })
        : [];

    useEffect(() => {
        dispatch(searchConcepts(" "));
        dispatch(getProfiles(null, true, false, 3));
    }, []);

    return (
        <>
            <main className="home">
                <section className="grid-container usa-section home-banner">
                    <div className="grid-row grid-gap">
                        <div className="tablet:grid-col-8">
                            <header className="margin-top-0 tablet:margin-bottom-0 font-sans-xl">
                                xAPI profiles make learning design, development, and analytics
                                better.
                            </header>
                            <p className="font-sans-lg">
                                A profile is a collection of statement templates and patterns.
                                Each xAPI statement will have a statement template to describe
                                when it will be used and what data is required. Relationships
                                between xAPI statements can be described with patterns
                            </p>
                            <Link to="/profiles">
                                <button className="usa-button margin-top-2">
                                    Explore profiles
                                </button>
                            </Link>
                            <Link to="/organization">
                                <button className="usa-button margin-top-2">
                                    View working groups
                                </button>
                            </Link>
                        </div>
                        <div className="tablet:grid-col-4 usa-prose">
                            <img
                                className="home-banner-logo"
                                src="./assets/uswds/2.4.0/img/xapi-logo.png"
                                alt="xAPI logo"
                            />
                        </div>
                    </div>
                </section>
            </main>
            <section className="home-cards grid-container ">
                <div className="grid-row grid-gap home-cards">
                    <div className="grid-col">
                        {profilesResults.length > 0 ? (
                            <CardList
                                header="Latest Profiles"
                                keyName="Author"
                                to="profile"
                                items={profilesResults}
                                cta={{
                                    text: "Browse all published profiles",
                                    linkTo: "profiles",
                                }}
                            />
                        ) : (
                                <CardList header="Latest Profiles" items={[]}>
                                    <div className="card-list-empty">No Profiles Yet</div>
                                </CardList>
                            )}
                    </div>
                    <div className="grid-col">
                        {conceptResults.length > 0 ? (
                            <CardList
                                header="Latest Concepts"
                                keyName="Profile"
                                to="concepts"
                                items={conceptResults}
                                cta={{ text: "Find more concepts", linkTo: "search" }}
                            />
                        ) : (
                                <CardList header="Latest Concepts" items={[]}>
                                    <div className="card-list-empty">No Concepts Yet</div>
                                </CardList>
                            )}
                    </div>
                </div>
            </section>
        </>
    );
};
export default Home;
