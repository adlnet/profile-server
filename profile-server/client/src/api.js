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


const appApiRoot = "/app"

class API {
    async checkStatus(res, method) {
        if (res.status >= 200 && res.status < 400) {
            return res.json();
        } else if (res.status == 409 && (method == "POST" || method == "PUT")) {
            let store = require("./store").default;
            store.dispatch({
                type: "permissionError"
            })
        }
        if (res.status == 409) {
            return res.json();
        } else {
            if (res.status === 401) {
                let store = require("./store").default;
                store.dispatch({
                    type: "GLOBAL_ERROR",
                    errorType: "permissionError",
                    message: res.json().message,
                    stack: (new Error()).stack
                })
            }
            let errorMessage;
            try {
                const err = await res.json();
                errorMessage = err.message || err.err;
            } catch {
                errorMessage = res.statusText;
            }

            const tryingToUnlockResource = (res.url.indexOf('/unlock') !== -1);

            if (!tryingToUnlockResource) {
                throw new Error(errorMessage);
            }
        }
    }

    async putJSON(url, json) {

        let token = await this.getCSRFToken();
        try {
            let res = await fetch(url, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRF-Token": token
                },
                body: JSON.stringify(json)
            })

            return this.checkStatus(res, "PUT");
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }

    async postImportedJSON(url, file, options) {
        let token = await this.getCSRFToken();
        try {
            let res = await fetch(url, {
                method: "POST",
                body: file,
                headers: {
                    "X-CSRF-Token": token
                },
                ...options
            })

            return this.checkStatus(res, "POST");
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }

    async deleteImportedJSON(url, file) {
        let token = await this.getCSRFToken();
        try {
            let res = await fetch(url, {
                method: "DELETE",
                body: file,
                headers: {
                    "X-CSRF-Token": token
                },
            })

            return this.checkStatus(res);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }
    }

    async deleteJSON(url) {

        let token = await this.getCSRFToken();
        try {
            let res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "X-CSRF-Token": token
                },
            });

            return this.checkStatus(res);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }
    }
    async postJSONNoCheck(url, json) {

        let token = await this.getCSRFToken();
        try {
            let res = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRF-Token": token
                },
                body: JSON.stringify(json)
            })

            return res.json();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    async postJSON(url, json) {

        let token = await this.getCSRFToken();
        try {
            let res = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRF-Token": token
                },
                body: JSON.stringify(json)
            });

            return this.checkStatus(res, "POST");
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    async getJSON(url, requireToken = true) {
        
        let token = requireToken ? await this.getCSRFToken() : undefined;
        try {
            let res = await fetch(url, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRF-Token": token
                }
            });

            return this.checkStatus(res);
        } catch (err) {
            console.error("Unauthorized.");
            throw err;
        }
    }

    async resolveProfile(profileId) {
        return this.getJSON(`${appApiRoot}/profile/resolve/${profileId}`);
    }

    async getProfile(organizationId, profileId) {
        let body;
        if (organizationId)
            body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}`);
        else
            body = await this.getJSON(`${appApiRoot}/profile/${profileId}`);

        return body.profile;
    }
    async getProfiles(organizationId, published, draft, limit) {
        let body;
        if (organizationId)
            body = await this.getJSON(`${appApiRoot}/org/${organizationId}/profile`);
        else {
            body = await this.getJSON(`${appApiRoot}/profile?published=${published}&draft=${draft}&limit=${limit}`);
        }

        return body.profiles;
    }
    async getOrphanContainerProfile() {
        let res = await this.getJSON(`${appApiRoot}/profile/orphan-container`);

        let results = res.orphanProfile;
        results.organizationUuid = res.organizationUuid;
        results.currentPublishedVersionUuid = res.currentPublishedVersionUuid;
        return results;
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
    async deleteProfileDraft(orgId, profile) {
        await this.deleteJSON(`${appApiRoot}/org/${orgId}/profile/${profile.uuid}/draft`);
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

    async publishProfileVersion(profileId, parentiri) {
        let body;
        if (parentiri) body = await this.postJSON(`${appApiRoot}/profile/${profileId}/publish`, { parentiri: parentiri });
        else body = await this.postJSON(`${appApiRoot}/profile/${profileId}/publish`);

        return body;
    }

    async exportProfile(versionId) {
        let body = await this.getJSON(`${appApiRoot}/version/${versionId}/export`);

        return body.exportData;
    }

    async harvest(organizationId, profileId, profileVersion, harvestImport, options) {
        let body = await this.postImportedJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${profileVersion.uuid}/harvest`, harvestImport, options);

        return body;
    }
    async deleteHarvest(organizationId, profileId, profileVersion, harvestImport) {
        let body = await this.deleteJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${profileVersion.uuid}/harvest/${harvestImport.uuid}`);

        return body;
    }
    async putHarvest(organizationId, profileId, profileVersion, harvestImport) {
        let body = await this.putJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${profileVersion.uuid}/harvest/${harvestImport.uuid}`, harvestImport);

        return body;
    }
    async loadProfileRootIRI() {
        let body = await this.getJSON(`${appApiRoot}/rootProfileIRI`);

        return body.iri;
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
    async removeMember(organizationId, memberId) {
        let body = await this.deleteJSON(`${appApiRoot}/org/${organizationId}/member/${memberId}`);

        return body.members;
    }
    async addMember(organizationId, member) {
        let body = await this.postJSON(`${appApiRoot}/org/${organizationId}/member`, member);

        return body.members;
    }
    async editMember(organizationId, member) {
        let body = await this.putJSON(`${appApiRoot}/org/${organizationId}/member`, member);

        return body.members;
    }

    async approveMember(organizationId, member) {
        let body = await this.postJSON(`${appApiRoot}/org/${organizationId}/join/member`, member);

        return body.members;
    }

    /** to be called when an admin denies a request someone made to join the org */
    async denyMemberRequest(organizationId, userId) {
        let body = await this.deleteJSON(`${appApiRoot}/org/${organizationId}/deny/member/${userId}`);

        return body.organization;
    }

    /** to be called when the user who requested to join an org cancels that request */
    async revokeMemberRequest(orguuid, userId) {
        let body = await this.deleteJSON(`${appApiRoot}/org/${orguuid}/join/member/${userId}`);

        return body.organization;
    }

    async requestJoinOrganization(organizationUUID, user) {
        let body = await this.postJSON(`${appApiRoot}/org/${organizationUUID}/join`, user);

        return body.organization;
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
        if (organizationId && profileId)
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
    async claimConcept(organizationId, profileId, versionId, conceptId) {
        await this.postJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/concept/${conceptId}/claim`);
        return;
    }
    async removeConceptLink(organizationId, profileId, versionId, conceptId) {
        await this.deleteJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/concept/link/${conceptId}`);
        return;
    }

    async removeTemplateLink(selectedOrganizationId, profileId, selectedProfileVersionId, templateId) {
        await this.deleteJSON(`${appApiRoot}/org/${selectedOrganizationId}/profile/${profileId}/version/${selectedProfileVersionId}/template/link/${templateId}`)
    }
    async deleteTemplate(organizationId, profileId, versionId, templateId) {
        await this.deleteJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/template/${templateId}`);
        return;
    }
    async claimTemplate(organizationId, profileId, versionId, templateId) {
        await this.postJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/template/${templateId}/claim`);
        return;
    }

    async deletePattern(organizationId, profileId, versionId, patternId) {
        await this.deleteJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/pattern/${patternId}`);
        return;
    }
    async claimPattern(organizationId, profileId, versionId, patternId) {
        await this.postJSON(`${appApiRoot}/org/${organizationId}/profile/${profileId}/version/${versionId}/pattern/${patternId}/claim`);
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


    async getWebHookSubjects() {
        const body = await this.getJSON(`${appApiRoot}/user/hooks/subjects`);

        return body.subjects;
    }
    async getWebHooks() {
        const body = await this.getJSON(`${appApiRoot}/user/hooks`);

        return body.hooks;
    }
    async createWebHook(hook) {
        const body = await this.postJSON(`${appApiRoot}/user/hooks`, hook);

        return body.hook;
    }
    async getWebHook(hookId) {

        const body = await this.getJSON(`${appApiRoot}/user/hooks/${hookId}`);

        return body.hook;
    }
    async editWebHook(hook) {
        const body = await this.putJSON(`${appApiRoot}/user/hooks/${hook.uuid}`, hook);

        return body.hook;
    }
    async deleteWebHook(hookId) {
        await this.deleteJSON(`${appApiRoot}/user/hooks/${hookId}`);
        return;
    }




    async searchTemplates(search, limit, page, sort) {
        let body = await this.getJSON(`${appApiRoot}/template/?search=${search || ''}&limit=${limit || ''}&page=${page || ''}&sort=${sort || ''}`);

        return body.templates;
    }
    async searchConcepts(search, limit, page, sort, filter) {
        let body = await this.getJSON(`${appApiRoot}/concept/?search=${search || ''}&limit=${limit || ''}&page=${page || ''}&sort=${sort || ''}&filter=${filter || ''}`);

        return body.concepts;
    }
    async searchPatterns(search, limit, page, sort) {
        let body = await this.getJSON(`${appApiRoot}/pattern/?search=${search || ''}&limit=${limit || ''}&page=${page || ''}&sort=${sort || ''}`);

        return body.patterns;
    }
    async searchProfiles(search, limit, page, sort) {
        let body = await this.getJSON(`${appApiRoot}/profile/?search=${search || ''}&limit=${limit || ''}&page=${page || ''}&sort=${sort || ''}`);

        return body.profiles;
    }
    async searchOrganizations(search, limit, page, sort) {
        let body = await this.getJSON(`${appApiRoot}/org/?search=${search || ''}&limit=${limit || ''}&page=${page || ''}&sort=${sort || ''}`);

        return body.organizations;
    }
    async searchUsers(search, limit, page, sort) {
        let body = await this.getJSON(`${appApiRoot}/user/?search=${search || ''}&limit=${limit || ''}&page=${page || ''}&sort=${sort || ''}`);

        return body.users;
    }

    async getUserStatus() {
        let body = await this.getJSON(`${appApiRoot}/user/status`);

        return body;
    }
    async login(loginRequest) {
        let body = await this.postJSONNoCheck(`${appApiRoot}/user/login`, loginRequest);

        return body;
    }
    async logout() {
        let body = await this.postJSON(`${appApiRoot}/user/logout`, {});

        return body;
    }
    async createUser(createRequest) {
        let body = await this.postJSON(`${appApiRoot}/user/create`, createRequest);

        return body;
    }
    async attemptValidation(validationRequest) {
        let body = await this.postJSON(`${appApiRoot}/user/validate`, validationRequest);

        return body;
    }
    async resendValidation(resendRequest) {
        let body = await this.postJSON(`${appApiRoot}/user/resendValidation`, resendRequest);

        return body;
    }
    async setUsername(setRequest) {
        let body = await this.postJSON(`${appApiRoot}/user/username`, setRequest);

        return body;
    }
    async getSalt(email) {
        let body = await this.getJSON(`${appApiRoot}/user/salt?email=` + email);

        return body.salt;
    }
    async checkResetKey(key) {
        let body = await this.getJSON(`${appApiRoot}/user/checkResetKey?key=` + key);
        return body.success;
    }
    async search(type, searchString) {
        let body = await this.getJSON(`${appApiRoot}/search/${type}/?search=` + searchString);

        return body.results;
    }

    async getPublishedProfiles({ verifiedOnly = false } = {}) {
        let query = '';
        if (verifiedOnly)
            query = "?verified=true"
        let body = await this.getJSON(`${appApiRoot}/profile/published` + query);

        return body.profiles;
    }

    async verifyProfile(profileVersionId, status) {
        let body = await this.postJSON(`${appApiRoot}/admin/verify/` + profileVersionId, status);

        return body.profile;
    }

    async getCSRFToken() {
        let body = await this.getJSON("/csrf", false);
        return body.token;
    }
}
export default new API()
