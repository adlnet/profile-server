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
import { reloadCurrentProfile } from './profiles';

export const SELECT_TEMPLATE = 'SELECT_TEMPLATE';

export const START_GET_TEMPLATE = 'START_GET_TEMPLATE';
export const FINISH_GET_TEMPLATE = 'FINISH_GET_TEMPLATE';

export const START_GET_TEMPLATES = 'START_GET_TEMPLATES';
export const FINISH_GET_TEMPLATES = 'FINISH_GET_TEMPLATES'

export const START_CREATE_TEMPLATE = 'START_CREATE_TEMPLATE';
export const FINISH_CREATE_TEMPLATE= 'FINISH_CREATE_TEMPLATE';

export const START_EDIT_TEMPLATE = 'START_EDIT_TEMPLATE';
export const FINISH_EDIT_TEMPLATE = 'FINISH_EDIT_TEMPLATE';

export const START_DELETE_TEMPLATE = 'START_DELETE_TEMPLATE';
export const FINISH_DELETE_TEMPLATE= 'FINISH_DELETE_TEMPLATE';

export const START_SEARCH_TEMPLATES = 'START_SEARCH_TEMPLATES';
export const FINISH_SEARCH_TEMPLATES= 'FINISH_SEARCH_TEMPLATES';
export const CLEAR_TEMPLATE_RESULTS= 'CLEAR_TEMPLATE_RESULTS';

export const START_UPDATE_TEMPLATE = 'START_UPDATE_TEMPLATE';
export const FINISH_UPDATE_TEMPLATE= 'FINISH_UPDATE_TEMPLATE'

export const SELECT_TEMPLATE_RESULT= 'SELECT_TEMPLATE_RESULT';
export const DESELECT_TEMPLATE_RESULT= 'DESELECT_TEMPLATE_RESULT';



export function selectTemplateResult(template)
{
    return {
        type: SELECT_TEMPLATE_RESULT,
        template: template,
    }
}
export function deselectTemplateResult(template)
{
    return {
        type: DESELECT_TEMPLATE_RESULT,
        template: template,
    }
}

export function reloadCurrentTemplate() {
    return async function(dispatch, getState) {
       let state = getState();
       let templateId = state.application.selectedTemplateId;
       if(templateId)
        dispatch(selectTemplate(templateId))
    };
}

export function selectTemplate(templateId) {
    return async function(dispatch, getState) {
        let state = getState();
        if(!state.application.selectedOrganizationId || !state.application.selectedProfileId || !templateId)
            return;
        dispatch({
            type: START_GET_TEMPLATE,
            templateId: templateId,
        });
        const template = await API.getTemplate(state.application.selectedOrganizationId,state.application.selectedProfileId,templateId);

        dispatch({
            type: FINISH_GET_TEMPLATE,
            template: template,
        });

        dispatch({
            type: SELECT_TEMPLATE,
            template: template,
        });
    };
}

export function createTemplate(template) {
    return async function(dispatch,getState) {
        let state = getState();
        dispatch({
            type: START_CREATE_TEMPLATE,
            
        });

        const newTemplate = await API.createTemplate(state.application.selectedOrganizationId,state.application.selectedProfileId,template);

        dispatch({
            type: FINISH_CREATE_TEMPLATE,
            template: newTemplate,
        });

        dispatch(reloadCurrentProfile());
       
        history.push("../templates")
    };
}

export function editTemplate(template)
{
    return async function(dispatch,getState) {
    let state = getState();
        dispatch({
            type: START_EDIT_TEMPLATE,
        });

        const newTemplate = await API.editTemplate(state.application.selectedOrganizationId,state.application.selectedProfileId,template);
     
        dispatch({
            type: FINISH_EDIT_TEMPLATE,
            template: newTemplate,
        });

    
        dispatch(reloadCurrentProfile());

    }
}

export function searchTemplates(search) {
    return async function(dispatch) {
      
        dispatch({
            type: START_SEARCH_TEMPLATES,
        });

        const templates = await API.searchTemplates(search);

        dispatch({
            type: FINISH_SEARCH_TEMPLATES,
            templates: templates,
        });

    };

}

export function getTemplates(organizationId, profileId) {
    return async function(dispatch) {
        dispatch({
            type: START_GET_TEMPLATES,
            profileId: profileId,
        });

        const templates = await API.getTemplates(organizationId,profileId);

        dispatch({
            type: FINISH_GET_TEMPLATES,
            templates: templates,
        });

    };

}

export function removeConceptFromTemplate(concept)
{
    return async function(dispatch,getState) {
        let state = getState();
            dispatch({
                type: START_UPDATE_TEMPLATE,
            });
    
           
            let currentTemplate = state.application.selectedTemplate;
            currentTemplate = JSON.parse(JSON.stringify(currentTemplate));
            
            if(!currentTemplate.concepts) currentTemplate.concepts = [];

            currentTemplate.concepts = currentTemplate.concepts.filter( i => i!==concept.uuid)
    
            await API.editTemplate(state.application.selectedOrganizationId,state.application.selectedProfileId,currentTemplate);
            dispatch({
                type: FINISH_UPDATE_TEMPLATE,
              
            });
    
            dispatch(reloadCurrentTemplate());
            dispatch(reloadCurrentProfile());
         
        }
}

export function reloadTemplates() {
    return async function(dispatch, getState) {
        let state = getState();
        if(!state.application.selectedOrganizationId || !state.application.selectedProfileId)
            return;
        dispatch({
            type: START_GET_TEMPLATES,
            profileId: state.application.selectedProfileId,
        });

        const templates = await API.getTemplates(state.application.selectedOrganizationId,state.application.selectedProfileId);

        dispatch({
            type: FINISH_GET_TEMPLATES,
            templates: templates,
        });

    };

}
