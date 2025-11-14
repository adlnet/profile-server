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
import React, { useState, useEffect } from "react";

// usa-nav__primary-item>a:hover and [href]:focus cause the blue box
export default function SunsetBanner() {
    return (
      <div style={{"textWrap": "wrap",  padding: "2px", margin: "2px", backgroundColor:"white", borderStyle: "double", borderColor: "red", textAlign:"center", fontSize: "16px"}}>
          <b style={{color: "rgb(95, 6, 6)"}}>Notice:</b> As part of ADL's lifecycle management process, after November 18th, ADL will
          no longer maintain or host the legacy xAPI community tools, including this one.  These tools will still
          be available on the ADL GitHub site, free to download and self-host within your organization's own network 
          boundaries: <a style={{backgroundColor:"white"}} target="_blank" href="https://github.com/orgs/adlnet/repositories">https://github.com/orgs/adlnet/repositories</a>.
          <br/><br/>
          If you need any assistance, reach out to the ADL support team <a style={{backgroundColor:"white"}} href="mailto:itsupport@adlnet.gov">itsupport@adlnet.gov</a>
      </div>
    );
}