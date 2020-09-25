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
const jsonDiff = require('json-diff');
const cloneDeep = require('lodash/cloneDeep');

let readDiffArray;
let readDiffObject;

function findKeyInObjects(arrayOfObjs, objSortKeys) {
    return objSortKeys && objSortKeys.reduce((acc, curr) => {
        if (arrayOfObjs.every(e => Object.keys(e).includes(curr))) {
            if (!acc) acc = curr;
        }
        return acc;
    }, null);
}

function normalizeArrayDiff(array, objSortKeys) {
    // only add and delete will have the key
    // ' ' and ~ probs won't so filter them out.
    const keyArray = array.filter(a => ['+', '-'].includes(a[0]));

    // lets check if this is an array of objects
    if (keyArray.every(k => Array.isArray(k[1]) || !(typeof k[1] === 'object'))) {
        return array;
    }

    // find that key
    const key = findKeyInObjects(keyArray.map(k => k[1]), objSortKeys);

    // no key? then all is lost!  abandon all hope!
    if (!key) return array;

    let acc = [];

    // add all them ~ back in to the return value array.
    const returnArray = array.filter(a => a[0] === '~');

    for (const [action, val] of keyArray) {
        const match = acc.find(a => a[1][key] === val[key]);
        if (match) {
            // if we founa a match, add the it as a '~' with the '+' as __new nad '_' as __old
            const __old = action === '+' ? match[1] : val;
            const __new = action === '+' ? val : match[1];
            returnArray.push(['~', jsonDiff.diff(__old, __new)]);
            // filter out the match from acc
            acc = acc.filter(r => r !== match);
        } else {
            // no match? no compliment pushed yet so add this as the possible first
            acc.push([action, val]);
        }
    }

    // concat the return array to the acc which may have some non-matched stuff in there.
    return [...returnArray, ...acc];
}

function* readDiffProperty(key, val, objSortKeys) {
    const [prop, action] = key.split('__');

    if (prop && !action) {
        if (Array.isArray(val)) {
            yield* readDiffArray(prop, val, objSortKeys);
        } else if (typeof val === 'object') {
            yield* readDiffObject(prop, val, objSortKeys);
        }
    } else if (action === 'added') {
        if (!(Array.isArray(val) && val.length < 1)) {
            yield [prop, 'add', val];
        }
    } else if (action === 'deleted') {
        if (!(Array.isArray(val) && val.length < 1)) {
            yield [prop, 'delete', val];
        }
    }
}

readDiffObject = function* (key, obj, objSortKeys) {
    if (
        Object.keys(obj).includes('__old')
        && Object.keys(obj).includes('__new')
    ) {
        yield [`${key}`, 'update', obj.__new];
    } else {
        key = key ? `${key}.` : '';
        for (const [k, v] of Object.entries(obj)) {
            yield* readDiffProperty(`${key}${k}`, v, objSortKeys);
        }
    }
};

readDiffArray = function* (key, array, objSortKeys) {
    array = normalizeArrayDiff(array, objSortKeys);

    for (const [action, val] of array) {
        if (action === '+') {
            yield [`${key}`, 'add', val];
        } else if (action === '-') {
            yield [`${key}`, 'delete', val];
        } else if (action === '~') {
            if (Array.isArray(val)) {
                yield* readDiffArray(`${key}`, val, objSortKeys);
            } else if (typeof val === 'object') {
                yield* readDiffObject(key, val, objSortKeys);
            }
        }
    }
};

function arrayCompare(key) {
    return (l, r) => {
        let lId;
        let rId;
        if (Array.isArray(l) && Array.isArray(r)) {
            rId = r.sort(arrayCompare())[0];
            lId = l.sort(arrayCompare())[0];
        } else if (typeof l === 'object' && typeof r === 'object') {
            if (key && l[key] && r[key]) {
                lId = l[key];
                rId = r[key];
            } else {
                lId = l;
                rId = r;
            }
        } else {
            lId = l;
            rId = r;
        }

        if (lId < rId) return -1;
        if (lId > rId) return 1;
        return 0;
    };
}

function sortObjArrays(obj, objSortKeys) {
    // const obj_ = Object.assign({}, obj);
    for (const [key, val] of Object.entries(obj)) {
        // is val an array? then we need to sort it
        if (Array.isArray(val)) {
            // is this array empty?  We need to dump it so that the diff doesn't consider
            // key populated.
            if (val.length < 1) delete obj[key];
            // are the values objects? then we need to use the compare
            if (val.every(v => typeof v === 'object')) {
                if (val.every(v => Array.isArray(v))) {
                    obj[key] = val.sort(arrayCompare());
                } else {
                    obj[key] = val.sort(arrayCompare(findKeyInObjects(val, objSortKeys)));
                }
            } else {
                // otherwise we can jsut do a regular ol' sort
                obj[key] = val.sort();
            }
        } else if (typeof val === 'object') {
            // if this an object then its again around the horn.
            obj[key] = sortObjArrays(val, objSortKeys);
        }
    }

    return obj;
}

function* observeDiff(o1, o2, objectSortKeys) {
    let o1_ = cloneDeep(o1);
    let o2_ = cloneDeep(o2);

    o1_ = sortObjArrays(o1_, objectSortKeys);
    o2_ = sortObjArrays(o2_, objectSortKeys);

    const diff = jsonDiff.diff(o1_, o2_) || [];
    yield* readDiffObject(undefined, diff, objectSortKeys);
}

module.exports = function testJsonLdDiff(o1, o2, execFunc, objectSortKeys) {
    for (const d of observeDiff(o1, o2, objectSortKeys)) {
        execFunc(...d);
    }
};
