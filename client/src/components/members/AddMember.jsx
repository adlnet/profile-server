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
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { searchUsers, selectUserResult, clearUserResults, deselectUserResult, addMember } from "../../actions/organizations";
import SearchSelectComponent from '../controls/search-select/searchSelectComponent';
import { SearchSelectResultView } from '../controls/search-select/searchSelectView';

function UserResult({ result, children })
{
   return (
        <SearchSelectResultView
            result={result}
            resultName='username'
            resultDescription='email'
            subdescriptionView={<div></div>}
            onViewDetailsClick={ ()=>{}}
    
        >
            { children}
        </SearchSelectResultView>
   )
}

export default function AddMember() {
    const dispatch = useDispatch();
    const history = useHistory();

    const organization = useSelector((state) => state.application.selectedOrganization);
    const selectedUsers = useSelector((state) => state.searchResults.selectedUsers)
    const userResults = useSelector((state) => state.searchResults.users)

    async function handleAddToOrganizationClick()
    {
        await dispatch(addMember(selectedUsers))
        await dispatch(clearUserResults())
        history.goBack();
    }

    function handleCancel()
    {
        history.goBack();
    }

    if (!organization) {
        return '';
    }
    return (
        <div className="container"><SearchSelectComponent
                searchFunction={(searchValues) => dispatch(searchUsers(searchValues))}
                clearSearchFunction={() => dispatch(clearUserResults())}
                searchMessage="Search for users to add to this organization"
                searchResults={userResults}
                selectResultFunction={(member) => dispatch(selectUserResult(member))}
                removeSelectedResultFunction={(pattern) => dispatch(deselectUserResult(pattern))}
                clearSelectedResultsFunction={() => dispatch(clearUserResults())}
                selectedResults={selectedUsers}
                selectionMessage={'Selected Users'}
                resultView={<UserResult/>}
            />

            <div className="grid-row">
                <div className="grid-col">
                    <button className="usa-button usa-button--unstyled padding-y-105" onClick={handleCancel}><b>Cancel</b></button>
                </div>
                <div className="grid-col">
                    <button 
                            onClick={handleAddToOrganizationClick}
                            className="usa-button margin-right-0 pin-right"
                            disabled={!(selectedUsers && selectedUsers.length > 0)}
                    >
                        Add to Organization
                    </button>
                </div>
            </div>
        </div>
    )
}
