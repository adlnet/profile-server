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
import { useHistory } from 'react-router-dom';

export default function ErrorPage() {
    const history = useHistory();

    return (
        <div className="grid-container" id="main-content">
            <div className="usa-alert usa-alert--error margin-y-2" role="alert">
                <div className="usa-alert__body">
                    <h3 className="usa-alert__heading">This page does not exist.</h3>
                    <p className="usa-alert__text">
                        Click <button className="usa-button usa-button--unstyled" onClick={() => history.goBack()}>here</button> to return.
                    </p>
                </div>
            </div>
        </div>
    )
}
