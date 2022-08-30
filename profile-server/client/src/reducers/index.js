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
import * as org_actions from "../actions/organizations";
import * as profile_actions from "../actions/profiles";
import * as template_actions from "../actions/templates";
import * as concept_actions from "../actions/concepts";
import * as pattern_actions from "../actions/patterns";
import * as user_actions from "../actions/user";
import * as apiKey_actions from "../actions/apiKeys";
import * as webhook_actions from "../actions/webhooks";
import * as successAlert_actions from "../actions/successAlert";

const { produce } = require('immer');


function organizations(orgs, action) {
    if (action.type == org_actions.FINISH_GET_ORGS) {
        orgs = action.organizations;
        return orgs;
    }
    return orgs;
}

function webHooks(webHooks, action) {
    if (action.type === webhook_actions.FINISH_GET_WEBHOOKS) {
        webHooks = action.webHooks;
        return webHooks;
    }
    return webHooks;
}

function apiKeys(apiKeys, action) {
    if (action.type === apiKey_actions.FINISH_GET_APIKEYS) {
        apiKeys = action.apiKeys;
        return apiKeys;
    }
    return apiKeys;
}

function profiles(profiles, action) {
    if (action.type == profile_actions.FINISH_GET_PROFILES) {
        profiles = action.profiles;
        return profiles;
    }
    return profiles;
}

function account(account) {
    return account;
}

function session(session) {
    return session;
}

function application(application, action) {
    if (action.type === org_actions.SELECT_ORG) {
        application.selectedOrganizationId = action.organization.uuid;
        application.selectedOrganization = action.organization;
    }

    if (action.type == apiKey_actions.SELECT_APIKEY) {
        application.selectedApiKeyId = action.apiKeyId;
        application.selectedApiKey = action.apiKey;
    }

    if (action.type == webhook_actions.SELECT_WEBHOOK) {
        application.selectedWebHookId = action.webHookId;
        application.selectedWebHook = action.webHook;
    }

    if (action.type === profile_actions.SELECT_PROFILE) {
        application.selectedProfileId = action.profile.uuid;
        application.selectedProfile = action.profile;
    }

    if (action.type === profile_actions.SELECT_PROFILE_VERSION) {
        if(application.selectedProfileVersionId !== action.profileVersion.uuid){
            application.selectedImportedFileIndex = 0;
        }
        application.selectedProfileVersionId = action.profileVersion.uuid;
        application.selectedProfileVersion = action.profileVersion;
    }

    if (action.type === profile_actions.SET_UPLOADING_STATE) {
        application.uploading = action.payload;
    }

    if (action.type === profile_actions.BEGIN_HARVEST) {
        application.uploading = 0;
    }

    if (action.type === profile_actions.COMPLETED_HARVEST) {        
        application.selectedImportedFileIndex = application.selectedProfileVersion.harvestDatas.length;
        application.uploading = 1;
    }
    if (action.type === profile_actions.UPDATED_IMPORTED_FILE_INDEX) {
        application.selectedImportedFileIndex = action.index;
    }

    if (action.type === profile_actions.FINISH_HARVEST_DELETE) {
        application.selectedImportedFileIndex = 0;
    }

    if (action.type === concept_actions.SELECT_CONCEPT) {
        application.selectedConceptId = action.concept.uuid;
        application.selectedConcept = action.concept;
    }

    if (action.type === concept_actions.SELECT_INFOPANEL_CONCEPT) {
        application.infopanelConcept = action.infopanelConcept;
    }

    if (action.type === template_actions.SELECT_TEMPLATE) {
        application.selectedTemplateId = action.template.uuid;
        application.selectedTemplate = action.template;
    }

    if (action.type === template_actions.SELECT_INFOPANEL_TEMPLATE) {
        application.infopanelTemplate = action.infopanelTemplate;
    }

    if (action.type === template_actions.FINISH_SELECT_DETERMINING_PROPERTIES) {
        application.selectedDeterminingProperties = action.determiningProperties;
    }

    if (action.type === pattern_actions.SELECT_PATTERN) {
        application.selectedPatternId = action.pattern.uuid;
        application.selectedPattern = action.pattern;
    }

    if (action.type === pattern_actions.SELECT_INFOPANEL_PATTERN) {
        application.infopanelPattern = action.infopanelPattern;
    }

    if (action.type === org_actions.FINISH_GET_MEMBERS) {
        application.members = action.members;
    }

    if (action.type === profile_actions.SELECT_LOAD_PROFILE_ROOT_IRI) {
        application.profileRootIRI = action.iri;
    }

    if (action.type.indexOf("START") === 0) {
        application.loading++;
    }
    if (action.type.indexOf("FINISH") === 0) {
        if (application.loading > 0)
            application.loading--;
    }
    if (action.type === "GLOBAL_ERROR") {
        application.loading = 0;
    }

    return application;
}

function concepts(concepts, action) {
    if (action.type === profile_actions.FINISH_POPULATE_PROFILE) {

        return action.concepts
    }

    if (action.type === concept_actions.FINISH_GET_CONCEPTS) {

        return action.concepts
    }

    return concepts;
}

function templates(templates, action) {
    if (action.type === profile_actions.FINISH_POPULATE_PROFILE) {
        return action.templates
    }
    if (action.type === template_actions.FINISH_GET_TEMPLATES) {
        return action.templates
    }
    return templates;
}

function errors(errors, action) {
    if (action.type.indexOf('ERROR') === 0) {
        if (!errors) {
            errors = [];
        }
        errors.push({
            uuid: require('uuid').v4(),
            ...action,
        });
    }

    if (action.type === 'CLEAR_ERROR') {
        if (errors) {
            errors =
                errors.filter(error => error.uuid !== action.error.uuid);
        }
    }

    return errors;
}

function globalErrors(globalErrors, action) {
    if (action.type === "GLOBAL_ERROR") {
        let error = {
            uuid: require('uuid').v4(),
            ...action
        }
        globalErrors.push(error)
    }

    if (action.type === "CLEAR_GLOBAL_ERROR") {
        let idx = -1;
        for (let i = 0; i < globalErrors.length; i++) {
            if (globalErrors[i].uuid === action.error.uuid) {
                idx = i;
            }
        }

        if (idx !== -1)
            globalErrors.splice(idx, 1);
    }
    return globalErrors;
}

function searchResults(searchResults, action) {
    if (action.type == org_actions.FINISH_SEARCH_ORGS) {
        searchResults.organizations = action.organizations;
    }

    if (action.type == org_actions.CLEAR_SEARCH_ORGS) {
        searchResults.organizations = undefined;
    }

    if (action.type == template_actions.FINISH_SEARCH_TEMPLATES) {
        searchResults.templates = action.templates;
    }

    if (action.type == template_actions.SELECT_TEMPLATE_RESULT) {
        if (!searchResults.selectedTemplates)
            searchResults.selectedTemplates = []
        searchResults.selectedTemplates.push(action.template);
    }

    if (action.type == template_actions.DESELECT_TEMPLATE_RESULT) {
        if (!searchResults.selectedTemplates)
            searchResults.selectedTemplates = []
        searchResults.selectedTemplates = searchResults.selectedTemplates.filter(i => i.uuid !== action.template.uuid)
    }

    if (action.type == template_actions.CLEAR_TEMPLATE_RESULTS) {
        searchResults.selectedTemplates = [];
        searchResults.templates = [];
    }

    if (action.type == concept_actions.FINISH_SEARCH_CONCEPTS) {
        searchResults.concepts = action.concepts;
    }

    if (action.type == concept_actions.SELECT_CONCEPT_RESULT) {
        if (!searchResults.selectedConcepts)
            searchResults.selectedConcepts = []
        searchResults.selectedConcepts.push(action.concept);
    }

    if (action.type == concept_actions.DESELECT_CONCEPT_RESULT) {
        if (!searchResults.selectedConcepts)
            searchResults.selectedConcepts = []
        searchResults.selectedConcepts = searchResults.selectedConcepts.filter(i => i.uuid !== action.concept.uuid)
    }

    if (action.type == concept_actions.CLEAR_CONCEPT_RESULTS) {
        searchResults.selectedConcepts = null;
        searchResults.concepts = null;
    }

    if (action.type === pattern_actions.FINISH_SEARCH_PATTERNS) {
        searchResults.patterns = action.patterns;
    }

    if (action.type === pattern_actions.SELECT_PATTERN_RESULT) {
        if (!searchResults.selectedPatterns)
            searchResults.selectedPatterns = [];
        searchResults.selectedPatterns.push(action.pattern);
    }

    if (action.type === pattern_actions.DESELECT_PATTERN_RESULT) {
        if (!searchResults.selectedPatterns)
            searchResults.selectedPatterns = [];
        searchResults.selectedPatterns = searchResults.selectedPatterns.filter(p => p.uuid !== action.pattern.uuid);
    }

    if (action.type === pattern_actions.CLEAR_PATTERN_RESULTS) {
        searchResults.selectedPatterns = [];
        searchResults.patterns = [];
    }

    if (action.type === pattern_actions.SELECT_COMPONENT) {
        if (!searchResults.selectedComponents)
            searchResults.selectedComponents = [];
        searchResults.selectedComponents.push(action.component);
    }

    if (action.type === pattern_actions.DESELECT_COMPONENT) {
        if (!searchResults.selectedComponents)
            searchResults.selectedComponents = []
        searchResults.selectedComponents = searchResults.selectedComponents.filter(c => c.uuid !== action.component.uuid);
    }

    if (action.type === pattern_actions.CLEAR_SELECTED_COMPONENTS) {
        searchResults.selectedComponents = [];
    }

    if (action.type === pattern_actions.UPDATE_SELECTED_COMPONENTS) {
        searchResults.selectedComponents = action.components;
    }

    if (action.type === org_actions.FINISH_SEARCH_USERS) {
        if (!searchResults.selectedUsers)
            searchResults.selectedUsers = []
        searchResults.users = action.users
    }
    if (action.type === org_actions.SELECT_USER_RESULT) {
        if (!searchResults.selectedUsers)
            searchResults.selectedUsers = []
        searchResults.selectedUsers.push(action.user)
    }
    if (action.type === org_actions.CLEAR_USER_RESULTS) {

        searchResults.selectedUsers = []
        searchResults.users = [];
    }
    if (action.type === org_actions.DESELECT_USER_RESULT) {
        if (!searchResults.selectedUsers)
            searchResults.selectedUsers = []
        searchResults.selectedUsers = searchResults.selectedUsers.filter(c => c.uuid !== action.user.uuid);
    }




    return searchResults;
}

function patterns(patterns, action) {
    if (action.type === pattern_actions.FINISH_GET_PATTERNS) {
        return action.patterns
    }
    return patterns;
}

function userData(userData, action) {
    if (action.type == user_actions.FINISH_CHECK) {
        userData.user = action.user;
        userData.loginFeedback = null;
    }
    if (action.type == user_actions.FINISH_CREATE) {
        userData.user = action.user;
        userData.loginFeedback = null;
    }
    if (action.type == user_actions.ERROR_CREATE) {
        userData.user = action.user;
        userData.createFeedback = action.error;
    }
    if (action.type == user_actions.LOGIN_FAILED) {
        userData.loginFeedback = action.error;
    }
    if (action.type == user_actions.ERROR_VALIDATE) {
        userData.loginFeedback = action.error;
    }

    return userData;
}

function successAlert(successAlert, action) {

    if (action.type === successAlert_actions.CLEAR) {
        successAlert.type = null;
        successAlert.message = null;
        successAlert.subject = null;
    }
    if (action.type === successAlert_actions.ADDED) {
        successAlert.type = action.type;
        successAlert.message = action.message;
        successAlert.subject = action.subject;
    }
    if (action.type === successAlert_actions.CREATED) {
        successAlert.type = action.type;
        successAlert.message = action.message;
        successAlert.subject = action.subject;
    }
    if (action.type === successAlert_actions.EDITED) {
        successAlert.type = action.type;
        successAlert.message = action.message;
    }
    if (action.type === successAlert_actions.REMOVED) {
        successAlert.type = action.type;
        successAlert.message = action.message;
        successAlert.subject = action.subject;
    }
    if (action.type === successAlert_actions.DEPRECATED) {
        successAlert.type = action.type;
        successAlert.message = action.message;
        successAlert.subject = action.subject;
    }
    if (action.type === successAlert_actions.PUBLISHED) {
        successAlert.type = action.type;
        successAlert.message = action.message;
        successAlert.subject = action.subject;
    }
    if (action.type === successAlert_actions.VERIFICATION_REQUESTED) {
        successAlert.type = action.type;
        successAlert.message = action.message;
    }
    return successAlert;
}


export default function (state = {
    session: {},
    account: {},
    organizations: [],
    profiles: [],
    concepts: [],
    templates: [],
    patterns: [],
    searchResults: {},
    errors: [],
    globalErrors: [],
    successAlert: {
        type: null,
        message: null,
        subject: null
    },
    userData: {
        user: null,
        loginFeedback: null
    },
    application: {
        selectedOrg: null,
        members: [],
        selectedProfile: null,
        loading: 0,
        profileRootIRI: null,
        selectedImportedFileIndex: 0,
        uploading: -1
    },
}, action) {

    return produce(state, (state) => {
        if (action.type == "permissionError") {
            window.alert("Something went wrong: Permission Denied")
        }
        state.application = application(state.application, action);
        state.session = session(state.session, action);
        state.account = account(state.account, action);
        state.organizations = organizations(state.organizations, action);
        state.apiKeys = apiKeys(state.apiKeys, action);
        state.webHooks = webHooks(state.webHooks, action);
        state.profiles = profiles(state.profiles, action);
        state.concepts = concepts(state.concepts, action);
        state.templates = templates(state.templates, action);
        state.patterns = patterns(state.patterns, action);
        state.searchResults = searchResults(state.searchResults, action);
        state.errors = errors(state.errors, action);
        state.userData = userData(state.userData, action);
        state.message = successAlert(state.successAlert, action);
        state.globalErrors = globalErrors(state.globalErrors, action)
        return state;

    })
}
