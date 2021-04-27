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

import { Link, useRouteMatch } from "react-router-dom";
import { useSelector } from 'react-redux';

import { IconContext } from "react-icons";
import { FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import { RiShareForwardFill } from "react-icons/ri";

import copy from 'copy-to-clipboard';


export default function ProfilePublishButton({ isMember, isAdmin, isCurrentVersion, verificationRequest, profileVersionState, profileVersionIsVerified, onPublish, onVerification, onExport, onCopyToClipBoard, onRevokeVerification }) {
  const { url } = useRouteMatch();
  const profileURL = useSelector((state) => state.application.selectedProfile.url);

  // copy profile url to clipboard
  const onCopy = () => {
    copy(profileURL);
    onCopyToClipBoard();
  }

  return (
    <>
      <div className="button-group">
        {(isMember && isCurrentVersion) &&
          <>
            <div className="button-group__item">
              {
                (profileVersionState === 'draft') ?
                  <button
                    className="usa-button usa-button--outline"
                    data-position="bottom"
                    title="Publish to Public"
                    onClick={onPublish}
                  >
                    <p>Publish</p>
                  </button> :
                  (profileVersionState === 'published' && !profileVersionIsVerified && !verificationRequest) ?
                    <button
                      className="usa-button usa-button--outline"
                      data-position="bottom"
                      title="Request Verification"
                      onClick={onVerification}
                    >
                      <p>Request Verification</p>
                    </button> : profileVersionIsVerified && isAdmin ?
                      <button
                        className="usa-button usa-button--outline"
                        data-position="bottom"
                        title="Request Verification"
                        onClick={onRevokeVerification}
                      >
                        <p>Revoke Verification</p>
                      </button>
                      : null
              }
            </div>
            {
              isMember &&
              <Link to={`${url}/import`} className="button-group__item">
                <button
                  className="usa-button usa-button--outline"
                  data-position="bottom"
                  title="Import from file"
                >
                  <IconContext.Provider value={{ size: "1.4em" }}>
                    <FaCloudUploadAlt />
                  </IconContext.Provider>
                </button>
              </Link>
            }
          </>
        }
        <div className="button-group__item">
          <button
            className="usa-button usa-button--outline"
            data-position="bottom"
            title="Export to JSON-LD"
            onClick={onExport}
          >
            <IconContext.Provider value={{ size: "1.1em" }}>
              <FaDownload />
            </IconContext.Provider>
          </button>
        </div>
        <div className="button-group__item">
          <button
            className="usa-button usa-button--outline border-right-1"
            data-position="bottom"
            title="Share link to profile"
            onClick={onCopy}
          >
            <IconContext.Provider value={{ size: "1.2em" }}>
              <RiShareForwardFill />
            </IconContext.Provider>
          </button>
        </div>
      </div>
    </>
  );
}
