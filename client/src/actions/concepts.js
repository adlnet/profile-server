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
import { reloadCurrentTemplate, FINISH_UPDATE_TEMPLATE , START_UPDATE_TEMPLATE} from './templates';
import { reloadCurrentProfile, START_UPDATE_PROFILE, FINISH_UPDATE_PROFILE } from './profiles';


export const SELECT_CONCEPT = 'SELECT_CONCEPT';

export const START_CREATE_CONCEPT = 'START_CREATE_CONCEPT';
export const FINISH_CREATE_CONCEPT= 'FINISH_CREATE_CONCEPT';


export const START_SEARCH_CONCEPTS = 'START_SEARCH_CONCEPTS';
export const FINISH_SEARCH_CONCEPTS= 'FINISH_SEARCH_CONCEPTS';

export const SELECT_CONCEPT_RESULT = 'SELECT_CONCEPT_RESULT';
export const DESELECT_CONCEPT_RESULT = 'DESELECT_CONCEPT_RESULT';
export const CLEAR_CONCEPT_RESULTS = 'CLEAR_CONCEPT_RESULTS';

export const START_EDIT_CONCEPT = 'START_EDIT_CONCEPT';
export const FINISH_EDIT_CONCEPT = 'FINISH_EDIT_CONCEPT';

export function createConcept(concept) {
    return async function(dispatch,getState) {
        let state = getState();
        dispatch({
            type: START_CREATE_CONCEPT,
        });

        const newConcept = await API.createConcept(state.application.selectedOrganizationId,state.application.selectedProfileId,concept);

        dispatch({
            type: FINISH_CREATE_CONCEPT,
            concept: newConcept,
        });

      
        dispatch(reloadCurrentProfile());
        
        history.push("../templates")
    };
}

export function searchConcepts(search)
{
    return async function(dispatch) {
      
        dispatch({
            type: START_SEARCH_CONCEPTS,
        });

        const concepts = await API.searchConcepts(search);

        dispatch({
            type: FINISH_SEARCH_CONCEPTS,
            concepts: concepts,
        });
    };
}

export function selectConceptResult(concept)
{
    return {
        type: SELECT_CONCEPT_RESULT,
        concept: concept,
    }
}

export function deselectConceptResult(concept)
{
    return {
        type: DESELECT_CONCEPT_RESULT,
        concept: concept,
    }
}

export function addSelectedConceptsToTemplate()
{
    return async function(dispatch,getState) {
        let state = getState();
            dispatch({
                type: START_UPDATE_TEMPLATE,
            });
    
         
           
            let currentTemplate = state.application.selectedTemplate;
            currentTemplate = JSON.parse(JSON.stringify(currentTemplate));
            
            if(!currentTemplate.concepts) currentTemplate.concepts = [];

            for(let i of state.searchResults.selectedConcepts)
                currentTemplate.concepts.push(i.uuid);
    
            await API.editTemplate(state.application.selectedOrganizationId,state.application.selectedProfileId,currentTemplate);
            dispatch({
                type: FINISH_UPDATE_TEMPLATE,
              
            });
    
            dispatch(reloadCurrentTemplate());
            dispatch(reloadCurrentProfile());
         
            history.push("../templates")
        }
}

export function addSelectedConceptsToProfile()
{
    return async function(dispatch,getState) {
        let state = getState();
        let currentProfile = state.application.selectedProfile;
            dispatch({
                type: START_UPDATE_PROFILE,
            });
     
            currentProfile = JSON.parse(JSON.stringify(currentProfile));
            
            if(!currentProfile.concepts) currentProfile.concepts = [];
            for(let i of state.searchResults.selectedConcepts)
                currentProfile.concepts.push(i.uuid);
    
            await API.editProfile(state.application.selectedOrganizationId,currentProfile);
            
            dispatch({
                type: FINISH_UPDATE_PROFILE,
              
            });
    
           
            dispatch(reloadCurrentProfile());
            
            history.push("../templates")
        }
}

export function createConceptInTemplate(concept)
{
    return async function(dispatch,getState) {
    let state = getState();
        dispatch({
            type: START_CREATE_CONCEPT,
        });

        const newConcept = await API.createConcept(state.application.selectedOrganizationId,state.application.selectedProfileId,concept);
        let currentTemplate = state.application.selectedTemplate;
        currentTemplate = JSON.parse(JSON.stringify(currentTemplate));
        
        if(!currentTemplate.concepts) currentTemplate.concepts = [];
        currentTemplate.concepts.push(newConcept.uuid);

        await API.editTemplate(state.application.selectedOrganizationId,state.application.selectedProfileId,currentTemplate);
        dispatch({
            type: FINISH_CREATE_CONCEPT,
            concept: newConcept,
        });

       
        dispatch(reloadCurrentProfile());
        
        history.push("../templates")
    }
}

export function editConcept(concept)
{
    return async function(dispatch,getState) {
    let state = getState();
        dispatch({
            type: START_EDIT_CONCEPT,
        });

        const newConcept = await API.editConcept(state.application.selectedOrganizationId,state.application.selectedProfileId,concept);
     
        dispatch({
            type: FINISH_EDIT_CONCEPT,
            concept: newConcept,
        });

    
        dispatch(reloadCurrentProfile());

    }
}


