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

import * as org_actions from "../actions/organizations";
import * as profile_actions from "../actions/profiles";
import * as template_actions from "../actions/templates";
import * as concept_actions from "../actions/concepts";
const { produce } = require('immer');


function organizations(orgs,action)
{
    if(action.type == org_actions.FINISH_GET_ORGS)
    {
        orgs = action.organizations;
        return orgs;
    } 
    return orgs;
}
function profiles(profiles,action)
{
    if(action.type == profile_actions.FINISH_GET_PROFILES)
    {
        profiles = action.profiles;
        return profiles;
    } 
    return profiles;
}
function account(account)
{
    return account;
}

function session(session)
{
    return session;
}

function application(application,action)
{
    if(action.type === org_actions.SELECT_ORG)
    {
        application.selectedOrganizationId = action.organization.uuid;
        application.selectedOrganization = action.organization;
    }
    
    if(action.type === profile_actions.SELECT_PROFILE)
    {
        
        application.selectedProfileId = action.profile.uuid;
        application.selectedProfile = action.profile;
    }

    if(action.type === template_actions.SELECT_TEMPLATE)
    {
        application.selectedTemplateId = action.template.uuid;
        application.selectedTemplate = action.template;
    }

    if(action.type.indexOf("START") === 0)
    {
        application.loading++;
    }
    if(action.type.indexOf("FINISH") === 0)
    {
        application.loading--;
    }
    return application;
}
function concepts(concepts,action)
{
    if(action.type === profile_actions.FINISH_POPULATE_PROFILE)
    {
       
        return action.concepts
    }
    return concepts;
}
function templates(templates,action)
{
    if(action.type === profile_actions.FINISH_POPULATE_PROFILE)
    {
        return action.templates
    }
    if(action.type === template_actions.FINISH_GET_TEMPLATES)
    {
        return action.templates
    }
    return templates;
}
function searchResults(searchResults,action)
{
    if(action.type == template_actions.FINISH_SEARCH_TEMPLATES)
    {
       
        searchResults.templates = action.templates;
    }
    if(action.type == template_actions.SELECT_TEMPLATE_RESULT)
    {   
        if(!searchResults.selectedTemplates)
            searchResults.selectedTemplates = []
        searchResults.selectedTemplates.push(action.template);
    }
    if(action.type == template_actions.DESELECT_TEMPLATE_RESULT)
    {   
        
        if(!searchResults.selectedTemplates)
            searchResults.selectedTemplates = []
        searchResults.selectedTemplates = searchResults.selectedTemplates.filter( i => i.uuid !== action.template.uuid)
    }
    if(action.type == template_actions.CLEAR_TEMPLATE_RESULTS)
    {
        searchResults.selectedTemplates = [];
        searchResults.templates = [];
    }


    if(action.type == concept_actions.FINISH_SEARCH_CONCEPTS)
    {
    
        searchResults.concepts = action.concepts;
    }
    if(action.type == concept_actions.SELECT_CONCEPT_RESULT)
    {   
        if(!searchResults.selectedConcepts)
            searchResults.selectedConcepts = []
        searchResults.selectedConcepts.push(action.concept);
    }
    if(action.type == concept_actions.DESELECT_CONCEPT_RESULT)
    {   
        
        if(!searchResults.selectedConcepts)
            searchResults.selectedConcepts = []
        searchResults.selectedConcepts = searchResults.selectedConcepts.filter( i => i.uuid !== action.concept.uuid)
    }
    if(action.type == concept_actions.CLEAR_CONCEPT_RESULTS)
    {
        searchResults.selectedConcepts = [];
        searchResults.concepts = [];
    }
    
    return searchResults;
}
function patterns(patterns,action)
{
    if(action.type === profile_actions.FINISH_POPULATE_PROFILE)
    {
        return action.patterns
    }
    return patterns;
}
export default function(state = {
    session:{},
    account:{},
    organizations:[],
    profiles:[],
    concepts:[],
    templates:[],
    patterns:[],
    searchResults:{
      
    },
    application:{
        selectedOrg:null,
        selectedProfile:null,
        loading:0
    }
}, action) {
    
    return produce(state, (state)=>{
        state.application = application(state.application,action)
        state.session = session(state.session,action)
        state.account = account(state.account,action)
        state.organizations = organizations(state.organizations,action)
        state.profiles = profiles(state.profiles,action)
        state.concepts = concepts(state.concepts,action)
        state.templates = templates(state.templates,action)
        state.patterns = patterns(state.patterns,action)
        state.searchResults = searchResults(state.searchResults,action);
        return state;
        
    })
}
