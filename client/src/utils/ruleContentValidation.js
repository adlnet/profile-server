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
export function getConditionsList (rules) {
    return Object.entries(rules).map(([key, value]) => {
        if (['presence', 'all', 'any', 'none'].includes(key)) {
            if (key === 'presence' && value !== 'excluded') {
                return null;
            } else {
                return {
                    type: key,
                    value: value,
                }
            }
        } else {
            return null;
        }
    }).filter(r => r);
};

export function getLocationMap (location, determiningProperties) {
    /*
    We are only looking at locations that might relate to determining properties that could be specified by the templates.
    */
    const locationMap = {
        '$.verb': { type: 'presence', propType: 'verb', determiningProperties: determiningProperties.verb },
        '$.verb.id': { type: 'value', propType: 'verb', determiningProperties: determiningProperties.verb },
        '$.object.definition': { type: 'presence', propType: 'objectActivityType', determiningProperties: determiningProperties.objectActivityType },
        '$.object.definition.type': { type: 'value', propType: 'objectActivityType', determiningProperties: determiningProperties.objectActivityType },
        '$.verb.id': { type: 'value', propType: 'verb', determiningProperties: determiningProperties.verb },
        '$.context.contextActivities.parent': { type: 'presence', propType: 'contextParentActivityType', determiningProperties: determiningProperties.contextParentActivityType },
        '$.context.contextActivities.parent.definition': { type: 'presence', propType: 'contextParentActivityType', determiningProperties: determiningProperties.contextParentActivityType },
        '$.context.contextActivities.parent.definition.type': { type: 'value', propType: 'contextParentActivityType', determiningProperties: determiningProperties.contextParentActivityType },
        '$.context.contextActivities.parent[*].definition': { type: 'presence', propType: 'contextParentActivityType', determiningProperties: determiningProperties.contextParentActivityType },
        '$.context.contextActivities.parent[*].definition.type': { type: 'value', propType: 'contextParentActivityType', determiningProperties: determiningProperties.contextParentActivityType },
        '$.context.contextActivities.grouping': { type: 'presence', propType: 'contextGroupingActivityType', determiningProperties: determiningProperties.contextGroupingActivityType },
        '$.context.contextActivities.grouping.definition': { type: 'presence', propType: 'contextGroupingActivityType', determiningProperties: determiningProperties.contextGroupingActivityType },
        '$.context.contextActivities.grouping.definition.type': { type: 'value', propType: 'contextGroupingActivityType', determiningProperties: determiningProperties.contextGroupingActivityType },
        '$.context.contextActivities.grouping[*].definition': { type: 'presence', propType: 'contextGroupingActivityType', determiningProperties: determiningProperties.contextGroupingActivityType },
        '$.context.contextActivities.grouping[*].definition.type': { type: 'value', propType: 'contextGroupingActivityType', determiningProperties: determiningProperties.contextGroupingActivityType },
        '$.context.contextActivities.category': { type: 'presence', propType: 'contextCategoryActivityType', determiningProperties: determiningProperties.contextCategoryActivityType },
        '$.context.contextActivities.category.definition': { type: 'presence', propType: 'contextCategoryActivityType', determiningProperties: determiningProperties.contextCategoryActivityType },
        '$.context.contextActivities.category.definition.type': { type: 'value', propType: 'contextCategoryActivityType', determiningProperties: determiningProperties.contextCategoryActivityType },
        '$.context.contextActivities.category[*].definition': { type: 'presence', propType: 'contextCategoryActivityType', determiningProperties: determiningProperties.contextCategoryActivityType },
        '$.context.contextActivities.category[*].definition.type': { type: 'value', propType: 'contextCategoryActivityType', determiningProperties: determiningProperties.contextCategoryActivityType },
        '$.context.contextActivities.other': { type: 'presence', propType: 'contextOtherActivityType', determiningProperties: determiningProperties.contextOtherActivityType },
        '$.context.contextActivities.other.definition': { type: 'presence', propType: 'contextOtherActivityType', determiningProperties: determiningProperties.contextOtherActivityType },
        '$.context.contextActivities.other.definition.type': { type: 'value', propType: 'contextOtherActivityType', determiningProperties: determiningProperties.contextOtherActivityType },
        '$.context.contextActivities.other[*].definition': { type: 'presence', propType: 'contextOtherActivityType', determiningProperties: determiningProperties.contextOtherActivityType },
        '$.context.contextActivities.other[*].definition.type': { type: 'value', propType: 'contextOtherActivityType', determiningProperties: determiningProperties.contextOtherActivityType },
        '$.attachments': { type: 'presence', propType: 'attachmentUsageType', determiningProperties: determiningProperties.attachmentUsageType },
        '$.attachments[*].usageType': { type: 'value', propType: 'attachmentUsageType', determiningProperties: determiningProperties.attachmentUsageType },
    };

    const map = locationMap[location];
    if (!map) return;

    return {
        location: location,
        ...map,
    };
}

export function getDeterminingPropMap (determiningProperties) {
    return determiningProperties.reduce((acc, curr) => {
        if (Array.isArray(curr.properties) && curr.properties.length > 0) {
            acc[curr.propertyType] = curr.properties.map(c => c.iri);
        } else if (curr.properties) {
            acc[curr.propertyType] = curr.properties.iri;
        }

        return acc;
    }, {});
};

export function testExcludedPresence (locationMap) {
    const determiningProperties = locationMap.determiningProperties;
    console.log('test', locationMap)
    if ((Array.isArray(determiningProperties) && determiningProperties.length) || determiningProperties) {
        throw new Error(
            `The presence cannot be excluded for location ${locationMap.location} because a ${locationMap.propType} determining property has been specified for this template.`,
        );
    }
}
export function testAll (locationMap, value) {
    const determiningProperties = locationMap.determiningProperties;

    if (!determiningProperties || (Array.isArray(determiningProperties) && determiningProperties.length <= 0)) {
        throw new Error(
            `There cannot be an all condition for location ${locationMap.location} because a ${locationMap.propType} determining property has not been specified for this template.`,
        );
    }

    let failed = false;
    if (Array.isArray(determiningProperties)) {
        if (!determiningProperties.every(d => value.includes(d))) {
            failed = true;
        } else {
            return;
        }
    }

    if (!value.includes(determiningProperties)) {
        failed = true;
    }

    if (failed) {
        throw new Error(
            `Not every value in the ${locationMap.propType} determining property specified for ${locationMap.location} is present in the all condition values.`,
        ); 
    }
}

export function testAny (locationMap, value) {
    const determiningProperties = locationMap.determiningProperties;

    if (!(determiningProperties) || (Array.isArray(determiningProperties) && determiningProperties.length <= 0)) {
        throw new Error(
            `There cannot be an any condition for location ${locationMap.location} because a ${locationMap.propType} determining property has not been specified for this template.`,
        );
    }

    let failed = false;
    if (Array.isArray(determiningProperties)) {
        if (!determiningProperties.some(d => value.includes(d))) {
            failed = true;
        } else {
            return;
        }
    }

    if (!value.includes(determiningProperties)) {
        failed = true;
    }

    if (failed) {
        throw new Error(
            `No value in the ${locationMap.propType} determining property specified for ${locationMap.location} is present in the any condition values.`,
        ); 
    }
}

export function testNone (locationMap, value) {
    const determiningProperties = locationMap.determiningProperties;

    let failed = false;
    if (Array.isArray(determiningProperties)) {
        if (determiningProperties.some(d => value.includes(d))) {
            failed = true;
        } else {
            return;
        }
    }

    if (determiningProperties && value.includes(determiningProperties)) {
        failed = true;
    }

    if (failed) {
        throw new Error(
            `There are values in the ${locationMap.propType} determining property specified for ${locationMap.location} that are present in the none condition values.`,
        ); 
    }
}

export function testCondition (locationMap, condition) {
    if (condition.type === 'presence') {
        testExcludedPresence(locationMap);
        return;
    }
    
    if (locationMap.type === 'value') {
        if (condition.type === 'all') {
            testAll(locationMap, condition.value);
        } else if (condition.type === 'any') {
            testAny(locationMap, condition.value);
        } else if (condition.type === 'none') {
            testNone(locationMap, condition.value);
        } 
    }
}

export function validateRuleContent (determiningProperties, rule) {
    const detPropMap = getDeterminingPropMap(determiningProperties);
    const locationMap = getLocationMap(rule.location, detPropMap);

    if (!locationMap) return;

    const conditionList = getConditionsList(rule);
    console.log('validating', detPropMap, locationMap, conditionList);

    if (
            conditionList.find(c => c.type === 'presence')
            && conditionList.find(c => ['any', 'all'].includes(c.type))
    ) {
        throw new Error(
            `There is a presence condition equal to excluded and at least one of an any or all condition types for location ${locationMap.location}.`
        );
    }
    conditionList.forEach(c => {
        testCondition(locationMap, c);
    });
};
