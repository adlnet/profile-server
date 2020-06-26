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
const conceptTypesToIRISegment = {
    Verb: 'verbs',
    ActivityType: 'activity-types',
    AttachmentUsageType: 'attachment-types',
    ContextExtension: 'context-extensions',
    ResultExtension: 'result-extensions',
    ActivityExtension: 'activity-extensions',
    StateResource: 'activity-states',
    AgentProfileResource: 'agent-profiles',
    ActivityProfileResource: 'activity-profiles',
    Activity: 'activities',
};

/**
 * Create the working group's IRI
 *
 * @param {string} wgname The working group name
 * @returns {string} The working group IRI
 */
function workinggroup(wgname) {
    if (!wgname) throw Error('working group name required - set workingGroup to name of working group');

    return [process.env.profileRootIRI, encodeURIComponent(wgname)].join('/');
}

/**
 * Create the profile's IRI
 *
 * @param {string} uuid The uuid of the profile
 * @returns {string} The profile IRI
 */
function profile(uuid) {
    if (!uuid) throw Error('must include the uuid of the profile');
    return [process.env.profileRootIRI, 'profile', uuid].join('/');
}

/**
 * Create the concept's IRI
 *
 * @param {string} uuid The uuid of the profile
 * @param {string} conceptname The name of the concept
 * @param {String} concepttype The concept's type value - ('Verb', 'ActivityType', 'AttachmentUsageType', 'ContextExtension', 'ResultExtension', 'ActivityExtension', 'StateResource', 'AgentProfileResource', 'ActivityProfileResource','Activity')
 * @returns {string} The concept IRI
 */
function concept(profileuuid, conceptname, concepttype) {
    if (!profileuuid) throw Error('must include the uuid of the profile');
    if (!conceptname) throw Error('must include the concept name');
    if (!concepttype) throw Error('must include the concept type');

    return [profile(profileuuid), conceptTypesToIRISegment[concepttype], encodeURIComponent(conceptname)].join('/');
}

/**
 * Create the template's IRI
 *
 * @param {string} uuid The uuid of the profile
 * @param {string} templatename The name of the template
 * @returns {string} The template IRI
 */
function template(profileuuid, templatename) {
    if (!profileuuid) throw Error('must include the uuid of the profile');
    if (!templatename) throw Error('must include the template name');

    return [profile(profileuuid), 'templates', encodeURIComponent(templatename)].join('/');
}

/**
 * Create the pattern's IRI
 *
 * @param {string} uuid The uuid of the profile
 * @param {string} templatename The name of the pattern
 * @returns {string} The pattern IRI
 */
function pattern(profileuuid, patternname) {
    if (!profileuuid) throw Error('must include the uuid of the profile');
    if (!patternname) throw Error('must include the pattern name');

    return [profile(profileuuid), 'patterns', encodeURIComponent(patternname)].join('/');
}

module.exports = {
    workinggroup,
    profile,
    concept,
    template,
    pattern,
};
