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
import React, { useState, useEffect } from 'react';

import { SearchSelectView } from './searchSelectView';

export default function SearchSelectComponent({
    searchFunction,
    clearSearchFunction,
    searchMessage,
    searchResults,
    selectResultFunction,
    removeSelectedResultFunction,
    clearSelectedResultsFunction,
    selectedResults,
    isOneSelectionOnly,
    oneSelectionOnlyMessage,
    selectionMessage,
    resultView,
    placeholderText,
    filterOptions
}) {

    useEffect(() => {
        return function cleanUp() {
            clearSearchFunction();
            clearSelectedResultsFunction();
        }
    }, []);

    function isSelected(result) {
        if (!selectedResults) return false;
        return selectedResults.findIndex(s => s.uuid === result.uuid) === -1 ? false : true;
    }

    return (
        <SearchSelectView
            onSearchSubmit={searchFunction}
            searchMessage={searchMessage}
            searchResults={searchResults}
            selectedResults={selectedResults}
            isOneSelectionOnly={isOneSelectionOnly}
            oneSelectionOnlyMessage={oneSelectionOnlyMessage}
            selectionMessage={selectionMessage}
            isSelected={(result) => isSelected(result)}
            select={(result) => selectResultFunction(result)}
            remove={(selectedResult) => removeSelectedResultFunction(selectedResult)}
            resultView={resultView}
            placeholderText={placeholderText}
            filterOptions={filterOptions}
        />
    );
}
