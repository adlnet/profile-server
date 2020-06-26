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

export default function StatementExample({ statementExample, onAddClick, onEditClick }) {
    return (<>
        { !statementExample ? <>
                <div className="grid-row">
                    <span className="font-sans-3xs text-base-light">            
                        It is highly recommended that an example be added to this template for...
                    </span>
                </div>
                <div className="grid-row">
                    <button 
                            className="usa-button margin-top-2"
                            onClick={onAddClick}
                    >
                        Add Example
                    </button>
                </div>
            </> : <>
                <div className="grid-row">
                    <div className="grid-col display-flex flex-align-center">
                        <span className="font-sans-3xs text-base-light">            
                            It is highly recommended that an example be added to this template for...
                        </span>
                    </div>
                    <div className="grid-col display-flex flex-column flex-align-end">
                        <button 
                                className="usa-button margin-top-2" style={{margin: '0'}}
                                onClick={onEditClick}
                        >
                            <i className="fa fa-pencil margin-right-1"></i>Edit Example
                        </button>
                    </div>
                </div>
                <div className="grid-row margin-y-2">
                    <div className="border-1px border-base-lighter minh-mobile maxh-mobile width-full padding-1 overflow-auto">
                        <pre className="font-sans-xs margin-0">{statementExample}</pre>
                    </div>
                </div>
            </>
        }
    </>);
}