const { pattern } = require('../../../ODM/models');

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
const JsonLdToModel = require('../../../controllers/importProfile/JsonLdToModel').JsonLdToModel;

let jsonLdToModel;
beforeAll(() => {
    jsonLdToModel = new JsonLdToModel();
});

describe('JsonLdToModel#toName', () => {
    describe('if optional is true', () => {
        describe('when prefLabel does not exist', () => {
            test('it should return an empty string.', () => {
                const name = jsonLdToModel.toName(undefined, true);
                expect(name).toEqual('');
            });
        });
    });

    describe('if prefLabel has an entry for `en`', () => {
        test('it should return the value of that entry.', () => {
            const name = jsonLdToModel.toName({
                en: 'test_name',
                es: 'spanish_name',
            });
            expect(name).toEqual('test_name');
        });
    });

    describe('if prefLabel has 2 entries that start with `en`', () => {
        test('it should return the value of the key that starts with `en` and is first sorted lexicographically.', () => {
            const name = jsonLdToModel.toName({
                es: 'spanish_name',
                en: 'test_name',
                'en-us': 'us_test_name',
            });
            expect(name).toEqual('test_name');
        });
    });

    describe('if prefLabel does not have an entry for `en`', () => {
        test('it should return the value of the key that is first sorted lexicographically.', () => {
            const name = jsonLdToModel.toName({
                'es-ha': 'china_spanish_name',
                es: 'spanish_name',
                fr: 'french_name',
            });
            expect(name).toEqual('spanish_name');
        });
    });

    describe('if prefLabel is null or undefined', () => {
        test('it should throw an error', () => {
            let name;
            let error;
            try {
                name = jsonLdToModel.toName();
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/prefLabel cannot be empty or undefined/);

            try {
                name = jsonLdToModel.toName({});
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/prefLabel cannot be empty or undefined/);
        });
    });
});

describe('JsonLdToModel#toDescription', () => {
    describe('if optional is true', () => {
        describe('when definition does not exist', () => {
            test('it should return an empty string.', () => {
                const name = jsonLdToModel.toDescription(undefined, true);
                expect(name).toEqual('');
            });
        });
    });

    describe('if definition has an entry for `en`', () => {
        test('it should return the value of that entry.', () => {
            const description = jsonLdToModel.toDescription({
                en: 'test_description',
                es: 'spanish_description',
            });
            expect(description).toEqual('test_description');
        });
    });

    describe('if definition has 2 entries that start with `en`', () => {
        test('it should return the value of the key that starts with `en` and is first sorted lexicographically.', () => {
            const description = jsonLdToModel.toDescription({
                es: 'spanish_description',
                en: 'test_description',
                'en-us': 'us_test_description',
            });
            expect(description).toEqual('test_description');
        });
    });

    describe('if definition does not have an entry for `en`', () => {
        test('it should return the value of the key that is first sorted lexicographically.', () => {
            const description = jsonLdToModel.toDescription({
                'es-ha': 'china_spanish_description',
                es: 'spanish_description',
                fr: 'french_description',
            });
            expect(description).toEqual('spanish_description');
        });
    });

    describe('if definition is null or undefined', () => {
        test('it should throw an error', () => {
            let description;
            let error;
            try {
                description = jsonLdToModel.toDescription();
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/definition cannot be empty or undefined/);

            try {
                description = jsonLdToModel.toDescription({});
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/definition cannot be empty or undefined/);
        });
    });
});

describe('JsonLdToModel#toTranslations', () => {
    describe('if isOptional object exists', () => {
        describe('and isOptional.prefLabel is true', () => {
            describe('when prefLabel does not exist ', () => {
                describe('and definition exists with at least two entries', () => {
                    test('it should return a translations with the non-en key value as description.', () => {
                        let translations = jsonLdToModel.toTranslations(
                            undefined,
                            {
                                en: 'test_description',
                                es: 'spanish_description',
                            },
                            {
                                prefLabel: true,
                            },
                        );

                        expect(translations.length).toEqual(1);
                        expect(translations[0].language).toEqual('es');
                        expect(translations[0].translationName).toBeUndefined();
                        expect(translations[0].translationDesc).toEqual('spanish_description');

                        translations = jsonLdToModel.toTranslations(
                            {},
                            {
                                en: 'test_description',
                                es: 'spanish_description',
                            },
                            {
                                prefLabel: true,
                            },
                        );

                        expect(translations.length).toEqual(1);
                        expect(translations[0].language).toEqual('es');
                        expect(translations[0].translationName).toBeUndefined();
                        expect(translations[0].translationDesc).toEqual('spanish_description');
                    });
                });

                describe('and definition is does not exist', () => {
                    test('it should throw an error.', () => {
                        let error;
                        try {
                            const translations = jsonLdToModel.toTranslations(
                                undefined,
                                undefined,
                                {
                                    prefLabel: true,
                                },
                            );
                        } catch (err) {
                            error = err.message;
                        }
                        expect(error).toMatch(/definition cannot be empty or undefined/);

                        try {
                            const translations = jsonLdToModel.toTranslations(
                                {},
                                {},
                                {
                                    prefLabel: true,
                                },
                            );
                        } catch (err) {
                            error = err.message;
                        }
                        expect(error).toMatch(/definition cannot be empty or undefined/);
                    });
                });
            });


            describe('and isOptional.definition is true', () => {
                describe('when prefLabel and description do not exist', () => {
                    test('it should return an empty array.', () => {
                        let translations = jsonLdToModel.toTranslations(
                            undefined,
                            undefined,
                            {
                                prefLabel: true,
                                definition: true,
                            },
                        );

                        expect(translations.length).toEqual(0);

                        translations = jsonLdToModel.toTranslations(
                            {},
                            {},
                            {
                                prefLabel: true,
                                definition: true,
                            },
                        );

                        expect(translations.length).toEqual(0);
                    });
                });
            });
        });

        describe('and isOptional.definition is true', () => {
            describe('when definition does not exist', () => {
                describe('and prefLabel exists with at least two entries', () => {
                    test('it should return a translations with the non-en key value as name.', () => {
                        let translations = jsonLdToModel.toTranslations(
                            {
                                en: 'test_name',
                                es: 'spanish_name',
                            },
                            undefined,
                            {
                                definition: true,
                            },
                        );

                        expect(translations.length).toEqual(1);
                        expect(translations[0].language).toEqual('es');
                        expect(translations[0].translationName).toEqual('spanish_name');
                        expect(translations[0].translationDesc).toBeUndefined();

                        translations = jsonLdToModel.toTranslations(
                            {
                                en: 'test_name',
                                es: 'spanish_name',
                            },
                            {},
                            {
                                definition: true,
                            },
                        );

                        expect(translations.length).toEqual(1);
                        expect(translations[0].language).toEqual('es');
                        expect(translations[0].translationName).toEqual('spanish_name');
                        expect(translations[0].translationDesc).toBeUndefined();
                    });
                });

                describe('and prefLabel does not exist', () => {
                    test('it should throw an error.', () => {
                        let error;
                        try {
                            const translations = jsonLdToModel.toTranslations(
                                undefined,
                                undefined,
                                {
                                    definition: true,
                                },
                            );
                        } catch (err) {
                            error = err.message;
                        }
                        expect(error).toMatch(/prefLabel cannot be empty or undefined/);

                        try {
                            const translations = jsonLdToModel.toTranslations(
                                {},
                                {},
                                {
                                    definition: true,
                                },
                            );
                        } catch (err) {
                            error = err.message;
                        }
                        expect(error).toMatch(/prefLabel cannot be empty or undefined/);
                    });
                });
            });
        });
    });

    describe('if prefLabel or definition are null', () => {
        test('it should throw an error', () => {
            let translations;
            let error;
            try {
                translations = jsonLdToModel.toTranslations();
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/prefLabel and definition cannot be empty or undefined/);

            try {
                translations = jsonLdToModel.toTranslations({}, {});
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/prefLabel and definition cannot be empty or undefined/);

            try {
                translations = jsonLdToModel.toTranslations(null, null);
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/prefLabel and definition cannot be empty or undefined/);

            try {
                translations = jsonLdToModel.toTranslations(undefined, undefined);
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/prefLabel and definition cannot be empty or undefined/);

            try {
                translations = jsonLdToModel.toTranslations(
                    { en: 'test_name' },
                    undefined,
                );
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/prefLabel and definition cannot be empty or undefined/);

            try {
                translations = jsonLdToModel.toTranslations(
                    undefined,
                    { en: 'test_description' },
                );
            } catch (err) {
                error = err.message;
            }
            expect(error).toMatch(/prefLabel and definition cannot be empty or undefined/);
        });
    });

    describe('if prefLabel and definition have only one entry each for the same language', () => {
        test('it should return an empty array', () => {
            const translations = jsonLdToModel.toTranslations(
                {
                    en: 'test_name',
                },
                {
                    en: 'test_description',
                },
            );

            expect(translations.length).toEqual(0);
        });
    });

    describe('if prefLabel and definition both have more than one entry', () => {
        describe('and the entry keys match', () => {
            describe('and one of the keys is `en`', () => {
                test('it should return translations with an entry for the key.', () => {
                    const translations = jsonLdToModel.toTranslations(
                        {
                            en: 'test_name',
                            es: 'spanish_name',
                        },
                        {
                            en: 'test_description',
                            es: 'spanish_description',
                        },
                    );

                    expect(translations.length).toEqual(1);
                    expect(translations[0].language).toEqual('es');
                    expect(translations[0].translationName).toEqual('spanish_name');
                    expect(translations[0].translationDesc).toEqual('spanish_description');
                });
            });

            describe('and none of the keys are `en`', () => {
                test('it should return translations with entries for all matches except for the first sorted lexicographically.', () => {
                    const translations = jsonLdToModel.toTranslations(
                        {
                            fr: 'french_name',
                            es: 'spanish_name',
                        },
                        {
                            fr: 'french_description',
                            es: 'spanish_description',
                        },
                    );

                    expect(translations.length).toEqual(1);
                    expect(translations[0].language).toEqual('fr');
                    expect(translations[0].translationName).toEqual('french_name');
                    expect(translations[0].translationDesc).toEqual('french_description');
                });
            });
        });

        describe('and there is an entry in prefLabel that has no match in definition', () => {
            test('it should return translations that includes a translation for that extra entry in prefLabel with only the language and name populated.', () => {
                const translations = jsonLdToModel.toTranslations(
                    {
                        fr: 'french_name',
                        es: 'spanish_name',
                    },
                    {
                        fr: 'french_description',
                    },
                );

                expect(translations.length).toEqual(1);
                expect(translations[0].language).toEqual('fr');
                expect(translations[0].translationName).toEqual('french_name');
                expect(translations[0].translationDesc).toBeUndefined();
            });
        });

        describe('and there is an entry in definition that has no match in prefLabel', () => {
            test('it should return translations that includes a translation for that extra entry in definition with only the language and description populated.', () => {
                const translations = jsonLdToModel.toTranslations(
                    {
                        fr: 'french_name',
                    },
                    {
                        fr: 'french_description',
                        es: 'spanish_description',
                    },
                );

                expect(translations.length).toEqual(1);
                expect(translations[0].language).toEqual('fr');
                expect(translations[0].translationName).toBeUndefined();
                expect(translations[0].translationDesc).toEqual('french_description');
            });
        });
    });
});

describe('JsonLdToModel#toSchema', () => {
    describe('if there are both a schema and an inlineSchema', () => {
        test('it should throw an error', () => {
            let error;
            let schema;
            try {
                schema = jsonLdToModel.toSchema('http://path/to/iri', '{ \'type\': \'object\'}');
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Cannot have both an inlineSchema a schema property in the same concept/);
        });
    });

    describe('if there is only a schema', () => {
        test('it should return an object with a schemaString property.', () => {
            const schema = jsonLdToModel.toSchema(undefined, '{ \'type\': \'object\'}');

            expect(schema.schemaString).toEqual('{ \'type\': \'object\'}');
        });
    });

    describe('if there is only an inlineSchema', () => {
        test('it should return an object with an inlineSchema property.', () => {
            const schema = jsonLdToModel.toSchema('http://path/to/iri', undefined);

            expect(schema.inlineSchema).toEqual('http://path/to/iri');
        });
    });
});

describe('JsonLdToModel#toDeprecated', () => {
    describe('if deprecated is true', () => {
        test('it should return a conceptModel with isDeprecated equal to true', async () => {
            const isDeprecated = jsonLdToModel.toIsDeprecated('true');

            expect(isDeprecated).toBeTruthy();
        });
    });

    describe('if deprecated is false', () => {
        test('it should return a conceptModel with isDeprecated equal to false', async () => {
            const isDeprecated = jsonLdToModel.toIsDeprecated('false');

            expect(isDeprecated).toBeFalsy();
        });
    });

    describe('if deprecated does not exist', () => {
        test('it should return a conceptModel with isDeprecated equal to false', async () => {
            const isDeprecated = jsonLdToModel.toIsDeprecated();

            expect(isDeprecated).toBeFalsy();
        });
    });

    describe('if deprecated is an invalid value', () => {
        test('it should throw an error.', async () => {
            let isDeprecated;
            let error;
            try {
                isDeprecated = jsonLdToModel.toIsDeprecated('invalid_value');
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/invalid_value is not a valid value for deprecated/);
        });
    });
});

describe('JsonLdToModel#toActivityDefinition', () => {
    describe('if there an activityDefinition exists', () => {
        describe('and the type is not http://adlnet.gov/expapi/activities/cmi.interaction', () => {
            describe('and there are not intereaction type activity related properties', () => {
                test('it should return an object with the correct activityType properties and values.', () => {
                    const activityDefinition = jsonLdToModel.toActivityDefinition({
                        '@context': 'some_context',
                        name: { en: 'activity1_name' },
                        description: { en: 'activity1_description' },
                        type: 'some_activity_type',
                        moreInfo: 'some_more_info',
                        extensions: { extension1: 'some_extension_iri' },
                    });

                    expect(activityDefinition.contextIri).toEqual('some_context');
                    expect(activityDefinition.name).toEqual('activity1_name');
                    expect(activityDefinition.description).toEqual('activity1_description');
                    expect(activityDefinition.activityType).toEqual('some_activity_type');
                    expect(activityDefinition.extensions.extension1).toEqual('some_extension_iri');
                    expect(activityDefinition.moreInformation).toEqual('some_more_info');
                });
            });
        });
    });
    describe('if there is no activityDefinition', () => {
        test('it should throw an error.', () => {
            let error;
            try {
                const activityDefinition = jsonLdToModel.toActivityDefinition();
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Concept is missing an activityDefinition property/);
        });
    });

    describe('if there is an empty activityDefinition other than a @context', () => {
        test('it should throw and error.', () => {
            let error;
            try {
                const activityDefinition = jsonLdToModel.toActivityDefinition({});
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Concept activityDefinition property is missing the @context property/);

            try {
                const activityDefinition = jsonLdToModel.toActivityDefinition({
                    '@context': 'some_context',
                });
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Concept has an empty activityDefinition property/);
        });
    });
});

describe('JsonLdToModel#toInteractionActivities', () => {
    let activityDefinition = {};
    describe('the activity type is not http://adlnet.gov/expapi/activities/cmi.interaction', () => {
        beforeEach(() => { activityDefinition.type = 'some_other_type'; });

        describe('and there are not any interaction activities', () => {
            test('it should return an empty object.', () => {
                const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);

                expect(interactionActivities).toEqual({});
            });
        });

        describe('and there are interaction activities', () => {
            test('it should throw an error.', () => {
                activityDefinition.interactionType = 'true-false';
                let error;
                try {
                    const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/Interaction Activity properties are populated but the activity type of this concept is not cmi.interaction/);
            });
        });
    });

    describe('the activity type is http://adlnet.gov/expapi/activities/cmi.interaction', () => {
        beforeEach(() => { activityDefinition = { type: 'http://adlnet.gov/expapi/activities/cmi.interaction' }; });

        describe('and there is no interactionType', () => {
            test('it should throw an error.', () => {
                let error;
                try {
                    const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/The activity type is cmi.interaction but there is no interactionType/);
            });
        });

        describe('and there is an invalid interactionType', () => {
            test('it should throw an error.', () => {
                activityDefinition.interactionType = 'invalid_type';
                let error;
                try {
                    const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);
                } catch (err) {
                    error = err.message;
                }

                expect(error).toMatch(/invalid_type is not a valid interactionType/);
            });
        });

        describe('and interactionType does not support a component list', () => {
            beforeEach(() => {
                activityDefinition.interactionType = 'true-false';
                activityDefinition.correctResponsesPattern = ['true'];
            });

            describe('and one or more of the supported interaction component properties are populated', () => {
                test('it should throw an error.', () => {
                    activityDefinition.scale = [{ id: 'likert_0' }];
                    let error;
                    try {
                        const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/There are interaction component lists populated that do not support interactionType true-false/);
                });
            });

            describe('and none of the supported interaction component properties are populated.', () => {
                test('it should return a concept model with the correct values.', () => {
                    const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);

                    expect(interactionActivities.interactionType).toEqual('true-false');
                    expect(interactionActivities.correctResponsesPattern).toEqual(['true']);
                });
            });
        });

        describe('and interactionType is `choice` or `sequencing`', () => {
            beforeEach(() => {
                activityDefinition.interactionType = 'sequencing';
                activityDefinition.correctResponsesPattern = ['golf[,]tetris'];
            });

            describe('and a supported interaction component list other than `choices` is populated', () => {
                test('it should throw an error.', () => {
                    activityDefinition.scale = [{ id: 'likert_0' }];

                    let error;
                    try {
                        const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/There are interaction component lists populated that do not support interactionType sequencing/);
                });
            });

            describe('and only the `choices` supported interaction component list is populated.', () => {
                test('it should return a concept model with the correct values.', () => {
                    activityDefinition.choices = [{ id: 'golf' }, { id: 'tetris' }, { id: 'chocolate' }];

                    const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);

                    expect(interactionActivities.interactionType).toEqual('sequencing');
                    expect(interactionActivities.correctResponsesPattern).toStrictEqual(['golf[,]tetris']);
                    expect(interactionActivities.choices).toStrictEqual([{ id: 'golf' }, { id: 'tetris' }, { id: 'chocolate' }]);
                });
            });
        });

        describe('and interactionType is `matching`', () => {
            beforeEach(() => {
                activityDefinition.interactionType = 'matching';
                activityDefinition.correctResponsesPattern = ['ben[.]3[,]chris[.]2[,]troy[.]4'];
            });

            describe('and a supported interaction component list other than `source` or `target` is populated', () => {
                test('it should throw an error.', () => {
                    activityDefinition.scale = [{ id: 'likert_0' }];

                    let error;
                    try {
                        const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/There are interaction component lists populated that do not support interactionType matching/);
                });
            });

            describe('and only the `source` or `target` supported interaction component lists are populated.', () => {
                test('it should return a concept model with the correct values.', () => {
                    activityDefinition.source = [{ id: 'ben' }, { id: 'chris' }, { id: 'troy' }];
                    activityDefinition.target = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];

                    const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);

                    expect(interactionActivities.interactionType).toEqual('matching');
                    expect(interactionActivities.correctResponsesPattern).toStrictEqual(['ben[.]3[,]chris[.]2[,]troy[.]4']);
                    expect(interactionActivities.source).toStrictEqual([{ id: 'ben' }, { id: 'chris' }, { id: 'troy' }]);
                    expect(interactionActivities.target).toStrictEqual([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
                });
            });
        });

        describe('and interactionType is `performance`', () => {
            beforeEach(() => {
                activityDefinition.interactionType = 'performance';
                activityDefinition.correctResponsesPattern = ['pong[.]1:[,]dg[.]:10[,]lunch[.]'];
            });

            describe('and a supported interaction component list other than `steps` is populated', () => {
                test('it should throw an error.', () => {
                    activityDefinition.scale = [{ id: 'likert_0' }];

                    let error;
                    try {
                        const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/There are interaction component lists populated that do not support interactionType performance/);
                });
            });

            describe('and only the `steps` supported interaction component list is populated.', () => {
                test('it should return a concept model with the correct values.', () => {
                    activityDefinition.steps = [{ id: 'pong' }, { id: 'dg' }, { id: 'lunch' }];

                    const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);

                    expect(interactionActivities.interactionType).toEqual('performance');
                    expect(interactionActivities.correctResponsesPattern).toStrictEqual(['pong[.]1:[,]dg[.]:10[,]lunch[.]']);
                    expect(interactionActivities.steps).toStrictEqual([{ id: 'pong' }, { id: 'dg' }, { id: 'lunch' }]);
                });
            });
        });

        describe('and interactionType is `likert`', () => {
            beforeEach(() => {
                activityDefinition.interactionType = 'likert';
                activityDefinition.correctResponsesPattern = ['likert_3'];
            });

            describe('and a supported interaction component list other than `scale` is populated', () => {
                test('it should throw an error.', () => {
                    activityDefinition.steps = [{ id: 'pong' }, { id: 'dg' }, { id: 'lunch' }];

                    let error;
                    try {
                        const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);
                    } catch (err) {
                        error = err.message;
                    }

                    expect(error).toMatch(/There are interaction component lists populated that do not support interactionType likert/);
                });
            });

            describe('and only the `scale` supported interaction component list is populated.', () => {
                test('it should return a concept model with the correct values.', () => {
                    activityDefinition.scale = [{ id: 'likert_1' }, { id: 'likert_2' }, { id: 'likert_3' }];

                    const interactionActivities = jsonLdToModel.toInteractionActivities(activityDefinition);

                    expect(interactionActivities.interactionType).toEqual('likert');
                    expect(interactionActivities.correctResponsesPattern).toStrictEqual(['likert_3']);
                    expect(interactionActivities.scale).toStrictEqual([{ id: 'likert_1' }, { id: 'likert_2' }, { id: 'likert_3' }]);
                });
            });
        });
    });
});

describe('JsonLdToModel#toPatternType', () => {
    let patternDocument;
    beforeEach(() => {
        patternDocument = { id: 'pattern1_id' };
    });

    describe('if there are not at least one of `alternates`, `optional`, `oneOrMore`, `sequence`, and `zeroOrMore`', () => {
        test('it should throw an error.', async () => {
            let error;
            try {
                const type = jsonLdToModel.toPatternType(patternDocument);
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Pattern pattern1_id must have at least one of alternates, optional, oneOrMore, sequence, and zeroOrMore/);
        });
    });

    describe('if there are more than one of `alternates`, `optional`, `oneOrMore`, `sequence`, and `zeroOrMore`', () => {
        test('it should throw an error.', async () => {
            patternDocument.zeroOrMore = 'pattern2_id';
            patternDocument.alternates = ['pattern3_id'];
            let error;
            try {
                const type = jsonLdToModel.toPatternType(patternDocument);
            } catch (err) {
                error = err.message;
            }

            expect(error).toMatch(/Pattern pattern1_id must not have more than one of alternates, optional, oneOrMore, sequence, and zeroOrMore/);
        });
    });

    describe('if there is exactly one of `alternates`, `optional`, `oneOrMore`, `sequence`, and `zeroOrMore`', () => {
        test('it should return that type.', async () => {
            patternDocument.zeroOrMore = 'pattern2_id';

            const type = jsonLdToModel.toPatternType(patternDocument);


            expect(type).toEqual('zeroOrMore');
        });
    });
});
