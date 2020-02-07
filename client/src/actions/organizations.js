/** ***********************************************************************
*
* Veracity Technology Consultants 
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
import API from '../api';
import history from '../history'

export const START_GET_ORG = 'START_GET_ORG';
export const START_GET_ORGS = 'START_GET_ORGS';
export const START_CREATE_ORG = 'START_CREATE_ORG';
export const START_UPDATE_ORG = 'START_UPDATE_ORG';
export const START_DELETE_ORG = 'START_DELETE_ORG';

export const FINISH_CREATE_ORG = 'FINISH_CREATE_ORG';
export const FINISH_GET_ORG = 'FINISH_GET_ORG';
export const FINISH_GET_ORGS = 'FINISH_GET_ORGS';
export const FINISH_UPDATE_ORG = 'FINISH_UPDATE_ORG';
export const FINISH_DELETE_ORG = 'FINISH_DELETE_ORG';

export const ERROR_CREATE_ORG = 'ERROR_CREATE_ORG';
export const ERROR_GET_ORG = 'ERROR_GET_ORG';
export const ERROR_GET_ORGS = 'ERROR_GET_ORGS';
export const ERROR_UPDATE_ORG = 'ERROR_UPDATE_ORG';
export const ERROR_DELETE_ORG = 'ERROR_DELETE_ORG';

export const SELECT_ORG = 'SELECT_ORG';


export function deleteOrganization(orgId) {
    return async function(dispatch) {
        dispatch({
            type: START_DELETE_ORG,
            organizationId: orgId,
        });

        await API.deleteOrganization(orgId);

        dispatch({
            type: FINISH_DELETE_ORG,
            organizationId: orgId,
        });

        dispatch(getOrganizations())
        history.push('/')
    };
}

export function createOrganization(org) {
    return async function(dispatch) {
        dispatch({
            type: START_CREATE_ORG,
            organization: org,
        });

        let neworg = await API.createOrganization(org);

        dispatch({
            type: FINISH_CREATE_ORG,
            organization: neworg,
        });

        dispatch(getOrganizations())

        history.push('/organization/' + neworg.uuid)
    };
}

export function selectOrganization(uuid) {
    return async function(dispatch) {
        dispatch({
            type: START_GET_ORG,
            organizationId: uuid,
        });

        const org = await API.getOrganization(uuid);

        dispatch({
            type: FINISH_GET_ORG,
            organization: org,
        });

        dispatch({
            type: SELECT_ORG,
            organization: org,
        });
    };
}



export function getOrganizations() {
    return async function(dispatch) {
        dispatch({
            type: START_GET_ORGS,
            
        });

        const orgs = await API.getOrganizations();

        dispatch({
            type: FINISH_GET_ORGS,
            organizations: orgs,
        });
    };
}
