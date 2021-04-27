/* eslint-disable notice/notice */
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
const Validator = require('jsonschema').Validator;
const v = new Validator();

const activity = require('./schemas/activity');
const concept = require('./schemas/concept');
const definition = require('./schemas/definition');
const document = require('./schemas/document');
const extension = require('./schemas/extension');
const interactionData = require('./schemas/interactionData');
const jsonschema = require('./schemas/jsonschema');
const languageMap = require('./schemas/languageMap');
const organization = require('./schemas/organization');
const pattern = require('./schemas/pattern');
const profile = require('./schemas/profile');
const profileVersion = require('./schemas/profileVersion');
const rule = require('./schemas/rule');
const template = require('./schemas/template');

Validator.prototype.customFormats.jsonschema = function (input) {
    let parsed;
    try {
        parsed = JSON.parse(input);
    } catch (e) {
        console.log(input);
        console.log(e);
        return false;
    }
    const ret = v.validate(parsed, jsonschema);
    if (ret.errors.length) {
        console.log('Error in jsonschema format');
    }
    return ret.errors.length === 0;
};

v.addSchema(activity, activity.id.replace('#', '/#'));
v.addSchema(concept, concept.id.replace('#', '/#'));
v.addSchema(definition, definition.id.replace('#', '/#'));
v.addSchema(document, document.id.replace('#', '/#'));
v.addSchema(extension, extension.id.replace('#', '/#'));
v.addSchema(interactionData, interactionData.id.replace('#', '/#'));
v.addSchema(jsonschema, jsonschema.id.replace('#', '/#'));
v.addSchema(languageMap, languageMap.id.replace('#', '/#'));
v.addSchema(organization, organization.id.replace('#', '/#'));
v.addSchema(pattern, pattern.id.replace('#', '/#'));
v.addSchema(profile, profile.id.replace('#', '/#'));
v.addSchema(profileVersion, profileVersion.id.replace('#', '/#'));
v.addSchema(rule, rule.id.replace('#', '/#'));
v.addSchema(template, template.id.replace('#', '/#'));

v.attributes.exclusiveProps = function (instance, schema, options, ctx) {
    if (Array.isArray(schema.exclusiveProps) !== true) { throw new Error('"exclusiveProps" schema keyword expects an array of strings'); }
    let c = 0;
    for (const i in schema.exclusiveProps) {
        if (instance[schema.exclusiveProps[i]] !== undefined) { c++; }
    }
    if (c > 1) { return 'should only have one property from ' + schema.exclusiveProps.join(','); }
};

v.attributes.requiresOneOf = function (instance, schema, options, ctx) {
    if (Array.isArray(schema.requiresOneOf) !== true) { throw new Error('"requiresOneOf" schema keyword expects an array of strings'); }
    let c = 0;
    for (const i in schema.requiresOneOf) {
        if (instance[schema.requiresOneOf[i]] !== undefined) { c++; }
    }
    if (c !== 1) { return 'must have one and only one property from  ' + schema.requiresOneOf.join(','); }
};
v.attributes.requiresAtLeastOne = function (instance, schema, options, ctx) {
    if (Array.isArray(schema.requiresAtLeastOne) !== true) { throw new Error('"requiresAtLeastOne" schema keyword expects an array of strings'); }
    let c = 0;
    for (const i in schema.requiresAtLeastOne) {
        if (instance[schema.requiresAtLeastOne[i]] !== undefined) { c++; }
    }
    if (c === 0) { return 'must have one or more property from  ' + schema.requiresAtLeastOne.join(','); }
};
v.attributes.primaryPatternRule = function (instance, schema, options, ctx) {
    if (typeof schema.primaryPatternRule !== 'boolean') { throw new Error('"primaryPatternRule" schema keyword expects a boolean'); }
    if (instance.primary) {
        if (!instance.prefLabel || !instance.definition) { return 'A primary Pattern MUST include prefLabel and definition. They are optional otherwise.'; }
    }
};
module.exports = v;
