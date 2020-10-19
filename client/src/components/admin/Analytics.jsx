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

import React, { useEffect } from 'react';
import MostViewed from "../controls/MostViewedGraph";
import MostExported from "../controls/MostExportedGraph";
import MostRetrieved from "../controls/MostAPIRetrievals";
export default function Analytics(props){

    return (<>
    <main id="main-content" className="grid-container padding-bottom-4">
        <div className="grid-row display-flex flex-row flex-align-end">
            <div className="grid-col">
                <h1>Analytics</h1>
            </div> 
        </div >
        <div className="grid-row display-flex flex-row flex-align-end">
            <div className="grid-col ">
             <MostViewed wide></MostViewed>
            </div>
        </div>
        <div className="grid-row display-flex flex-row flex-align-end">
            <div className="grid-col ">
             <MostExported wide></MostExported>
            </div>
        </div>
        <div className="grid-row display-flex flex-row flex-align-end">
            <div className="grid-col ">
             <MostRetrieved wide></MostRetrieved>
            </div>
        </div>
    </main></>)
    }
