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
import API from '../api';
import history from '../history';
import { added, created, edited, removed } from './successAlert';

export const START_GET_ORG = 'START_GET_ORG';
export const START_GET_MEMBERS = 'START_GET_MEMBERS';
export const START_GET_ORGS = 'START_GET_ORGS';
export const START_CREATE_ORG = 'START_CREATE_ORG';
export const START_UPDATE_ORG = 'START_UPDATE_ORG';
export const START_DELETE_ORG = 'START_DELETE_ORG';
export const START_SEARCH_ORGS = 'START_SEARCH_ORGS';

export const FINISH_CREATE_ORG = 'FINISH_CREATE_ORG';
export const FINISH_GET_ORG = 'FINISH_GET_ORG';
export const FINISH_GET_ORGS = 'FINISH_GET_ORGS';
export const FINISH_UPDATE_ORG = 'FINISH_UPDATE_ORG';
export const FINISH_DELETE_ORG = 'FINISH_DELETE_ORG';
export const FINISH_SEARCH_ORGS = 'FINISH_SEARCH_ORGS';
export const CLEAR_SEARCH_ORGS = 'CLEAR_SEARCH_ORGS';
export const FINISH_GET_MEMBERS = 'FINISH_GET_MEMBERS';

export const ERROR_CREATE_ORG = 'ERROR_CREATE_ORG';
export const ERROR_GET_ORG = 'ERROR_GET_ORG';
export const ERROR_GET_ORGS = 'ERROR_GET_ORGS';
export const ERROR_UPDATE_ORG = 'ERROR_UPDATE_ORG';
export const ERROR_DELETE_ORG = 'ERROR_DELETE_ORG';
export const CLEAR_ERROR_ORG = 'CLEAR_ERROR_ORG';
export const ERROR_GET_MEMBERS = 'ERROR_GET_MEMBERS';
export const START_JOIN_ORG = 'START_JOIN_ORG';
export const ERROR_JOIN_ORG = 'ERROR_JOIN_ORG';
export const FINISH_JOIN_ORG = 'FINISH_JOIN_ORG';

export const START_DENY_MEMBER_REQUEST = 'START_DENY_MEMBER_REQUEST'
export const ERROR_DENY_MEMBER_REQUEST = 'ERROR_DENY_MEMBER_REQUEST'
export const FINISH_DENY_MEMBER_REQUEST = 'FINISH_DENY_MEMBER_REQUEST'

export const START_REVOKE_MEMBER_REQUEST = 'START_REVOKE_MEMBER_REQUEST';
export const ERROR_REVOKE_MEMBER_REQUEST = 'ERROR_REVOKE_MEMBER_REQUEST';
export const FINISH_REVOKE_MEMBER_REQUEST = 'FINISH_REVOKE_MEMBER_REQUEST';


export const START_APPROVE_MEMBER = 'START_APPROVE_MEMBER';
export const ERROR_APPROVE_MEMBER = 'ERROR_APPROVE_MEMBER';
export const FINISH_APPROVE_MEMBER = 'FINISH_APPROVE_MEMBER';

export const SELECT_ORG = 'SELECT_ORG';

export const START_SEARCH_USERS = "START_SEARCH_USERS";
export const FINISH_SEARCH_USERS = "FINISH_SEARCH_USERS";
export const CLEAR_USER_RESULTS = "CLEAR_USER_RESULTS";
export const SELECT_USER_RESULT = "SELECT_USER_RESULT";
export const DESELECT_USER_RESULT = "DESELECT_USER_RESULT";
export const ERROR_SEARCH_ORG = 'ERROR_SEARCH_ORG';
export const ERROR_SEARCH_USERS = 'ERROR_SEARCH_USERS';

export function clearOrganizationError() {
    return function (dispatch) {
        dispatch({
            type: CLEAR_ERROR_ORG
        });
    }
}

export function clearOrganizationSearchResults() {
    return function (dispatch) {
        dispatch({
            type: CLEAR_SEARCH_ORGS
        });
    }
}

export function deleteOrganization(orgId) {
    return async function (dispatch) {
        dispatch({
            type: START_DELETE_ORG,
            organizationId: orgId,
        });

        try {
            await API.deleteOrganization(orgId);
        } catch (err) {
            dispatch({
                type: ERROR_DELETE_ORG,
                errorType: 'organizations',
                error: err.message,
            })
        }
        dispatch({
            type: FINISH_DELETE_ORG,
        });

        dispatch(getOrganizations())
        history.push('/')
    };
}

export function createOrganization(org) {
    return async function (dispatch) {
        dispatch({
            type: START_CREATE_ORG,
        });

        try {
            let neworg = await API.createOrganization(org);

            dispatch(selectOrganization(neworg.uuid));
            dispatch(getOrganizations());
            dispatch(created(org.name))

            history.push(`/organization/${neworg.uuid}`);
        } catch (err) {
            dispatch({
                type: ERROR_CREATE_ORG,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_CREATE_ORG
            });
        }
    };
}

export function editOrganization(organization) {
    return async function (dispatch) {
        dispatch({
            type: START_UPDATE_ORG,
        });

        let editedOrganization;
        try {
            editedOrganization = await API.editOrganization(organization);

            dispatch(selectOrganization(editedOrganization.uuid));
            dispatch(edited());
        } catch (err) {
            dispatch({
                type: ERROR_UPDATE_ORG,
                errorType: 'organizations',
                error: err.message,
            });
        } finally {
            dispatch({
                type: FINISH_UPDATE_ORG,
            })
        }
    }
}

export function selectOrganization(orgId, optionalCallback) {
    return async function (dispatch) {
        dispatch({
            type: START_GET_ORG,
        });

        let org;
        try {
            org = await API.getOrganization(orgId);

            dispatch({
                type: SELECT_ORG,
                organization: org,
            });
        } catch (err) {
            dispatch({
                type: ERROR_GET_ORG,
                errorType: 'organizations',
                error: err.message,
            });

        } finally {
            dispatch({
                type: FINISH_GET_ORG
            });
            if (optionalCallback) optionalCallback(org);
        }
    };
}

export function getOrganizations() {
    return async function (dispatch) {
        dispatch({
            type: START_GET_ORGS,
        });

        let orgs;
        try {
            orgs = await API.getOrganizations();
        } catch (err) {
            dispatch({
                type: ERROR_GET_ORGS,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_GET_ORGS,
                organizations: orgs,
            });
        }
    };
}

export function getMembers() {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;

        dispatch({
            type: START_GET_MEMBERS,
        });

        let members;
        try {
            members = await API.getMembers(organizationId);
        } catch (err) {
            dispatch({
                type: ERROR_GET_MEMBERS,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_GET_MEMBERS,
                members: members,
            });
        }
    };
}

/** to be called when an admin denies a request someone made to join the org */
export function denyMemberRequest(userId) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;

        dispatch({
            type: START_DENY_MEMBER_REQUEST,
        });

        try {
            await API.denyMemberRequest(organizationId, userId);
        } catch (err) {
            dispatch({
                type: ERROR_DENY_MEMBER_REQUEST,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_DENY_MEMBER_REQUEST,
            });
        }
    };
}

/** to be called when the user who requested to join an org cancels that request */
export function revokeMemberRequest(userId, orguuid) {
    return async function (dispatch) {
        dispatch({
            type: START_REVOKE_MEMBER_REQUEST,
        });

        try {
            await API.revokeMemberRequest(orguuid, userId);
        } catch (err) {
            dispatch({
                type: ERROR_REVOKE_MEMBER_REQUEST,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_REVOKE_MEMBER_REQUEST,
            });
        }
    };
}

export function removeMember(memberId, orgId) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = orgId || state.application.selectedOrganizationId;

        dispatch({
            type: START_GET_MEMBERS,
        });

        let members;
        try {
            members = await API.removeMember(organizationId, memberId);
            dispatch(removed('member'))
        } catch (err) {
            dispatch({
                type: ERROR_GET_MEMBERS,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_GET_MEMBERS,
                members: members,
            });
        }
    };
}
export function updateMember(member, role) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;

        dispatch({
            type: START_GET_MEMBERS,
        });

        let members;
        try {
            members = await API.editMember(organizationId, {
                user: { id: member._id },
                level: role
            });
            dispatch(edited());
        } catch (err) {
            dispatch({
                type: ERROR_GET_MEMBERS,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_GET_MEMBERS,
                members: members,
            });
        }
    };
}
export function addMember(member, role) {
    if (!Array.isArray(member)) {
        member = [member]
    }
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        for (let i in member) {
            dispatch({
                type: START_GET_MEMBERS,
            });

            let members;
            try {
                members = await API.addMember(organizationId, {
                    user: { id: member[i]._id },
                    level: role,
                });
                console.log(member, members)
                let alertText = 'Member'
                if (members && members.length > 0 && members.find(m => m.user._id === member[i]._id)) alertText = members.find(m => m.user._id === member[i]._id).user.email;
                dispatch(added(alertText))
            } catch (err) {
                dispatch({
                    type: ERROR_GET_MEMBERS,
                    errorType: 'organizations',
                    error: err.message,
                })
            } finally {
                dispatch({
                    type: FINISH_GET_MEMBERS,
                    members: members,
                });
            }
        }
    };
}

export function approveMember(member, role) {
    return async function (dispatch, getState) {
        const state = getState();
        const organizationId = state.application.selectedOrganizationId;
        dispatch({
            type: START_APPROVE_MEMBER,
        });

        let members;
        try {
            members = await API.approveMember(organizationId, {
                user: { id: member._id },
                level: role,
            });
        } catch (err) {
            dispatch({
                type: ERROR_APPROVE_MEMBER,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_APPROVE_MEMBER,
                members: members,
            });
        }
    };
}

export function requestJoinOrganization(organizationUUID, user) {
    return async function (dispatch) {
        dispatch({
            type: START_JOIN_ORG,
        })

        let organization;
        try {
            organization = await API.requestJoinOrganization(organizationUUID, user);
        } catch (err) {
            dispatch({
                type: ERROR_JOIN_ORG,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_JOIN_ORG,
                organization: organization,
            });
        }
    }
}

export function searchOrganizations(search, limit, page, sort) {
    return async function (dispatch) {

        dispatch({
            type: START_SEARCH_ORGS,
        });

        let orgs
        try {
            orgs = await API.searchOrganizations(search, limit, page, sort);
        } catch (err) {
            dispatch({
                type: ERROR_SEARCH_ORG,
                errorType: 'organizations',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_SEARCH_ORGS,
                organizations: orgs,
            })
        }
    }
}


export function searchUsers(search) {
    return async function (dispatch) {

        dispatch({
            type: START_SEARCH_USERS,
        });

        let users;
        try {
            users = await API.searchUsers(search);
        } catch (err) {
            dispatch({
                type: ERROR_SEARCH_USERS,
                errorType: 'users',
                error: err.message,
            })
        } finally {
            dispatch({
                type: FINISH_SEARCH_USERS,
                users: users,
            });
        }

    };
}

export function clearUserResults() {
    return {
        type: CLEAR_USER_RESULTS,
    }
}

export function selectUserResult(user) {
    return {
        type: SELECT_USER_RESULT,
        user: user,
    }
}

export function deselectUserResult(user) {
    return {
        type: DESELECT_USER_RESULT,
        user: user,
    }
}