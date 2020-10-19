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

const getWasRevisionOfModels = require('../../../controllers/importProfile/getWasRevisionOfModels');
const profileModel = require('../../../ODM/models').profile;
const profileVersionModel = require('../../../ODM/models').profileVersion;

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

let existingModels;
let wasRevisionOf;
let wasRevisionOFModels;

describe('getWasRevisionOfModels', () => {
    describe('when the existingModels array is empty', () => {
        beforeEach(() => {
            existingModels = [];
        });

        describe('and the wasRevisionOf array is empty', () => {
            beforeEach(() => {
                wasRevisionOf = [];
            });

            test('it should return null.', async () => {
                wasRevisionOFModels = await getWasRevisionOfModels(existingModels, wasRevisionOf);

                expect(wasRevisionOFModels).toBeFalsy();
            });
        });

        describe('and the wasRevisionOf array is not empty', () => {
            let parentlessProfiles;
            beforeEach(() => {
                wasRevisionOf = ['version1_id'];
            });

            afterEach(async () => { await Promise.all(parentlessProfiles.map(async p => p.remove())); });

            describe('and they are not on the server', () => {
                beforeEach(async () => {
                    parentlessProfiles = await getWasRevisionOfModels(existingModels, wasRevisionOf);
                });

                test('it should return an array with parentless profiles for the entries in wasRevisionOf.', () => {
                    expect(parentlessProfiles.length).toEqual(wasRevisionOf.length);
                    expect(parentlessProfiles[0].iri).toEqual(wasRevisionOf[0]);
                    expect(parentlessProfiles[0].parentProfile).toBeFalsy();
                });

                test('it should save those parentless profiles to the server.', async () => {
                    const foundModels = await Promise.all(wasRevisionOf.map(async p => profileVersionModel.findOne({ iri: p })));

                    expect(foundModels.length).toEqual(parentlessProfiles.length);
                });
            });

            describe('and they are on the server', () => {
                let existingProfileVersion;
                let existingProfileVersionModels;
                beforeEach(async () => {
                    existingProfileVersion = new profileVersionModel({
                        iri: wasRevisionOf[0],
                        name: wasRevisionOf[0],
                        description: wasRevisionOf[0],
                        parentProfile: new profileModel({ iri: 'profile1_id' }),
                    });

                    await existingProfileVersion.save();
                });

                afterEach(async () => {
                    await existingProfileVersion.remove();
                });

                test('it should return an array with the profile version found on the server.', async () => {
                    existingProfileVersionModels = await getWasRevisionOfModels(existingModels, wasRevisionOf);

                    expect(existingProfileVersionModels.length).toEqual(wasRevisionOf.length);
                    expect(existingProfileVersionModels[0].iri).toEqual(wasRevisionOf[0]);
                    expect(existingProfileVersionModels[0]._id.toString()).toEqual(existingProfileVersion._id.toString());
                });
            });
        });
    });

    describe('when the existingModels array has entries', () => {
        beforeEach(() => {
            existingModels = [
                new profileVersionModel({
                    iri: 'version1_id',
                    name: 'version1_id',
                    description: 'version1_id',
                    isShallowVersion: true,
                }),
            ];
        });

        describe('and the wasRevisionOF array is empty', () => {
            beforeEach(() => {
                wasRevisionOf = [];
            });

            test('it should return null.', async () => {
                wasRevisionOFModels = await getWasRevisionOfModels(existingModels, wasRevisionOf);

                expect(wasRevisionOFModels).toBeFalsy();
            });
        });

        describe('and the wasRevisionOf has entries', () => {
            describe('if the entries in the wasRevisionOf array are in existingModels', () => {
                beforeEach(() => {
                    wasRevisionOf = ['version1_id'];
                });

                test('it should return an array with the shallow profile found in the existing array.', async () => {
                    wasRevisionOFModels = await getWasRevisionOfModels(existingModels, wasRevisionOf);

                    expect(wasRevisionOFModels.length).toEqual(wasRevisionOf.length);
                    expect(wasRevisionOFModels[0]._id.toString()).toEqual(existingModels[0]._id.toString());
                });
            });

            describe('if the entries in the wasRevisionOf array are not in existingModels', () => {
                let foundModels;
                beforeEach(async () => {
                    wasRevisionOf = ['version2_id'];
                });

                afterEach(async () => {
                    // if (foundModels) await Promise.all(foundModels.map(async w => { w.remove(); }));

                    if (wasRevisionOFModels) await Promise.all(wasRevisionOFModels.map(async w => { w.remove(); }));
                });

                describe('and they are not on the server', () => {
                    beforeEach(async () => {
                        wasRevisionOFModels = await getWasRevisionOfModels(existingModels, wasRevisionOf);
                    });

                    test('it should return an array with parentless profiles.', () => {
                        expect(wasRevisionOFModels.length).toEqual(wasRevisionOf.length);
                        expect(wasRevisionOFModels[0].iri).toEqual(wasRevisionOf[0]);
                        expect(wasRevisionOFModels[0].parentProfile).toBeFalsy();
                    });

                    test('it should return an array with parentless profiles that have been saved to the server.', async () => {
                        foundModels = await Promise.all(wasRevisionOFModels.map(async w => profileVersionModel.findOne({ iri: w.iri })));

                        expect(foundModels.length).toEqual(wasRevisionOf.length);
                        expect(foundModels[0]._id.toString()).toEqual(wasRevisionOFModels[0]._id.toString());
                    });
                });

                describe('and they are on the server', () => {
                    let existingProfileVersion;
                    let foundModels;
                    beforeEach(async () => {
                        existingProfileVersion = new profileVersionModel({
                            iri: wasRevisionOf[0],
                            name: wasRevisionOf[0],
                            description: wasRevisionOf[0],
                            parentProfile: new profileModel({ iri: 'profile1_id' }),
                        });

                        await existingProfileVersion.save();

                        wasRevisionOFModels = await getWasRevisionOfModels(existingModels, wasRevisionOf);
                    });

                    afterEach(async () => {
                        await existingProfileVersion.remove();
                        if (wasRevisionOFModels) await Promise.all(wasRevisionOFModels.map(async w => { await w.remove(); }));
                    });

                    test('it should return an array with the profile version.', () => {
                        expect(wasRevisionOFModels.length).toEqual(wasRevisionOf.length);
                        expect(wasRevisionOFModels[0].iri).toEqual(wasRevisionOf[0]);
                        expect(wasRevisionOFModels[0].parentProfile).toBeTruthy();
                    });

                    test('it should return an array with the profile version found on the server.', async () => {
                        foundModels = await Promise.all(wasRevisionOFModels.map(async w => profileVersionModel.findOne({ iri: w.iri })));

                        expect(foundModels.length).toEqual(wasRevisionOf.length);
                        expect(foundModels[0]._id.toString()).toEqual(wasRevisionOFModels[0]._id.toString());
                    });
                });
            });
        });
    });
});
