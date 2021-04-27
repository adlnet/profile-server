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

import { SearchSelectResultView } from '../controls/search-select/searchSelectView';

export default function PatternResultView({ children, result, onViewDetailsClick }) {

    return (
        <SearchSelectResultView
            result={result}
            resultName='name'
            resultDescription='description'
            subdescriptionView={<PatternResultSubdescriptionView />}
            onViewDetailsClick={onViewDetailsClick}
        >
            {children}
        </SearchSelectResultView>
    );
}

function PatternResultSubdescriptionView({ result }) {
    return (<>
        <span style={{ textTransform: "capitalize" }}>{`${result && result.type}  |  `}</span>{`${result && (result.primary ? 'Primary' : 'Secondary')}  |  `}<span className="text-bold">Profile: </span> {`${result && result.parentProfile && result.parentProfile.name}`}
    </>);
}
