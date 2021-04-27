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
import { useSelector, useDispatch } from 'react-redux';

export default function ErrorBoundary() {
    const dispatch = useDispatch();
    const errors = useSelector(state => state.errors);

    function dismissError(error) {
        dispatch({ type: 'CLEAR_ERROR', error: error })
    }

    return (
        (errors && errors.length > 0) ?
            errors.map((error, i) =>
                <div key={error.uuid || i} className="usa-alert usa-alert--error usa-alert--slim" role="alert">
                    <div className="usa-alert__body">
                        <h3 className="usa-alert__heading">{`${error.errorType} Error`}</h3>
                        <p className="usa-alert__text">{error.type} {error.error}</p>
                        <p>Click <button
                            className="usa-button usa-button--unstyled display-inline"
                            onClick={() => dismissError(error)}
                        >here</button> to dismiss.</p>
                    </div>
                </div>
            ) : ''
    );
}

