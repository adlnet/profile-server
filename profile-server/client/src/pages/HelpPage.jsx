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

export default function HelpPage(props) {
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
        <h1 style={{ color: "#1c3664" }}>
          Guidance for Authoring, Publishing, and Updating xAPI Profiles
        </h1>
        <p>Resource page section links:</p>
        <ul style={{}}>
          <li>
            <a href="#beforeyoubegin" target>
              Before You Begin
            </a>
          </li>
          <li>
            <a href="#gettingstarted" target>
              Getting Started
            </a>
          </li>
          <li>
            <a href="#authoringprofiles" target>
              Authoring Profiles
            </a>
          </li>
          <li>
            <a href="#publishingprofiles" target>
              Publishing Profiles
            </a>
          </li>
          <li>
            <a href="#updatingprofiles" target>
              Updating Profiles
            </a>
          </li>
          <li>
            <a href="#externalresources" target>
              External Resources
            </a>
          </li>
        </ul>
        <div id="beforeyoubegin" className="anchor" />
        <h2 style={{ color: "#1c3664" }}>BEFORE YOU BEGIN</h2>
        <p>
          Before authoring a Profile, determine if a new Profile is needed by
          asking the following questions:
        </p>
        <h3 style={{ color: "#1c3664" }}>Can I Reuse Existing Profiles?</h3>
        <p>
          First, check and see if there are vocabulary concepts from a Profile
          or complete Profiles you can reuse before attempting to author a new
          one. Existing vocabulary concepts might not describe or accurately
          define the concept you need. In that case, you might need to coin a
          new concept and create a profile. You also might not want to use all
          the concepts of an existing Profile. Let's say you only want to use
          some of the verbs from the video profile. That's perfectly fine. You
          can reuse any concepts from multiple existing Profiles and you can
          also require the inclusion of statement templates from existing
          Profiles. If you mix multiple profiles and don't add any new
          concepts (concepts, templates, and patterns) on top of them then you
          don't need to create a profile. You are just simply going to reuse
          existing ones. Additionally, the Profile Server provides a mechanism
          for quickly adding already existing items to your profile as references.

        </p>
        <h3 style={{ color: "#1c3664" }}>Do I need to author a Profile?</h3>
        <p>
          You should create a Profile if you need to mint new vocabulary
          such as concepts, templates, or patterns. If you mix multiple profiles
          and add new concepts on top of them then you do need to create a profile.
        </p>
        <div id="gettingstarted" className="anchor" />
        <h2 style={{ color: "#1c3664" }}>GETTING STARTED</h2>
        <h3 style={{ color: "#1c3664" }}>1. Define Use Cases</h3>
        <p>
          Identify the specific requirements you’re trying to satisfy with
          xAPI such as improving learning, human performance, or even business
          processes. What types of learning activities and interactions do you
          need to track? This will help inform what you put into your Profile.
          And your Profile will help you to realize your options for reports and
          analytics. Click{" "}
          <a
            href="../files/use-case-statement-template-for-profiles.docx"
            download
          >
            HERE
          </a>{" "}
          to download the Use Case Template word document.
        </p>
        <h3 style={{ color: "#1c3664" }}>2. Author &amp; Reuse</h3>
        <p>
          Browse and search profiles.adlnet.gov and then document the specific
          vocabulary profiles, concepts, templates, and patterns you will author
          from scratch or reuse. Reuse whole Profiles or only parts of them
          that are needed for your project. Let's say you were developing a
          course or updating an existing one. The course has video
          embedded in it. You could use a combination of both the cmi5 and the
          Video Profile rather than creating a new Profile. If you need to
          author a new Profile you can start with an empty starter template.
          Click{" "}
          <a href="https://profiles.adlnet.gov/profiles" target="_blank">
            HERE
          </a>{" "}
          view a list of all published xAPI profiles on this server.
        </p>
        <h3 style={{ color: "#1c3664" }}>3. Prototype &amp; Refine</h3>
        <p>
          Create functional examples and send statements to an LRS. Query the
          LRS and visualize the data to help inform any changes or refinements
          to your Profile. Click{" "}
          <a href="https://lrs.adlnet.gov/" target="_blank">
            HERE
          </a>{" "}
          to go to the ADL Learning Record Store (LRS) and test your xAPI
          prototype. You can also search the web for existing commercial LRS
          vendors as most offer free trial accounts for testing as well. During
          the prototype phase, you can{" "}
          <a href="https://profiles.adlnet.gov/organization/9b917eef-d2a7-454f-876b-3a06c8907f5f/about" target="_blank">
            create or join a working group
          </a>{" "}
          on this server, and use this UI to build your prototype.
        </p>
        <h3 style={{ color: "#1c3664" }}>4. Publish &amp; Share</h3>
        <p>
          Once you've finished authoring and refining your Profile you will
          publish it to this server. This will create the first version of the
          profile publicly available to the public. If you created the profile
          using other tools, it can be imported via{" "}
          <a href="/api-info/post" target="_blank">
            the profile server's API
          </a>
          .
        </p>
        <div id="authoringprofiles" className="anchor" />
        <h2 style={{ color: "#1c3664" }}>AUTHORING PROFILES</h2>
        <p>
          The process of authoring Profiles for xAPI can be made easier if some
          specific rules are followed. This section of the document will explain
          these rules and provide the recommended practices for Profile
          authoring.
        </p>
        <h3 style={{ color: "#1c3664" }}>IRI Design Practices</h3>
        <p>
          This section provides a set of general design principles aimed at
          helping Profile authors mint consistent and reliable IRIs. The IRIs
          for concepts are expected to be dereferenced (aka resolve to a URL) by
          a browser or any other client making an HTTP GET request. Therefore,
          Profile authors must follow good IRI design practices in order to
          ensure that xapi.vocab.pub will be able to consistently dereference
          Profile metadata. The following IRI pattern should be adopted by
          anyone creating new concepts for a profile:
        </p>
        <div style={{ textAlign: "center" }}>
          <p>
            https://w3id.org/xapi/ [profile name] / [ &#123;concept type&#125; OR template OR pattern] / [name]
          </p>
        </div>
        <p>
          The parts of the IRI in brackets are the only parts that will be
          customized. For example the Video Profile Verb,
          https://w3id.org/xapi/video/verbs/seeked, follows this pattern. A best
          practice for IRIs is to use a persistent resolution service. The xAPI
          community is using the W3C's w3id.org service for this purpose. This
          is why all IRIs should begin with the w3id.org domain (except older
          IRIs that were generated before the community established this
          process). Following this practice will make profile IRIs resolve to a
          JSON document that follows the{" "}
          <a href="https://github.com/adlnet/xapi-profiles" target="_blank">
          xAPI Profile Specification.
          </a>{" "}
          For concepts, templates, and patterns, follow a similar pattern.
        </p>
        <h3 style={{ color: "#1c3664" }}>Quality Metadata</h3>
        <p>
          Profiles should include information about the profile such as the
          name of the profile, a description, the organization or person that
          authored it, and the date/time it was published. Thi is automatically
          added by the profile server through the use of the working group
          details and a timestamp of when the profile is published. Profiles can also
          include concepts (e.g., verbs, activity types, extensions) and
          statement templates. These are all described in a JSON-LD document
          based on the W3C's Resource Description Framework (RDF). However, you
          don't need to understand RDF or JSON-LD in order to author a Profile.
          You can simply look at existing examples and look at the starter
          template to begin the process. What's most important is that we keep
          the process simple so Profile authors can focus on providing quality
          metadata.
        </p>
        
        
        <div id="publishingprofiles" className="anchor" />
        <h2 style={{ color: "#1c3664" }}>PUBLISHING PROFILES</h2>
        <p>
          This section describes the process for publishing Profiles. Once a
          profile reaches the level of maturity that it is ready to be seen
          and used by others, you may choose to publish the profile. Once this
          is done, it cannot be reversed, and the profile's IRI is locked.
        </p>
        <h3 style={{ color: "#1c3664" }}>Quality Assurance &amp; Help</h3>
        <p>
          When you publish a profile, you may ask the xAPI community to curate
          the Profile for quality and validate it. We will also assist you if
          you need help with authoring your Profile or have questions. Submit
          inquires or ask{" "}
          <a href="https://adlnet.gov/contact" target="_blank">
            questions.
          </a>
        </p>
        
        <div id="updatingprofiles" className="anchor" />
        <h2 style={{ color: "#1c3664" }}>UPDATING PROFILES</h2>
        <p>
          This section describes the process for updating existing Profiles that
          have already been published to the Github repository. If changes need
          to be made, the working group that owns this profile can reconvene and
          make changes. Once the new version of the profile is ready to be seen 
          by others, a new version can be published. Previous versions can still 
          be seen by clicking on the version's dropdown box in the profile's home page.
        </p>
        
        <h2 style={{ color: "#1c3664" }}>QUICK LINKS</h2>
        <p>Commonly accessed external resources:</p>
        <ul style={{}}>
          <li>
            <a href="https://github.com/adlnet/xapi-profiles" target="_blank">
              xAPI Profile Specification - GitHub Repo
            </a>
          </li>
          <li>
            <a
              href="https://github.com/adlnet/xapi-authored-profiles"
              target="_blank"
            >
              xAPI Authored Profiles Github Repository - GitHub Repo
            </a>
          </li>
          <li>
            <a
              href="https://adlnet.gov/guides/xapi-profile-server/authoring-guide/"
              target="_blank"
            >
              xAPI Profile Server Authoring Guide
            </a>
          </li>
          <li>
            <a
              href="../files/use-case-statement-template-for-profiles.docx"
              download
            >
              xAPI Use Cases &amp; Statements Template - Word Doc Download
            </a>
          </li>
          <li>
            <a
              href="https://github.com/adlnet/xapi-authored-profiles/blob/master/starter-template.jsonld"
              target="_blank"
            >
              xAPI Profile Starter Template - GitHub Repo
            </a>
          </li>
          <li>
            <a href="https://json-ld.org/" target="_blank">
              JSON-LD
            </a>
          </li>
          <li>
            <a href="http://restfulwebapis.com/" target="_blank">
              RESTful Web APIs (book)
            </a>
          </li>
          <li>
            <a
              href="http://www.linkeddatatools.com/querying-semantic-data"
              target="_blank"
            >
              SPARQL Tutorial
            </a>
          </li>
        </ul>
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
