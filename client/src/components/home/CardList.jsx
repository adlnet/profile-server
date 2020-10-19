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

import { Link } from "react-router-dom";

import SvgArrow from "../icons/SvgArrow";

import CardListItem from "./CardListItem";

const CardList = ({ header, items, cta, keyName, to, children }) => {
  const [mouseOver, setMouseOver] = useState(false);

  const onMouseOver = (e) => {
    setMouseOver(true);
  };
  const onMouseLeave = (e) => {
    setMouseOver(false);
  };

  return (
    <div className="card-list">
      <header className="font-sans-lg">{header}</header>
        {items.map((item, index) => (
          <CardListItem
            key={item.uuid}
            ctaText={
              `<span>${item.name}</span>${item.isVerified ? '<img class="margin-left-1" src="/assets/uswds/2.4.0/img/verified.svg" alt="This profile is verified" title="This profile is verified" width="18px" height="18px" />' : ''}`
            }
            keyName={keyName}
            keyValue={item.subName}
            to={item.url}
          />
        ))}
        {children && children}
        {cta && (
          <Link
            to={{
              pathname: cta.linkTo,
              state:{
                search:'',
                category: to
              }             
            }}
            className="font-sans-sm usa-link card-cta card-cta-container"
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
          >
            {cta.text}
            <SvgArrow hover={mouseOver} />
          </Link>
        )}
    </div>
  );
};

export default CardList;
