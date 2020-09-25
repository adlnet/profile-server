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
import React, { useState } from "react";

export default function ProfilePublishButton({ onPublish }) {
  const [showDropdown, setShowDropdown] = useState(false);

  function handleDropdownToggle() {
    setShowDropdown(!showDropdown);
  }

  return (
    <>
      <button onClick={onPublish} className="profile-publish-button">
        <b>Publish To Public</b>
      </button>
      <button
        className="profile-file-interaction-button"
        onClick={handleDropdownToggle}
      >
        <i className="fa fa-ellipsis-h"></i>
        <div
          className={`profile-dropdown display-${
            showDropdown ? "block" : "none"
          }`}
        >
          <ul className="profile-dropdown-menu">
            <li>Import from file</li>
            <li>Export to file</li>
          </ul>
        </div>
      </button>
    </>
  );
}
