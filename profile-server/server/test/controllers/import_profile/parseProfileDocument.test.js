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
const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const jsonDiff = require('json-diff');

const fs = require('fs');
const path = require('path');
const ConceptModel = require('../../../ODM/models').concept;
const TemplateModel = require('../../../ODM/models').template;
const PatternModel = require('../../../ODM/models').pattern;
const PatternComponentModel = require('../../../ODM/models').patternComponent;
const testJsonLdDiff = require('../../../utils/jsonLdDiff');

const testDirPath = 'server/test/controllers/import_profile';
const justProfile1 = './test_resources/profile_only_1.jsonld';
const parseProfileDocument = require('../../../controllers/importProfile/parseProfileDocument')
    .parseProfileDocument;
const authError = require('../../../errorTypes/authorizationError');
const pattern = require('../../../profileValidator/schemas/pattern');
const { setTimeout } = require('timers');
const profileVersionModel = require('../../../ODM/models').profileVersion;
const profileVersion = require('../../../ODM/profileVersion');
const mongoServer = new MongoMemoryServer();
jest.setTimeout(10000);

beforeAll(async () => {
    const cnnStr = await mongoServer.getUri();
    await mongoose.connect(cnnStr, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

let profileDocument;
describe('Parsing profile only', () => {
    // beforeAll(() => {
    //     profileDocument = JSON.parse(fs.readFileSync(path.join(testDirPath, justProfile1)));
    // });

    describe('should return a parsed object with just that profile in it.', async () => {
        let con1;
        let con2;
        let conDoc;
        let find1;
        beforeEach(async () => {
            conDoc = {
                iri: 'http://example.org/profiles/sports/verbs/placed',
                type: 'Verb',
                conceptType: 'Verb',
                name: 'placed',
                description: "Indicates a person finished the event in a ranked order.  Use with the 'placement' extension.",
            };
            con1 = new ConceptModel(conDoc);
            con2 = new ConceptModel(conDoc);
        });

        afterEach(async () => {
            if (con1) await con1.remove();
            if (con1) await con2.remove();
        });

        // test('things1', async () => {
        //     expect(false).toBeFalsy();
        // });

        test('things2', async () => {
            await con1.save();
            find1 = await ConceptModel.findOne({ iri: conDoc.iri });
            expect(find1).toBeTruthy();
            // con1.iri = undefined;
            // delete conDoc.iri;
            let error;
            try {
                await con2.validate();
            } catch (err) {
                error = err;
            }
            // try {
            // error = con1.validateSync();
            // } catch (err) {
            //     error = err.messege;
            // }

            expect(error).toBeTruthy();
        });

        // test('things3', async () => {
        //     await con1.save();
        //     try {
        //         await session.withTransation(async () => {
        //             await con1.remove();
        //         });
        //     } catch (err) {}
        //     find1 = await ConceptModel.findOne({ iri: conDoc.iri });
        //     expect(find1).toBeFalsy();
        // });

        // test('things4', async () => {
        //     try {
        //         await session.withTransation(async () => {
        //             await con1.save();
        //         });
        //     } catch (err) {}
        //     find1 = await ConceptModel.findOne({ iri: conDoc.iri });
        //     expect(find1).toBeTruthy();
        // });


        // const con1 = {
        //     id: 'http://example.org/profiles/sports/verbs/placed',
        //     type: 'Verb',
        //     inScheme: 'http://example.org/profiles/sports/v2',
        //     prefLabel: {
        //         en: 'placed',
        //     },
        //     definition: {
        //         en: "Indicates a person finished the event in a ranked order.  Use with the 'placement' extension.",
        //     },
        //     broadMatch: ['stuff', 'stuff_thing'],
        // };

        // const con2 = {
        //     id: 'http://example.org/profiles/sports/verbs/placed',
        //     type: 'Verb',
        //     inScheme: 'http://example.org/profiles/sports/v2',
        //     prefLabel: {
        //         en: 'place',
        //         es: 'esplaco',
        //     },
        //     definition: {
        //         en: "Indicates a person finished the event in a ranked order.  Use with the 'placement' extension.",
        //         es: 'Indicato esplaco.',
        //     },
        //     broadMatch: ['stuff', 'more_Sstuff'],
        // };

        // const testArr = [5, 4, 8, 2, 100].sort(undefined);

        // const exported = await con1.export('http://example.org/profiles/sports/v2');
        // const diff = jsonDiff.diff(exported, con2);
        // const dDiff = deepDiff.diff(exported, con2);

        // const obj1 = {
        //     a: 1, b: 2, c: 3, e: { f: 1, g: 2, h: 3 }, j: [1, 4, 3, 2], k: [1, 2, 3],
        //     m: [{ id: 7, e: 8 }, { id: 10, e: 30 }, { id: 1 }, { id: 5 }, { id: 2, e: 3 }, { id: 3 }], n: [[4, 3], [2, 1]],
        //     p: [{ location: 'c' }, { location: 'a' }, { location: 'b' }],
        // };
        // const obj2 = {
        //     a: 1, b: 4, d: 5, e: { f: 1, g: 4, i: 5 }, j: [1, 2, 4, 5], l: [4, 5, 6],
        //     m: [{ id: 9, e: 8 }, { id: 1, e: 9 }, { id: 5 }, { id: 10 }, { id: 2, e: 4 }, { id: 4 }, { id: 7, e: 8 }], n: [[1, 2], [5, 6]],
        //     p: [{ location: 'a' }, { location: 'b' }, { location: 'c' }],
        //     q: [{ t: 1 }, { y: 2 }, { a: 1, b: 4 }],
        // };

        // let processArray;
        // let processObject;

        // function findKeyInObjects(arrayOfObjs, keys) {
        //     return keys && keys.reduce((acc, curr) => {
        //         if (arrayOfObjs.every(e => Object.keys(e).includes(curr))) {
        //             if (!acc) acc = curr;
        //         }
        //         return acc;
        //     }, null);
        // }

        // function normalizeArrayDiff(array, objSortKeys) {
        //     // only add and delete will have the key
        //     // ' ' and ~ probs won't so filter them out.
        //     const keyArray = array.filter(a => ['+', '-'].includes(a[0]));

        //     // lets check if this is an array of objects
        //     if (keyArray.every(k => Array.isArray(k[1]) || !(typeof k[1] === 'object'))) {
        //         return array;
        //     }

        //     // find that key
        //     const key = findKeyInObjects(keyArray.map(k => k[1]), objSortKeys);

        //     // no key? then all is lost!  abandon all hope!
        //     if (!key) return array;

        //     let acc = [];

        //     // add all them ~ back in to the return value array.
        //     const returnArray = array.filter(a => a[0] === '~');

        //     for (const [action, val] of keyArray) {
        //         const match = acc.find(a => a[1][key] === val[key]);
        //         if (match) {
        //             // if we founa a match, add the it as a '~' with the '+' as __new nad '_' as __old
        //             const __old = action === '+' ? match[1] : val;
        //             const __new = action === '+' ? val : match[1];
        //             returnArray.push(['~', jsonDiff.diff(__old, __new)]);
        //             // filter out the match from acc
        //             acc = acc.filter(r => r !== match);
        //         } else {
        //             // no match? no compliment pushed yet so add this as the possible first
        //             acc.push([action, val]);
        //         }
        //     }

        //     // concat the return array to the acc which may have some non-matched stuff in there.
        //     return [...returnArray, ...acc];
        // }

        // function* processProperty(key, val, objSortKeys) {
        //     const [prop, action] = key.split('__');

        //     if (prop && !action) {
        //         if (Array.isArray(val)) {
        //             yield* processArray(prop, val, objSortKeys);
        //         } else if (typeof val === 'object') {
        //             yield* processObject(prop, val, objSortKeys);
        //         }
        //     } else if (action === 'added') {
        //         yield [prop, 'add', val];
        //     } else if (action === 'deleted') {
        //         yield [prop, 'delete', val];
        //     }
        // }

        // processObject = function* (key, obj, objSortKeys) {
        //     if (
        //         Object.keys(obj).includes('__old')
        //         && Object.keys(obj).includes('__new')
        //     ) {
        //         yield [`${key}`, 'update', obj.__new];
        //     } else {
        //         key = key ? `${key}.` : '';
        //         for (const [k, v] of Object.entries(obj)) {
        //             yield* processProperty(`${key}${k}`, v, objSortKeys);
        //         }
        //     }
        // };

        // processArray = function* (key, array, objSortKeys) {
        //     array = normalizeArrayDiff(array, objSortKeys);

        //     for (const [action, val] of array) {
        //         if (action === '+') {
        //             yield [`${key}`, 'add', val];
        //         } else if (action === '-') {
        //             yield [`${key}`, 'delete', val];
        //         } else if (action === '~') {
        //             if (Array.isArray(val)) {
        //                 yield* processArray(`${key}`, val);
        //             } else if (typeof val === 'object') {
        //                 yield* processObject(key, val);
        //             }
        //         }
        //     }
        // };

        // function arrayCompare(key) {
        //     return (l, r) => {
        //         let lId;
        //         let rId;
        //         if (Array.isArray(l) && Array.isArray(r)) {
        //             rId = r.sort(arrayCompare())[0];
        //             lId = l.sort(arrayCompare())[0];
        //         } else if (typeof l === 'object' && typeof r === 'object') {
        //             if (key && l[key] && r[key]) {
        //                 lId = l[key];
        //                 rId = r[key];
        //             } else {
        //                 lId = l;
        //                 rId = r;
        //             }
        //         } else {
        //             lId = l;
        //             rId = r;
        //         }

        //         if (lId < rId) return -1;
        //         if (lId > rId) return 1;
        //         return 0;
        //     };
        // }

        // function sortObjArrays(obj, objSortKeys) {
        //     const obj_ = { ...obj };
        //     for (const [key, val] of Object.entries(obj)) {
        //         // is val an array? then we need to sort it
        //         if (Array.isArray(val)) {
        //             // are the values objects? then we need to use the compare
        //             if (val.every(v => typeof v === 'object')) {
        //                 if (val.every(v => Array.isArray(v))) {
        //                     obj_[key] = val.sort(arrayCompare());
        //                 } else {
        //                     obj_[key] = val.sort(arrayCompare(findKeyInObjects(val, objSortKeys)));
        //                 }
        //             } else {
        //                 // otherwise we can jsut do a regular ol' sort
        //                 obj_[key] = val.sort();
        //             }
        //         } else if (typeof val === 'object') {
        //             // if this an object then its again around the horn.
        //             obj_[key] = sortObjArrays(val, objSortKeys);
        //         }
        //     }

        //     return obj_;
        // }

        // // const testo1 = sortObjArrays(obj1, ['id', 'location']);
        // // const testo2 = sortObjArrays(obj2, ['id', 'location']);

        // function* observeDiff(o1, o2, objSortKeys) {
        //     let o1_ = { ...o1 };
        //     let o2_ = { ...o2 };

        //     o1_ = sortObjArrays(o1, objSortKeys);
        //     o2_ = sortObjArrays(o2, objSortKeys);

        //     const diff = jsonDiff.diff(o1_, o2_) || [];
        //     yield* processObject(undefined, diff, objSortKeys);
        // }

        // function testJsonLdDiff(o1, o2, execFunc, keys) {
        //     for (const d of observeDiff(o1, o2, keys)) {
        //         execFunc(...d);
        //     }
        // }

        // const thing = jsonDiff.diff(sortObjArrays(obj1, ['id', 'location']), sortObjArrays(obj2, ['id', 'location']));
        // testJsonLdDiff(obj1, obj2, (path, action, val) => {
        //     if (action === 'add') {
        //         console.log(`${path}: ${JSON.stringify(val)} was added`);
        //     } else if (action === 'delete') {
        //         console.log(`${path}: ${JSON.stringify(val)} was deleted`);
        //     } else if (action === 'update') {
        //         console.log(`${path} was updated to ${JSON.stringify(val)}`);
        //     }
        // }, ['id', 'location']);

        // for (const d of observeDiff(obj1, obj2)) {
        //     testThingy(...d);
        // }

        // for verision
        // newVersion.concepts { concepts: [c1, c2, c5, c3] }.sort()
        // oldVersion.populate('concepts).concepts.map(c => c.iri).sort()
        // remove = [];
        // testFunc(old, new) => if 'delete' remove.push(val)

        // for concept
        // newConcept = concept
        // oldConcept = existingModel.export(parentProfile.iri)
        // testFunc => fail on everything but adding prefs and def

        expect(true).toBeTruthy();

        // const diff = jsonDiff.diff(obj1, obj2);

        // function testThis() {}

        // function testConcept(key, val) {
        //     const keySplit = key.split('__');
        //     if (['prefLabel', 'definition'].includes(keySplit[0])) {
        //         for (const [k, v] of Object.entries(val)) {
        //             if (typeof v === 'object') {
        //                 return `You are trying to update ${keySplit[0]}.${k} from ${v.__old} to ${v.__new}.  Can't do that!`;
        //             }
        //             return `${k.split('__')[1]} ${keySplit[0]}.${k.split('__')[0]} with value of ${v}`;
        //         }
        //     }
        //     return `You are trying to update ${keySplit[0]}.  You can't do that!`;
        // }

        // function* observeJsonDiff(json1, json2, testFunc) {
        //     const thisDiff = jsonDiff.diff(json1, json2);
        //     for (const [key, val] of Object.entries(thisDiff)) {
        //         yield testFunc(key, val);
        //     }
        // }

        // function* observeDiff(left, right) {
        //     const thisDiff = jsonDiff.diff(left, right);
        //     for (const [key, val] of Object.entries(thisDiff)) {
        //         const splitKey = key.split('__');

        //     }
        // }

        // const diff = jsonDiff.diff(exported, con2);
        // for (const d of observeJsonDiff(exported, con2, testConcept)) {
        //     console.log(d);
        // }

        // const otherDiff = deepDiff.diff(obj1, obj2);
        // const split1 = 'left'.split('__');
        // const split2 = 'left__right'.split('__');
        // const splitleft = 'left__'.split('__');
        // const splitright = '__right'.split('__');

        // // Man, we need to check arrays, too.
        // function jsonLdDiff(old, newuh) {
        //     let arrayDiff;
        //     let arrayModDiff;

        //     const objDiff = (o, n) => {
        //         const m = Object.entries(o).reduce((acc, [key, val]) => {
        //             if (n[key]) {
        //                 if (Array.isArray(n[key])) {
        //                     const aDiff = arrayDiff(o[key], n[key]);
        //                     if (aDiff) acc[key] = aDiff;
        //                 } else if (typeof (n[key]) === 'object') {
        //                     const oDiff = objDiff(o[key], n[key]);
        //                     if (oDiff) acc[key] = oDiff;
        //                 } else if (o[key] !== n[key]) {
        //                     acc[key] = val;
        //                 }
        //             } else {
        //                 acc[key] = val;
        //             }
        //             return acc;
        //         }, {});

        //         return Object.keys(m).length > 0 ? m : undefined;
        //     };

        //     arrayDiff = (o, n) => {
        //         const m = o.reduce((acc, curr) => {
        //             if (Array.isArray(curr)) {
        //                 const inThere = n.reduce((includes, arr) => {
        //                     if (!arrayDiff(curr, arr)) {
        //                         includes = true;
        //                     }
        //                     return includes;
        //                 }, false);
        //                 if (!inThere) {
        //                     acc.push(curr);
        //                 }
        //             } else if (typeof curr === 'object') {
        //                 const` in`There = n.reduce((includes, obj) => {
        //                     if (!objDiff(curr, obj)) {
        //                         includes = true;
        //                     }
        //                     return includes;
        //                 }, false);
        //                 if (!inThere) {
        //                     acc.push(curr);
        //                 }
        //             } else if (!n.includes(curr)) {
        //                 acc.push(curr);
        //             }
        //             return acc;
        //         }, []);

        //         return o.length > 0 ? m : undefined;
        //     };

        //     const diff = (o, n) => {
        //         let m;
        //         if (n) {
        //             if (Array.isArray(o)) {
        //                 m = arrayDiff(o, n);
        //             } else if (typeof (o) === 'object') {
        //                 m = objDiff(o, n);
        //             }
        //         } else {
        //             m = n;
        //         }
        //         return m;
        //     };

        // const objModDiff = (o, n) => {
        //     const m = Object.entries(o).reduce((acc, [key, val]) => {
        //         if (n[key]) {
        //             if (Array.isArray(n[key])) {
        //                 // acc[key] = undefined;
        //             } else if (typeof (n[key]) === 'object') {
        //                 acc[key] = objModDiff(o[key], n[key]);
        //             } else if (n[key] !== val) {
        //                 acc[key] = n[key];
        //             }
        //         }
        //         return acc;
        //     }, {});
        //     return Object.keys(m).length > 0 ? m : undefined;
        // };

        // arrayModDiff = (o, n) => {
        //     const m = o.reduce((acc, curr) => {
        //         if (typeof curr !== 'object') {
        //             if (!n.includes(curr))
        //         }
        //     }, []);
        //     return m;
        // };

        // const modDiff = (o, n) => {
        //     let m;
        //     if (n) {
        //         if (Array.isArray(o)) {
        //             m = undefined;
        //         } else if (typeof (o) === 'object') {
        //             m = objModDiff(o, n);
        //         } else if (o !== n) {
        //             m = n;
        //         }
        //     }
        //     return m;
        // };

        // return { plus: diff(newuh, old), minus: diff(old, newuh), modify: modDiff(old, newuh) };
        // return { plus: diff(newuh, old), minus: diff(old, newuh) };
        // }

        // const diff = jsonLdDiff(obj1, obj2);


        // async function getWasRevisionOfModels(existingModels, wasArray) {
        //     const was = await Promise.all(wasArray.map(async w => {
        //         const t = existingModels.find(a => a.iri === w);
        //         if (t) {
        //             return t;
        //         }

        //         const parentless = new profileVersionModel({ iri: w, name: w, description: w, isShallowVersion: true });
        //         await parentless.save();
        //         return parentless;
        //     }));

        //     return was;
        // }

        // const versions = [
        //     { id: 'd', was: ['c'], gen: new Date() },
        //     { id: 'c', was: ['b'], gen: new Date() },
        //     { id: 'b', was: ['a', 'z'], gen: new Date() },
        //     { id: 'a', gen: new Date() },
        // ].reverse();


        // const mainThing = versions.pop();
        // const acc = [];

        // // const modelVersions = (await versions.reduce(async (acc, curr) => {
        // for (const [index, curr] of versions.entries()) {
        //     let was;
        //     if (curr.was) {
        //         was = await getWasRevisionOfModels(acc, curr.was);
        //     }

        //     const shallow = new profileVersionModel({
        //         iri: curr.id,
        //         name: curr.id,
        //         description: curr.id,
        //         wasRevisionOf: was,
        //         updatedOn: curr.gen,
        //         version: index + 1,
        //         isShallowVersion: true,
        //     });
        //     await shallow.save();
        //     acc.push(shallow);
        // }

        // let was;
        // if (mainThing.was) {
        //     was = await getWasRevisionOfModels(acc, mainThing.was);
        // }

        // const mainVersion = new profileVersionModel({
        //     iri: mainThing.id,
        //     name: 'stuff',
        //     description: 'this is stuff',
        //     wasRevisionOf: was,
        //     updatedOn: mainThing.gen,
        //     createdOn: mainThing.gen,
        //     version: versions.length + 1,
        // });

        // await mainVersion.save();
        // function hasNoDuplicates(someArray) {
        //     return someArray.reduce((acc, curr) => {
        //         if (!acc || acc.includes(curr)) return false;
        //         acc.push(curr);
        //         return acc;
        //     }, []);
        // }

        // const noDupes = [1, 2, 3, 4];
        // const dupey = [1, 2, 3, 3];
        // const dupey2 = [1, 1, 3, 4];
        // const dupey3 = [1, 2, 2, 4];

        // expect(hasDuplicates(noDupes)).toBeTruthy();
        // expect(hasDuplicates(dupey)).toBeFalsy();
        // expect(hasDuplicates(dupey2)).toBeFalsy();
        // expect(hasDuplicates(dupey3)).toBeFalsy();


        // const ids = [1, 2, 3, 4];
        // const props = ['a', 'b', 'c'];

        // function sleep(ms) {
        //     return new Promise(resolve => setTimeout(resolve, ms));
        // }
        // // async function sleep(ms, message) {
        // //     return setTimeout(() => console.log(message));
        // // }

        // async function getConcept(thing, id, prop) {
        //     sleep(1000, `1st sleep ${thing}.${prop}.${id}`);
        //     console.log(`1st wait on ${thing}.${prop}.${id}`);
        //     sleep(1000, `2st sleep ${thing}.${prop}.${id}`);
        //     console.log(`2nd wait on ${thing}.${prop}.${id}`);
        //     return `${thing}.${prop}.${id}`;
        // }

        // async function resolveGetConcepts(ids, thingName, prop) {
        //     const concepts = await Promise.all(ids.map(i => getConcept(thingName, i, prop)));
        //     console.log('concepts: ', concepts);
        //     // return Promise.all(ids.map(i => getConcept(thingName, i, prop)));
        //     return concepts;
        // }

        // async function scan(thing) {
        //     const otherThing = thing;
        //     return props.reduce(async (obj, curr) => {
        //         return Object.assign(thing, { [curr]: await resolveGetConcepts(ids, thing.n, curr) });
        //     }, Promise.resolve());
        // }

        // const things = [{ n: '@' }, { n: '#' }, { n: '%' }];
        // const theEnd = await Promise.all(things.map(async t => scan(t)));
        // console.log(theEnd);

        // expect(true).toBeTruthy();

        // let existingConceptModel = new ConceptModel({ iri: 'existing_concept' });
        // await existingConceptModel.save();
        // const existingId = existingConceptModel._id.toString();

        // const prospectiveModel = new ConceptModel({
        //     iri: 'exisitng_concept',
        //     name: 'concept1',
        //     description: 'my concept',
        // });

        // existingConceptModel = await ConceptModel.findOne({ iri: existingConceptModel.iri });
        // const newProspectiveModel = prospectiveModel.toObject();
        // delete newProspectiveModel._id;
        // existingConceptModel.set(newProspectiveModel);

        // expect(existingConceptModel._id.toString()).toEqual(existingId);

        // Developing the ability to update existing subdocuments if a parentless template is actually a pattern.
        // const momPatternModel = new PatternModel({ iri: 'mom_pattern' });
        // const otherPattern = new PatternModel({ iri: 'other_pattern' });

        // const templateModel = new TemplateModel({ iri: 'test', name: 'test_temp' });
        // await templateModel.save();

        // const patternCompModel = new PatternModel({ iri: 'test_p', name: 'test_temp_p' });
        // await patternCompModel.save();

        // const comps = [
        //     new PatternComponentModel({ componentType: 'template', component: templateModel }),
        //     new PatternComponentModel({ componentType: 'pattern', component: patternCompModel }),
        // ];
        // await Promise.all(comps.map(async c => c.save()));
        // momPatternModel.alternates = comps;
        // await momPatternModel.save();

        // const otherComp = new PatternComponentModel({ componentType: 'template', component: templateModel });
        // await otherComp.save();
        // otherPattern.optional = otherComp;
        // await otherPattern.save();

        // let model = await TemplateModel.findOne({ iri: 'test' });
        // const test_id = model._id;

        // const patternModel = new PatternModel({ iri: model.iri, _id: test_id, name: 'test_pattern' });

        // await model.remove();
        // await patternModel.save();
        // // const props = ['alternates', 'optional', 'oneOrMore', 'sequence', 'zeroOrMore'];

        // const foundComps = await PatternComponentModel.find({ component: model });
        // await Promise.all(foundComps.map(async c => {
        //     c.componentType = 'pattern';
        //     c.component = patternModel;
        //     c.save();
        // }));

        // const newmomPatternModel = await PatternModel.findOne({ iri: 'mom_pattern' })
        //     .populate({ path: 'alternates', populate: { path: 'component' } });
        // const newotherPattern = await PatternModel.findOne({ iri: 'other_pattern' }).populate('optional.component');

        // model = await PatternModel.findOne({ iri: 'test' });
        // const goneModel = await TemplateModel.findOne({ iri: 'test' });

        // expect(model.iri).toEqual('test');
        // expect(goneModel).toBeFalsy();
    });
});
