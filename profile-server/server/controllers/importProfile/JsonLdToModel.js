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
const { validationError } = require('../../errorTypes/errors');

exports.JsonLdToModel = function () {
    function toName (prefLabel, isOptional) {
        let name;
        if (prefLabel && Object.keys(prefLabel).length > 0) {
            const enKey = Object.keys(prefLabel).sort().filter(k => /$en/i.test(k));
            const languageKey = (enKey.length > 0 && enKey[0]) || Object.keys(prefLabel).sort()[0];
            name = prefLabel[languageKey];
        } else if (isOptional) {
            name = '';
        } else {
            throw new validationError('prefLabel cannot be empty or undefined');
        }

        return name;
    }

    function toDescription (definition, isOptional) {
        let description;
        if (definition && Object.keys(definition).length > 0) {
            const enKey = Object.keys(definition).sort().filter(k => /$en/i.test(k));
            const languageKey = (enKey.length > 0 && enKey[0]) || Object.keys(definition).sort()[0];
            description = definition[languageKey];
        } else if (isOptional) {
            description = '';
        } else {
            throw new validationError('definition cannot be empty or undefined');
        }

        return description;
    }

    function toTranslations (prefLabel, definition, isOptional) {
        if ((!(prefLabel && definition) || Object.keys(prefLabel).keys().length < 1
                || Object.keys(definition).keys().length < 1)
                && !(isOptional && (isOptional.prefLabel || isOptional.definition))) {
            throw new validationError('prefLabel and definition cannot be empty or undefined.');
        }
        if ((!prefLabel || Object.keys(prefLabel).keys().length < 1)
                && (isOptional && isOptional.prefLabel)) {
            prefLabel = '';
        } else if ((!prefLabel || Object.keys(prefLabel).keys().length < 1)
                && !(isOptional && isOptional.prefLabel)) {
            throw new validationError('prefLabel cannot be empty or undefined.');
        }
        if ((!definition || Object.keys(definition).keys().length < 1)
                && (isOptional && isOptional.definition)) {
            definition = '';
        } else if ((!definition || Object.keys(definition).keys().length < 1)
                && !(isOptional && isOptional.definition)) {
            throw new validationError('definition cannot be empty or undefined.');
        }


        const translations = [];
        const enNameKey = Object.keys(prefLabel).sort().filter(k => /$en/i.test(k));
        const languageNameKey = (enNameKey.length > 0 && enNameKey[0]) || Object.keys(prefLabel).sort()[0];
        const translationNameKeys = Object.keys(prefLabel).filter(k => k !== languageNameKey);

        const enDescKey = Object.keys(definition).sort().filter(k => /$en/i.test(k));
        const languageDescKey = (enDescKey.length > 0 && enDescKey[0]) || Object.keys(definition).sort()[0];
        const translationDescKeys = Object.keys(definition).filter(k => k !== languageDescKey);

        const pairedKeys = translationNameKeys.filter(k => translationDescKeys.includes(k));
        const nonPairedNameKeys = translationNameKeys.filter(k => !translationDescKeys.includes(k));
        const nonPairedDescKeys = translationDescKeys.filter(k => !translationNameKeys.includes(k));

        pairedKeys.forEach(p => (
            translations.push({
                language: p,
                translationName: prefLabel[p],
                translationDesc: definition[p],
            })
        ));

        nonPairedNameKeys.forEach(n => (
            translations.push({
                language: n,
                translationName: prefLabel[n],
            })
        ));

        nonPairedDescKeys.forEach(d => (
            translations.push({
                language: d,
                translationDesc: definition[d],
            })
        ));

        return translations;
    }

    function toSchema(inlineSchema, schema) {
        if (inlineSchema && schema) {
            throw new validationError('Cannot have both an inlineSchema a schema property in the same concept.');
        }

        return {
            inlineSchema: inlineSchema,
            schemaString: schema,
        };
    }

    function toIsDeprecated(deprecated) {
        let isDeprecated;
        try {
            if (!deprecated || deprecated.toLowerCase() === 'false') {
                isDeprecated = false;
            } else if (deprecated.toLowerCase() === 'true') {
                isDeprecated = true;
            } else {
                throw new validationError(`${deprecated} is not a valid value for deprecated.`);
            }
        }
        catch {
            isDeprecated = false;
        }

        return isDeprecated;
    }

    function toInteractionActivities(activityDefinition) {
        const baseInteractionActivityProps = [
            'interactionType', 'correctResponsesPattern',
        ];
        const interactionCompLists = ['choices', 'scale', 'source', 'target', 'steps'];
        const interactionActivityProps = [...baseInteractionActivityProps, ...interactionCompLists];
        const interactionTypes = [
            'choice', 'sequencing', 'likert', 'matching', 'performance', 'true-false', 'fill-in',
            'long-fill-in', 'numeric', 'other',
        ];
        const interactionActivityMap = {
            choice: ['choices'],
            sequencing: ['choices'],
            likert: ['scale'],
            matching: ['source', 'target'],
            performance: ['steps'],
            'true-false': [],
            'fill-in': [],
            'long-fill-in': [],
            numeric: [],
            other: [],
        };

        if (!activityDefinition.type || !activityDefinition.type.endsWith('cmi.interaction')) {
            if (Object.keys(activityDefinition).some(a => interactionActivityProps.includes(a))) {
                throw new validationError('Interaction Activity properties are populated but the activity type of this concept is not cmi.interaction.');
            }

            return {};
        }
        if (!activityDefinition.interactionType) {
            throw new validationError('The activity type is cmi.interaction but there is no interactionType.');
        }
        if (!interactionTypes.includes(activityDefinition.interactionType)) {
            throw new validationError(`${activityDefinition.interactionType} is not a valid interactionType`);
        }

        const invalidCompLists = interactionCompLists.filter(
            l => !interactionActivityMap[activityDefinition.interactionType].includes(l),
        );
        const activityInteractionCompLists = Object.keys(activityDefinition).filter(
            a => interactionCompLists.includes(a),
        );
        if (activityInteractionCompLists.some(a => invalidCompLists.includes(a))) {
            throw new validationError(`There are interaction component lists populated that do not support interactionType ${activityDefinition.interactionType}`);
        }

        const interactionActivities = {};
        interactionActivityProps.forEach(i => { interactionActivities[i] = activityDefinition[i]; });

        return interactionActivities;
    }

    function toActivityDefinition(activityDefinition) {
        if (!activityDefinition) {
            throw new validationError('Concept is missing an activityDefinition property.');
        }
        if (!Object.keys(activityDefinition).includes('@context')) {
            throw new validationError('Concept activityDefinition property is missing the @context property.');
        }
        if (Object.keys(activityDefinition).length < 2) {
            throw new validationError('Concept has an empty activityDefinition property.');
        }

        return {
            contextIri: activityDefinition['@context'],
            name: toName(activityDefinition.name, true),
            description: toDescription(activityDefinition.description, true),
            translations: toTranslations(
                activityDefinition.name, activityDefinition.description, {
                    prefLabel: true,
                    definition: true,
                },
            ),
            activityType: activityDefinition.type,
            moreInformation: activityDefinition.moreInfo,
            extensions: activityDefinition.extensions,
            ...toInteractionActivities(activityDefinition),
        };
    }

    function toPatternType(patternDocument) {
        const patternTypes = ['alternates', 'optional', 'oneOrMore', 'sequence', 'zeroOrMore'];
        const patternTypeProperties = Object.keys(patternDocument).filter(p => patternTypes.includes(p));

        if (patternTypeProperties.length < 1) {
            throw new validationError(`Pattern ${patternDocument.id} must have at least one of alternates, optional, oneOrMore, sequence, and zeroOrMore.`);
        }
        if (patternTypeProperties.length > 1) {
            throw new validationError(`Pattern ${patternDocument.id} must not have more than one of alternates, optional, oneOrMore, sequence, and zeroOrMore.`);
        }

        return patternTypeProperties[0];
    }

    return {
        toName: toName,
        toDescription: toDescription,
        toTranslations: toTranslations,
        toSchema: toSchema,
        toIsDeprecated: toIsDeprecated,
        toActivityDefinition: toActivityDefinition,
        toInteractionActivities: toInteractionActivities,
        toPatternType: toPatternType,
    };
};
