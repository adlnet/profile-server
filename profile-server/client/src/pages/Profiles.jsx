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
import { Link } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";

import { useDispatch, useSelector } from "react-redux";
import {
  clearOrganizationSearchResults,
  getOrganizations,
  searchOrganizations,
} from "../actions/organizations";
import PagingTable from "../components/PagingTable";
import { useState } from "react";
import api from "../api";
import MostViewedGraph from "../components/controls/MostViewedGraph.jsx";
import MostExportedGraph from "../components/controls/MostExportedGraph.jsx";
import MetricCount from "../components/controls/metricCount.jsx";

var objectPath = require("object-path");

function getCols(genSortHeader) {
  const cols = [
    {
      Header: genSortHeader("Profiles", "name"),
      id: "name",
      accessor: (i) => i,
      Cell: function NameLink(data) {
        let value = data.cell.value;
        return (
          <Link
            to={`/profile/${value.parentProfile.uuid}`}
            // to={`/organization/${value.organization.uuid}/profile/${value.parentProfile.uuid}/version/${value.uuid}`}
            className="usa-link button-link"
          >
            <span>{value.name}</span>
            {value.isVerified && (
              <img
                className="margin-left-1"
                src="/assets/uswds/2.4.0/img/verified.svg"
                alt="This profile is verified"
                title="This profile is verified"
                width="18px"
                height="18px"
              />
            )}
          </Link>
        );
      },
      style: {
        width: "30%",
      },
    },
    {
      Header: genSortHeader("Working Group", "organization.name"),
      id: "organization",
      accessor: (i) => i,
      Cell: function NameLink(data) {
        let value = data.cell.value;
        return (
          <Link
            to={`organization/${value.organization.uuid}`}
            className="usa-link button-link"
          >
            <span>{value.organization.name}</span>
          </Link>
        );
      },
      style: {
        width: "30%",
      },
    },

    {
      Header: genSortHeader("Updated", "updatedOn"),
      accessor: "updatedOn",
      Cell: ({ cell: { value } }) =>
        value ? new Date(value).toLocaleDateString() : "Unknown",
      style: {
        width: "16%",
        textAlign: "center",
      },
      cellStyle: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <div>
          <div>Views</div>
          <div className="headerSub">Last 30 Days</div>
        </div>
      ),
      Cell: ({ cell: { value } }) => (
        <MetricCount
          url={`/metrics/profile/${value.parentProfile.uuid}/viewTotal`}
        ></MetricCount>
      ),
      id: "views",
      accessor: (i) => i,
      style: {
        width: "12%",
        textAlign: "center",
      },
      cellStyle: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <div>
          <div>Exports</div>
          <div className="headerSub">Last 30 Days</div>
        </div>
      ),
      Cell: ({ cell: { value } }) => (
        <MetricCount
          url={`/metrics/profile/${value.parentProfile.uuid}/exportTotal`}
        ></MetricCount>
      ),
      id: "exports",
      accessor: (i) => i,
      style: {
        width: "12%",
        textAlign: "center",
      },
      cellStyle: {
        textAlign: "center",
      },
    },
  ];
  return cols;
}

export default function Profiles(props) {
  let [profiles, setProfiles] = useState([]);
  let [verifiedOnly, setVerifedOnly] = useState(false);
  let [sortKey, setSortKey] = useState(null);
  let [sortOrder, setSortOrder] = useState(1);

  function gotData(p) {
    if (sortKey) {
      p.sort((i, j) => {
        if (sortOrder == 1)
          return objectPath.get(i, sortKey) > objectPath.get(j, sortKey)
            ? 1
            : -1;
        if (sortOrder == -1)
          return objectPath.get(i, sortKey) < objectPath.get(j, sortKey)
            ? 1
            : -1;
      });
    }

    // Filter out the orphan container profile entry
    if (p && p.length) {
      let filteredProfilesArray = [...p];
      for (let i = filteredProfilesArray.length - 1; i >= 0; i--) {
          if (filteredProfilesArray[i].name === 'Orphan Container Profile') {
                  filteredProfilesArray.splice(i, 1)
          }
      }
      p = filteredProfilesArray;
    }

    setProfiles(p);
  }

  useEffect(() => {
    api.getPublishedProfiles({ verifiedOnly }).then(gotData);
  }, [sortKey, sortOrder, verifiedOnly]);

  function showVerified() {
    setVerifedOnly(!verifiedOnly);
  }
  function sort(accessor, order) {
    setSortKey(accessor);
    setSortOrder(order);
  }
  function genSortHeader(title, accessor) {
    return function SortHeader() {
      return (
        <span
          onClick={() => {
            sort(accessor, sortOrder * -1);
          }}
        >
          {title}
          {sortKey == accessor && sortOrder == 1 && (
            <i className="fa fa-arrow-up"></i>
          )}
          {sortKey == accessor && sortOrder == -1 && (
            <i className="fa fa-arrow-down"></i>
          )}
        </span>
      );
    };
  }

  let columns = React.useMemo(() => getCols(genSortHeader), [
    sortOrder,
    sortKey,
  ]);

  //<LoadingSpinner></LoadingSpinner>

  return (
    <>
      <main id="main-content">
        <div className="grid-container margin-top-4">
          <section className="grid-container usa-section">
            <div style={{ textAlign: "center" }}>
              <p className="font-sans-lg">
                If you are new the xAPI Profile specification, please read the{" "}
                <a href="/help#resourcestop" target>
                  before you begin
                </a>{" "}
                section, or visit the {" "}
                <a href="https://adlnet.gov/guides/xapi-profile-server/" target>
                  Profile Server Info Page. 
                </a>
              </p>
            </div>
            <div className="grid-row grid-gap" style={{ color: "#1c3664" }}>
              <hr style={{ color: "#FFFFFF" }}></hr>
              <h1 className="font-sans-xl text-center">
                xAPI PROFILE GUIDELINES
              </h1>
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
                    satisfy with xAPI such as improving learning, human
                    performance, or even business processes.
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
                    The Profile Server has a built in seach feature when adding
                    new profiles. Always search on exisiting vocabulary
                    concepts, profiles, and statementtemplates before defining
                    your own.
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
                    Create functional examples and send statements to an LRS.
                    Query the LRS and visualize the data to help inform any
                    changes or refinements to your profile.
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
                    . The profiles and vocabulary concepts are curated by the
                    xAPI community and shared on this site for reuse.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div id="profiles" className="grid-row display-flex flex-row flex-align-end">
            <div className="grid-col">
              <h1>Profiles</h1>
            </div>
            <div className="grid-col display-flex flex-column flex-align-end">
              <Link to="/profiles/create">
                <button className="usa-button margin-y-2 margin-right-0">
                  <i className="fa fa-plus margin-right-05"></i>
                  Create xAPI Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="usa-footer__primary-section">
          <div className="grid-container">
            <div className="grid-row display-flex flex-row flex-align-end bg1">
              <div className="grid-col">
                <MostViewedGraph a></MostViewedGraph>
              </div>
              <div className="grid-col">
                <MostExportedGraph b></MostExportedGraph>
              </div>
            </div>
          </div>
        </div>
        <div className="grid-container padding-bottom-4">
          <div className="grid-row display-flex flex-row flex-align-end">
            <div className="grid-col">
              <h2>All Published Profiles</h2>
            </div>
            <div className="grid-col display-flex flex-column flex-align-end">
              <div className="usa-checkbox">
                <input
                  className="usa-checkbox__input"
                  id="washington"
                  type="checkbox"
                  name="historical-figures-1"
                  value="washington"
                ></input>
                <label
                  className="usa-checkbox__label"
                  onClick={(e) => showVerified()}
                  htmlFor="washington"
                >
                  Show Verified Only
                </label>
              </div>
            </div>
          </div>

          <div className="grid-row">
            <PagingTable
              columns={columns}
              data={profiles}
              emptyMessage="There are no published profiles"
              showPageHeader={false}
              clearSearch={() => {}}
            />
          </div>
        </div>
      </main>{" "}
    </>
  );
}
