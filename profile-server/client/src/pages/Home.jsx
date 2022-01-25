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
        isVerified: item.currentPublishedVersion.isVerified,
      };
    });

  // let is used since concepts isn't defined and returning undefined instead of an empty array
  let conceptResults = useSelector((state) => state.searchResults.concepts);

  // format data to use within the CardList component
  conceptResults = conceptResults
    ? conceptResults
        .filter((item) => item.parentProfile.state !== "draft")
        .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
        .slice(0, 3)
        .map(pick("uuid", "name", "parentProfile", "createdOn"))
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

      <section className="grid-container usa-section">
        <div style={{ textAlign: "center" }}>
            <p className="font-sans-lg">
              If you are new the xAPI Profile specification, please read the {" "}
              <a href="/help#resourcestop" target>
                 before you begin 
              </a>
              {" "}section, or visit the {" "}
              <a href="https://adlnet.gov/guides/xapi-profile-server/" target>
                 Profile Server Info Page. 
              </a>
            </p>
        </div>
        <div className="grid-row grid-gap" style={{ color: "#1c3664" }}>
          <hr style={{ color: "#FFFFFF" }}></hr>
          <h1 className="font-sans-xl text-center">xAPI PROFILE GUIDELINES</h1>
          <hr
            style={{ color: "white", backgroundColor: "white", height: 1 }}
          ></hr>
        </div>
        <div className="grid-row grid-gap" style={{ textAlign: "center" }}>
          <div className="tablet:grid-col">
            <div className="guideline">
              <div className="circle">
                <h1 className="font-sans-lg" style={{ color: "#1c3664" }}>
                  <span>1</span>
                </h1>
              </div>
              <h3 style={{ color: "#1c3664" }}>DEFINE USE CASES</h3>
              <p>
                First identify the specific requirements you’re trying to
                satisfy with xAPI such as improving learning, human performance,
                or even business processes.
              </p>
            </div>
          </div>
          <div className="tablet:grid-col">
            <div className="guideline">
              <div className="circle">
                <h1 className="font-sans-lg" style={{ color: "#1c3664" }}>
                  <span>2</span>
                </h1>
              </div>
              <h3 style={{ color: "#1c3664" }}>AUTHOR &amp; REUSE</h3>
              <p>
                The Profile Server has a built in seach feature when adding new
                profiles. Always search on exisiting vocabulary concepts,
                profiles, and statementtemplates before defining your own.
              </p>
            </div>
          </div>
          <div className="tablet:grid-col">
            <div className="guideline">
              <div className="circle">
                <h1 className="font-sans-lg">
                  <span style={{ color: "#1c3664" }}>3</span>
                </h1>
              </div>
              <h3 style={{ color: "#1c3664" }}>PROTOTYPE &amp; REFINE</h3>
              <p>
                Create functional examples and send statements to an LRS. Query
                the LRS and visualize the data to help inform any changes or
                refinements to your profile.
              </p>
            </div>
          </div>
          <div className="tablet:grid-col">
            <div className="guideline">
              <div className="circle">
                <h1 className="font-sans-lg" style={{ color: "#1c3664" }}>
                  <span>4</span>
                </h1>
              </div>
              <h3 style={{ color: "#1c3664" }}>PUBLISH &amp; SHARE</h3>
              <p>
                Publish new profiles based on the{" "}
                <a
                  href="https://github.com/adlnet/xapi-profiles"
                  target="_blank"
                >
                  Profile Spec
                </a>
                . The profiles and vocabulary concepts are curated by the xAPI
                community and shared on this site for reuse.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-container usa-section">
        <div>
          <header className="margin-top-0 font-sans-xl">
            Published xAPI Profiles
          </header>
          <p className="font-sans-lg">
            Below are the published xAPI Profiles on this server. When creating
            a new profile, please keep in mind the best practices for creating
            and modyfying xAPI Profiles.
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
      </section>
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
