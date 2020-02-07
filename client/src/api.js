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

import fetch from "cross-fetch";
const apiroot = "http://localhost:3000/api"
class API {
    async putJSON(url, json) {
        let res = await fetch(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'

            },
            body: JSON.stringify(json)
        })
        return res.json();
    }
    async deleteJSON(url) {
        let res = await fetch(url, {
            method: "DELETE",
        })
        return res.json();
    }
    async postJSON(url, json) {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'

            },
            body: JSON.stringify(json)
        })
        return res.json();
    }
    async getJSON(url) {
        let res = await fetch(url, {
            method: "GET",
        })
        return res.json();
    }
   


    async getProfile(organizationId,profileId) {
        let body = await this.getJSON(`${apiroot}/org/${organizationId}/profile/${profileId}`,);
        return body.profile;
    }
    async getProfiles(organizationId) {
        let body = await this.getJSON(`${apiroot}/org/${organizationId}/profile`,);
        return body.profiles;
    }
    async createProfile(orgId,profile) {
        let body = await this.putJSON(`${apiroot}/org/${orgId}/profile`, profile);
        return body.profile;
    }
    async editProfile(orgId,profile) {
        let body = await this.postJSON(`${apiroot}/org/${orgId}/profile/${profile.uuid}`, profile);
        return body.profile;
    }
    async deleteProfile(orgId,profile) {
        await this.deleteJSON(`${apiroot}/org/${orgId}/profile/${profile.uuid}`);
        return;
    }



    
    async getOrganization(uuid) {
        let body = await this.getJSON(`${apiroot}/org/${uuid}`);
        return body.organization;
    }
    async getOrganizations() {
        let body = await this.getJSON(`${apiroot}/org/`);
        return body.organizations;
    }
    async createOrganization(org) {
        let body = await this.putJSON(`${apiroot}/org/`, org);
        return body.organization;
    }
    async editOrganization(organization) {
        let body = await this.postJSON(`${apiroot}/org/${organization.uuid}`);
        return body.organization;
    }
    async deleteOrganization(organizationId) {
        let body = await this.deleteJSON(`${apiroot}/org/${organizationId}`);
        return body.organization;
    }




    async getConcepts(organizationId,profileId) {
       
        let body = await this.getJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/concept`);
        return body.concepts;
    }
    async getTemplates(organizationId,profileId) {
        let body = await this.getJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/template`);
        return body.templates;
    }
    
    async getPatterns(organizationId,profileId) {
        let body = await this.getJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/pattern`);
        return body.patterns;
    }

    async getConcept(organizationId,profileId,conceptId) {
        let body = await this.getJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/concept/${conceptId}`);
        return body.concept;
    }
    async getTemplate(organizationId,profileId,templateId) {
        let body = await this.getJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/template/${templateId}`);
        return body.template;
    }
    async getPattern(organizationId,profileId,patternId) {
        let body = await this.getJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/pattern/${patternId}`);
        return body.pattern;
    }

    async createConcept(organizationId,profileId,concept) {
        let body = await this.putJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/concept`,concept);
        return body.concept;
    }
    async createTemplate(organizationId,profileId,template) {
        let body = await this.putJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/template`,template);
        return body.template;
    }
    async createPattern(organizationId,profileId,pattern) {
        let body = await this.putJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/pattern`,pattern);
        return body.pattern;
    }
    async editConcept(organizationId,profileId,concept) {
        let body = await this.postJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/concept/${concept.uuid}`,concept);
        return body.concept;
    }
    async editTemplate(organizationId,profileId,template) {
        let body = await this.postJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/template/${template.uuid}`,template);
        return body.template;
    }
    async editPattern(organizationId,profileId,pattern) {
        let body = await this.postJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/pattern/${pattern.uuid}`,pattern);
        return body.pattern;
    }
    async deleteConcept(organizationId,profileId,concept) {
        await this.deleteJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/concept/${concept.uuid}`);
        return ;
    }
    async deleteTemplate(organizationId,profileId,template) {
        await this.deleteJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/template/${template.uuid}`);
        return ;
    }
    async deletePattern(organizationId,profileId,pattern) {
        await this.deleteJSON(`${apiroot}/org/${organizationId}/profile/${profileId}/pattern/${pattern.uuid}`);
        return ;
    }

    async searchTemplates(search) {
        let body = await this.getJSON(`${apiroot}/template/?search=${search}`);
        return body.templates;
    }
    async searchConcepts(search) {
        let body = await this.getJSON(`${apiroot}/concept/?search=${search}`);
        return body.concepts;
    }
}
export default new API()