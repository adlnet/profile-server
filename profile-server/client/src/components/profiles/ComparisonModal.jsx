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

import ModalBox from "../controls/modalBox";

import { FaRegFileCode, FaServer } from "react-icons/fa";
import { IconContext } from "react-icons";

export default function ComparisonModal({ show, onClose, onAddToProfile, importedData, serverData, diff, serverProfileName, type }) {
  const { imported, server } = diff;

  const onClickHandler = () => {
    onAddToProfile();
    onClose();
  };

  const boldString = (s, b) => s.replace(RegExp(b, "g"), `<b>${b}</b>`);

  const formatDiff = (str, arr, compareArr) => {
    arr.forEach((element) => {
      let splitRes, query, propValue;

      if (element.indexOf(".") !== -1) {
        splitRes = element.split(".");
        propValue = compareArr[splitRes[0]][splitRes[1]];
        query = `"${splitRes[1]}": "${propValue}"`;
      } else {
        propValue = compareArr[element];
        query = Array.isArray(compareArr[element]) ? `"${propValue[0]}"` : `"${element}": "${propValue}"`;
      }

      str = boldString(str, query);
    });
    return str;
  };

  let compareLeft = JSON.stringify(importedData, undefined, 4);
  let compareRight = JSON.stringify(serverData, undefined, 4);

  return (
    <ModalBox show={show} onClose={onClose} isForm={true}>
      <div className="compare-modal-container" style={{ maxWidth: "100%" }}>
        <h2>Comparison Import with Server</h2>
        <div className="compare-modal-item">
          <div className="compare-sub">
            <IconContext.Provider value={{ size: "1.2em" }}>
              <FaRegFileCode className="margin-right-1" />
            </IconContext.Provider>
            <b>IMPORTED FROM FILE</b>
          </div>
          <div className="compare-sub">
            <IconContext.Provider value={{ size: "1.2em" }}>
              <FaServer className="margin-right-1" />
            </IconContext.Provider>
            <b>ON THE SERVER:</b>
            <span style={{ fontSize: '13px', paddingLeft: '3px' }}>
              PROFILE: <span style={{ fontSize: '13px', paddingLeft: "2px" }}>{serverProfileName.toUpperCase()}</span>
            </span>
          </div>
        </div>
        <div className="compare-modal-item-container">
          <pre className="queue-text-code modal-pre-size">
            <code>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatDiff(compareLeft, imported, importedData),
                }}
              ></span>
            </code>
          </pre>
          <pre className="queue-text-code modal-pre-size">
            <code>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatDiff(compareRight, server, serverData),
                }}
              ></span>
            </code>
          </pre>
        </div>
        <div className="compare-modal-item-container">
          <div className="compare-modal-item">
            <p style={{ width: "90%" }}>
              Your file is different than the {type} on the server. To request
              changes to the {type} on the server, please contact the Working
              Group responsible for that profile.
            </p>
          </div>
          <div className="compare-modal-item">
            <p style={{ minWidth: "50%" }}>
              We recommended adding this {type}, as it is defined on the
              server.
            </p>
            <div className="compare-button-group">
              <button
                className="usa-button"
                style={{ maxHeight: "40px", minWidth: "170px" }}
                onClick={onClickHandler}
              >
                Add to Profile
              </button>
              <button
                className="usa-button--unstyled"
                style={{ alignSelf: "flex-end", marginTop: "4px" }}
              // onClick={onClickHandler}
              >
                View info
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalBox>
  );
}
