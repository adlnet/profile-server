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
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import SideNav from "../components/api-info/util/SideNav";
import GetProfile from "../components/api-info/GetProfile";
import GettingStarted from "../components/api-info/GettingStarted";
import PostProfile from "../components/api-info/PostProfile";
import PutProfile from "../components/api-info/PutProfile";
import DeleteProfile from "../components/api-info/DeleteProfile";
import Status from "../components/api-info/Status";
import Metadata from "../components/api-info/Metadata";
import Validate from "../components/api-info/Validate";
import SPARQL from "../components/api-info/SPARQL";

export default function FAQPage(props) {
  const { path } = useRouteMatch();

  return (
    <div class>
      <section className="grid-container usa-section">
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

        <div className="line_class" />
        <div id="resourcestop" className="anchor" />
        <h1 style={{ color: "#1c3664" }}>Frequently Asked Questions</h1>
        <p>
          This page will be populated as the ADL Initiative is asked questions.
          If you have any questions or concerns, please contact us.
        </p>
      </section>
      <section>
        <p className="font-sans-lg" style={{ textAlign: "center" }}>
          Contact Us:{" "}
          <div className="usa-footer__contact-info">
            <a href="tel:+1 (571) 480-4640">+1 (571) 480-4640</a>
          </div>{" "}
          <div className="usa-footer__contact-info">
            <a href="mailto:support@adlnet.gov">support@adlnet.gov</a>
          </div>
        </p>
      </section>
    </div>
  );
}
