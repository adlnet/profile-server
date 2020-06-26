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
import fetch from "cross-fetch";


const appApiRoot = "http://localhost:3000/app"

class API {
    async checkStatus (res, method) {
        if (res.status >= 200 && res.status < 400 ) {
            return res.json();
        } else if (res.status == 409 && (method == "POST" || method == "PUT") ) {
            let store = require("./store").default;
            store.dispatch({
                type:"permissionError"
            })
        } 
        if (res.status == 409 ) {
            return res.json();
        } else {
            if(res.status === 401)
            {
                let store = require("./store").default;
                store.dispatch({
                    type:"GLOBAL_ERROR",
                    errorType:"permissionError",
                    message:res.json().message,
                    stack: (new Error()).stack
                })
            }
            let errorMessage; 
            try {
                const err = await res.json();
                errorMessage = err.message;
            } catch {
                errorMessage = res.statusText;
            }

            throw new Error(errorMessage);
        }
    }

    async putJSON(url, json) {
        if(url.indexOf("http") !== 0)
            url = appApiRoot + url;
        try {
            let res = await fetch(url, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'

                },
                body: JSON.stringify(json)
            })

            return this.checkStatus(res, "PUT");
        } catch(err) {
            console.error(err);
            throw new Error(err);
        }
    }

    async deleteJSON(url) {
        if(url.indexOf("http") !== 0)
            url = appApiRoot + url;
        try {
            let res = await fetch(url, {
                method: "DELETE",
            });
            
            return this.checkStatus(res);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }
    }

    async postJSON(url, json) {
        if(url.indexOf("http") !== 0)
            url = appApiRoot + url;
        try {
            let res = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'

                },
                body: JSON.stringify(json)
            })

            return this.checkStatus(res, "POST");
        } catch(err) {
            console.error(err);
            return {};
        }
    }
    async getJSON(url) {
        if(url.indexOf("http") !== 0)
            url = appApiRoot + url;
        try {
            let res = await fetch(url, {
                method: "GET",
            })

            return this.checkStatus(res);
        } catch(err) {
            console.error(err);
            throw err;
        }
    }



    async getProfile(organizationId, profileId) {
        let body;
        if (organizationId)
            body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}`);
        else
            body = await this.getJSON(`${appApiRoot}/profile/${profileId}`);

        return body.profile;
    }
    async getProfiles(organizationId) {
        let body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile`);
        return body.profiles;
    }
    async createProfile(orgId, profile) {
        let body = await this.postJSON(`${appApiRoot}/org/${orgId}/profile`, profile);
        return body.profile;
    }
    async editProfile(orgId, profile) {
        let body = await this.putJSON(`${appApiRoot}/org/${orgId}/profile/${profile.uuid}`, profile);
        return body.profile;
    }
    async deleteProfile(orgId, profile) {
        await this.deleteJSON(`${appApiRoot}/org/${orgId}/profile/${profile.uuid}`);
        return;
    }

    async createProfileVersion(organizationId, profileId, profileVersion) {
        let body = await this.postJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version`, profileVersion);
        return body.profileVersion;
    }

    async getProfileVersion(organizationId, profileId, versionId) {
        let body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}`);
        return body.profileVersion;
    }

    async editProfileVersion(organizationId, profileId, profileVersion) {
        let body = await this.putJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${profileVersion.uuid}`, profileVersion);
        return body.profileVersion;
    }




    async getOrganization(uuid) {
        let body = await this.getJSON(`${appApiRoot}/org/${uuid}`);
        return body.organization;
    }
    async getOrganizations() {
        let body = await this.getJSON(`${appApiRoot}/org/`);
        return body.organizations;
    }
    async createOrganization(org) {
        let body = await this.postJSON(`${appApiRoot}/org/`, org);
        return body.organization;
    }
    async editOrganization(organization) {
        let body = await this.putJSON(`${appApiRoot}/org/${organization.uuid}`, organization);
        return body.organization;
    }
    async deleteOrganization(organizationId) {
        let body = await this.deleteJSON(`${appApiRoot}/org/${organizationId}`);
        return body.organization;
    }

    async getMembers(organizationId) {
        let body = await this.getJSON(`${appApiRoot}/org/${organizationId}/member`);
        return body.members;
    }
    async removeMember(organizationId,memberId) {
        let body = await this.deleteJSON(`${appApiRoot}/org/${organizationId}/member/${memberId}`);
        return body.members;
    }
    async addMember(organizationId,member) {
        let body = await this.postJSON(`${appApiRoot}/org/${organizationId}/member`, member);
        return body.members;
    }
    async editMember(organizationId,member) {
        let body = await this.putJSON(`${appApiRoot}/org/${organizationId}/member`, member);
        return body.member;
    }



    async getConcepts(organizationId, profileId, versionId) {
        let body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/concept`);
        return body.concepts;
    }
    async getTemplates(organizationId, profileId, versionId) {
        let body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/template`);
        return body.templates;
    }

    async getPatterns(organizationId, profileId, versionId) {
        let body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/pattern`);
        return body.patterns;
    }

    async getConcept(organizationId, profileId, versionId, conceptId) {
        let body;
        if  (organizationId && profileId)
            body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/concept/${conceptId}`);
        else
            body = await this.getJSON(`${appApiRoot}/concept/${conceptId}`);
        return body.concept;
    }
    async getTemplate(organizationId, profileId, versionId, templateId) {
        let body;
        if (organizationId && profileId)
            body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/template/${templateId}`);
        else
            body = await this.getJSON(`${appApiRoot}/template/${templateId}`);
        return body.template;
    }
    async getPattern(organizationId, profileId, versionId, patternId) {
        let body;
        if (organizationId && profileId)
            body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/pattern/${patternId}`);
        else
            body = await this.getJSON(`${appApiRoot}/pattern/${patternId}`);
        return body.pattern;
    }

    async createConcept(organizationId, profileId, versionId, concept) {
        let body = await this.postJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/concept`, concept);
        return body.concept;
    }
    async createTemplate(organizationId, profileId, versionId, template) {
        let body = await this.postJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/template`, template);
        return body.template;
    }
    async createPattern(organizationId, profileId, versionId, pattern) {
        let body = await this.postJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/pattern`, pattern);
        return body.pattern;
    }
    async editConcept(organizationId, profileId, versionId, concept) {
        let body = await this.putJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/concept/${concept.uuid}`, concept);
        return body.concept;
    }
    async editTemplate(organizationId, profileId, versionId, template) {
        let body = await this.putJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/template/${template.uuid}`, template);
        return body.template;
    }
    async editPattern(organizationId, profileId, versionId, pattern) {
        let body = await this.putJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/pattern/${pattern.uuid}`, pattern);
        return body.pattern;
    }
    async deleteConcept(organizationId, profileId, versionId, concept) {
        await this.deleteJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/concept/${concept.uuid}`);
        return;
    }
    async deleteTemplate(organizationId, profileId, versionId, templateId) {
        await this.deleteJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/template/${templateId}`);
        return;
    }
    async deletePattern(organizationId, profileId, versionId, patternId) {
        await this.deleteJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/pattern/${patternId}`);
        return;
    }

    async getApiKeys(organizationId) {
        const body = await this.getJSON(`${appApiRoot}/org/${organizationId}/apiKey`);
        return body.apiKeys;
    }
    async createApiKey(organizationId, apiKey) {
        const body = await this.postJSON(`${appApiRoot}/org/${organizationId}/apiKey`, apiKey);
        return body.apiKey;
    }
    async getApiKey(organizationId, apiKeyId) {
        const body = await this.getJSON(`${appApiRoot}/org/${organizationId}/apiKey/${apiKeyId}`); 
        return body.apiKey;
    }
    async editApiKey(organizationId, apiKey) {
        const body = await this.putJSON(`${appApiRoot}/org/${organizationId}/apiKey/${apiKey.uuid}`, apiKey);
        return body.apiKey;
    }
    async deleteApiKey(organizationId, apiKeyId) {
        await this.deleteJSON(`${appApiRoot}/org/${organizationId}/apiKey/${apiKeyId}`); 
        return;
    }

    async searchTemplates(search) {
        let body = await this.getJSON(`${appApiRoot}/template/?search=${search}`);
        return body.templates;
    }
    async searchConcepts(search) {
        let body = await this.getJSON(`${appApiRoot}/concept/?search=${search}`);
        return body.concepts;
    }
    async searchPatterns(search) {
        let body = await this.getJSON(`${appApiRoot}/pattern/?search=${search}`);
        return body.patterns;
    }
    async searchProfiles(search) {
        let body = await this.getJSON(`${appApiRoot}/profile/?search=${search}`);
        return body.patterns;
    }
    async searchOrganizations(search) {
        let body = await this.getJSON(`${appApiRoot}/org/?search=${search}`);
        return body.patterns;
    }
    async searchUsers(search) {
        let body = await this.getJSON(`${appApiRoot}/user/?search=${search}`);
        return body.users;
    }
    
    async getUserStatus() {
        let body = await this.getJSON(`${appApiRoot}/user/status`);
        return body;
    }
    async login(loginRequest) {
        let body = await this.postJSON(`${appApiRoot}/user/login`,loginRequest);
        return body;
    }
    async logout() {
        let body = await this.postJSON(`${appApiRoot}/user/logout`,{});
        return body;
    }
    async createUser(createRequest) {
        let body = await this.postJSON(`${appApiRoot}/user/create`,createRequest);
        return body;
    }
    async getSalt(email) {
        let body = await this.getJSON(`${appApiRoot}/user/salt?email=` + email);
        return body.salt;
    }
    async search(type,searchString) {
        let body = await this.getJSON(`${appApiRoot}/search/${type}/?search=` + searchString);
        return body.results;
    }
}
export default new API()