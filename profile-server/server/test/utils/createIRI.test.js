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
const createIRI = require('../../utils/createIRI');
require('dotenv').config();
const uuid = require('uuid').v4;

test('should create working group iri', () => {
    const wgname = 'workinggroupname';
    const iri = createIRI.workinggroup(wgname);
    expect(iri).toEqual(`${process.env.profileRootIRI}/${wgname}`);
});

test('should create working group iri and encode spaces', () => {
    const wgname = 'working group name';
    const iri = createIRI.workinggroup(wgname);
    expect(iri).not.toEqual(`${process.env.profileRootIRI}/${wgname}`);
    expect(iri).toEqual(`${process.env.profileRootIRI}/${encodeURIComponent(wgname)}`);
});

test('should create profile iri', () => {
    const profileuuid = uuid();
    const iri = createIRI.profile(profileuuid);
    expect(iri).toEqual(`${process.env.profileRootIRI}/profile/${profileuuid}`);
});

test('should create profile version iri', () => {
    const profileuuid = uuid();
    const iri = createIRI.profile(profileuuid);
    expect(iri).toEqual(`${process.env.profileRootIRI}/profile/${profileuuid}`);

    const newVersionNumber = 3;
    const vIRI = createIRI.profileVersion(iri, newVersionNumber);
    expect(vIRI).toEqual(`${iri}/v/${newVersionNumber}`);
});

test('should create Verb concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'Verb',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/verbs/${concept.name}`);
});

test('should create ActivityType concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'ActivityType',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/activity-types/${concept.name}`);
});

test('should create AttachmentUsageType concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'AttachmentUsageType',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/attachment-types/${concept.name}`);
});

test('should create ContextExtension concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'ContextExtension',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/context-extensions/${concept.name}`);
});

test('should create ResultExtension concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'ResultExtension',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/result-extensions/${concept.name}`);
});

test('should create ActivityExtension concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'ActivityExtension',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/activity-extensions/${concept.name}`);
});

test('should create StateResource concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'StateResource',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/activity-states/${concept.name}`);
});

test('should create AgentProfileResource concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'AgentProfileResource',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/agent-profiles/${concept.name}`);
});

test('should create ActivityProfileResource concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'ActivityProfileResource',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/activity-profiles/${concept.name}`);
});

test('should create Activity concept iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const concept = {
        name: 'verbname',
        type: 'Activity',
    };
    const iri = createIRI.concept(profileiri, concept.name, concept.type);
    expect(iri).toEqual(`${profileiri}/activities/${concept.name}`);
});

test('should create template iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const template = 'templatename';
    const iri = createIRI.template(profileiri, template);
    expect(iri).toEqual(`${profileiri}/templates/${template}`);
});

test('should create pattern iri', () => {
    const profileuuid = uuid();
    const profileiri = createIRI.profile(profileuuid);
    const pattern = 'patternname';
    const iri = createIRI.pattern(profileiri, pattern);
    expect(iri).toEqual(`${profileiri}/patterns/${pattern}`);
});
