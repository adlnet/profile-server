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
import React from 'react';


export default function Flyout({ show, onClose, hasOnPrevious=false, onPrevious, children }) {
    
    return (<>
        <div id="flyout" className={`${(show ? "show" : "hide")}`}>
            <div className="flyout-close pull-right padding-3" onClick={onClose}><span className="fa fa-close"></span></div>
            {hasOnPrevious && <div className="flyout-previous pull-right padding-3" onClick={onPrevious}><span className="fa fa-angle-left"></span></div>}
            {children}
        </div>
    </>);
}
