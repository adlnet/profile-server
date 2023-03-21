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
          some of the verbs from the SCORM profile. That's perfectly fine. You
          can reuse any concepts from multiple existing Profiles and you can
          also require the inclusion of statement templates from existing
          Profiles. If you mix multiple profiles and don't really add any new
          concepts (verbs, activity types, extensions, attachment usage types)
          on top of them then you don't need to create a profile. You are just
          simply going to reuse existing ones.
        </p>
        <h3 style={{ color: "#1c3664" }}>Do I need to author a Profile?</h3>
        <p>
          You should create a Profile if you need to mint new vocabulary
          concepts such as verbs, activity types, or extensions. If you mix
          multiple profiles and add new concepts on top of them then you do need
          to create a profile. Profiles may often contain vocabulary concepts
          and aren't required to include statement templates. However, the
          answer is also "Yes" if you have specific structural requirements for
          your statements and need to provide statement templates to enforce the
          rules.
        </p>
        <div id="gettingstarted" className="anchor" />
        <h2 style={{ color: "#1c3664" }}>GETTING STARTED</h2>
        <h3 style={{ color: "#1c3664" }}>1. Define Use Cases</h3>
        <p>
          The identify the specific requirements you’re trying to satisfy with
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
          Browse and search xapi.vocab.pub and then document the specific
          vocabulary concepts, Profiles, and statement templates you will author
          from scratch or reuse. Reuse whole Profiles are only parts of them
          that are needed for your project. Let's say you were developing a
          SCORM course or updating an existing one. The course has video
          embedded in it. You could use a combination of both the SCORM and the
          Video Profile rather than creating a new Profile. If you need to
          author a new Profile you can start with an empty starter template.
          Click{" "}
          <a href="/profiles#profiles" target>
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
          </a>
          to go to the ADL Learning Record Store (LRS) and test your xAPI
          prototype. You can also search the web for existing commercial LRS
          vendors as most offer free trial accounts for testing as well. During
          the prototype pahse, you can{" "}
          <a href="/organization" target>
            create or join a working group
          </a>{" "}
          on this server, and use this UI to build your prototype.
        </p>
        <h3 style={{ color: "#1c3664" }}>4. Publish &amp; Share</h3>
        <p>
          Once you've finished authoring and refining your Profile you will
          publish it to this server. This will create the first version of the
          profile publically availible to the public. If you created the profile
          using other tools, it can be imported via{" "}
          <a href="/api-info" target>
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
            https://w3id.org/xapi/ [profile name] / [concept type] / [concept]
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
          process).
        </p>
        <h3 style={{ color: "#1c3664" }}>Quality Metadata</h3>
        <p>
          Profiles should include information about the profile such as the the
          name of the profile, a description, the organization or person that
          authored it, and the date/time it was published. Profiles can also
          include concepts (e.g., verbs, activity types, extensions) and
          statement templates. These are all described in a JSON-LD document
          based on the W3C's Resource Description Framework (RDF). However, you
          don't need to understand RDF or JSON-LD in order to author a Profile.
          You can simply look at existing examples and look at the starter
          template to begin the process. What's most important is that we keep
          the process simple so Profile authors can focus on providing quality
          metadata.
        </p>
        <h3 style={{ color: "#1c3664" }}>Quality Assurance &amp; Help</h3>
        <p>
          Once the metadata has been written for your Profile, you can prepare
          to publish it. When you publish to it the Profiles repository, the
          xAPI community will curate the Profile for quality and validate it. We
          will also assist you if need help with authoring your Profile or have
          questions. Submit inquires or ask questions by{" "}
          <a
            href="https://github.com/adlnet/xapi-authored-profiles"
            target="_blank"
          >
            opening an issue
          </a>
          . If you would like to make sure it produces valid JSON before
          publishing it you can use any of the tools below:
        </p>
        <ul style={{}}>
          <li>
            <a href="https://jsonlint.com/" target="_blank">
              JSON Lint
            </a>
          </li>
          <li>
            <a href="https://json-ld.org/" target="_blank">
              JSON-LD Playground
            </a>
          </li>
        </ul>
        <div id="publishingprofiles" className="anchor" />
        <h2 style={{ color: "#1c3664" }}>PUBLISHING PROFILES</h2>
        <p>
          This section describes the process for publishing Profiles. The
          workflow utilizes Github for version control and as the official
          repository location for importing Profile metadata into
          xapi.vocab.pub. If you don't have experience with Github and would
          like to learn, click HERE to go to the{" "}
          <a href="https://help.github.com/" target="_blank">
            GitHub Help
          </a>{" "}
          page, or HERE to go to the{" "}
          <a
            href="https://services.github.com/on-demand/resources/"
            target="_blank"
          >
            GitHub Learning Lab
          </a>{" "}
          page. If you don't want to learn Github or don't have time, then
          contact us and we'll help publish your Profile for you.
        </p>
        <h3 style={{ color: "#1c3664" }}>Workflow</h3>
        <ul style={{}}>
          <li>
            Fork the{" "}
            <a
              href="https://github.com/adlnet/xapi-authored-profiles"
              target="_blank"
            >
              Profiles Repository
            </a>{" "}
            from Github.{" "}
          </li>
          <li>
            Add your Profile (yourprofilename.jsonld) to your copy of the
            repository using the same structure as existing Profiles (e.g.,
            /folder/filename.jsonld) where the folder and file names are the
            same as your profile name.
          </li>
          <li>
            Submit a pull request to the origin/master{" "}
            <a
              href="https://github.com/adlnet/xapi-authored-profiles"
              target="_blank"
            >
              Profiles Repository
            </a>
            .
          </li>
          <li>
            Wait for confirmation that your Profile has been approved and merged
            into the repository.
          </li>
          <li>
            Once approved, the Profile metadata will be imported into
            xapi.vocba.pub and listed.
          </li>
        </ul>
        <div id="updatingprofiles" className="anchor" />
        <h2 style={{ color: "#1c3664" }}>UPDATING PROFILES</h2>
        <p>
          This section describes the process for updating existing Profiles that
          have already been published to the Github repository.
        </p>
        <h3 style={{ color: "#1c3664" }}>Workflow</h3>
        <ul style={{}}>
          <li>
            Fork the{" "}
            <a
              href="https://github.com/adlnet/xapi-authored-profiles"
              target="_blank"
            >
              Profiles Repository
            </a>{" "}
            from Github.{" "}
          </li>
          <li>
            Update your Profile metadata such as the version information and the
            date/time it was updated. For more information on versioning, read
            the versioning section of the Profile Spec.
          </li>
          <li>
            Add your updated Profile (yourprofilename.jsonld) to your copy of
            the repository using the new version folder structure (e.g.,
            /folder/v1.x.x/filename.jsonld) where the folder and file names are
            the same as your profile name. Simply make sure to create a
            subfolder named v1.x and put the updated file there. Do not
            over-write the older version of your Profile. Use Semantic
            Versioning except the formula is: Given a version number
            MODEL.REVISION.ADDITION, increment the: MODEL (when you make a
            breaking change which WILL prevent interaction with historical
            Profile concepts or statement templates), REVISION (when you make a
            change which MAY prevent interaction with historical Profile
            concepts or statement templates), ADDITION (when you make a Profile
            change this compatible with all historical Proile data).
          </li>
          <li>
            Submit a pull request to the origin/master and specify the following
            message in the pull request subject and body: "VERSION 1.x.x -
            PROFILENAME"
            <a
              href="https://github.com/adlnet/xapi-authored-profiles"
              target="_blank"
            >
              Profiles Repository
            </a>
            .
          </li>
          <li>
            Wait for confirmation that your Profile has been approved and merged
            into the repository.
          </li>
          <li>
            Check xapi.vocab.pub to ensure your Profile updates are showing up.
          </li>
        </ul>
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
            <a href="https://www.w3.org/TR/rdf11-primer/" target="_blank">
              RDF-Primer
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
            <a href="mailto:xapi@adlnet.gov">xapi@adlnet.gov</a>
          </div>
          <div className="usa-footer__contact-info" style={{ textAlign: "center" }}>
            <a href="https://adlnet.atlassian.net/servicedesk/customer/portal/10">Submit a ticket</a>
          </div>
        </p>
      </section>
    </div>
  );
}
