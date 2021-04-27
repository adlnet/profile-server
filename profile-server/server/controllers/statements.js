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
const ConceptModel = require('../ODM/models').concept;

function isInProfile(component, profileVersion) {
    if (profileVersion.concepts.map(c => c._id.toString()).includes(component._id.toString())) {
        return true;
    }

    if (profileVersion.externalConcepts.map(c => c._id.toString()).includes(component._id.toString())) {
        return true;
    }

    return false;
}

async function matchConcept(conceptDocument, profileVersion) {
    let match = { conceptDocument: conceptDocument };

    const exists = await ConceptModel
        .findOne({ iri: conceptDocument.id })
        .populate({
            path: 'parentProfile',
        });

    if (exists) {
        if (!exists.parentProfile) {
            match.type = 'parentless';
        } else if (exists.isDeprecated) {
            match.type = 'deprecated';
        } else if (isInProfile(exists, profileVersion)) {
            match.type = 'inProfile';
        } else {
            match.type = 'yes';
        }

        match.model = exists;
    } else {
        match.type = 'no';
        match.model = ConceptModel.buildBaseModelFromDocument(conceptDocument);
    }

    return match;
}

module.exports.harvestStatementConcepts = async function (statement, profileVersion) {
    const data = {};

    const verb = statement.verb;
    if (verb) {
        const verbDocument = {
            id: verb.id,
            type: 'Verb',
            prefLabel: verb.display,
            definition: verb.display,
        };

        data.verb = {
            document: statement,
            match: await matchConcept(verbDocument, profileVersion),
        };
    }

    const objectDocument = statement.object;
    if ((objectDocument.objectType && objectDocument.objectType.toLowerCase() === 'activity') || !objectDocument.hasOwnProperty('objectType')) {
        objectDocument.definition['@context'] = 'https://w3id.org/xapi/profiles/activity-context';
        const activityDocument = {
            id: objectDocument.id,
            type: 'Activity',
            activityDefinition: objectDocument.definition,
        };

        data.activityType = {
            document: statement,
            match: await matchConcept(activityDocument, profileVersion),
        };    
    }

    return data;
};
