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

import { NavLink } from "react-router-dom";

const CardListItem = ({ ctaText, to, keyName, keyValue }) => {
    return (

          <div className="card-list-item">
            <NavLink
              exact
              to={to}
              className="font-sans-md"
            >
              <span style={{display:'flex', alignItems:'center'}}dangerouslySetInnerHTML={{__html:ctaText}}></span>
            </NavLink>
            <div className="font-sans-md card-list-sub">
              <span>{keyName}:</span> {keyValue}
            </div>
          </div>
    );
  };

  export default CardListItem;
  