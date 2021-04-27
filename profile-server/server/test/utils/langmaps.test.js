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
const langmaps = require('../../utils/langmaps');

const name = 'tom';
const description = 'is cool';
const translations = [
    {
        language: 'fr',
        translationDesc: null,
        translationName: 'je suis tom',
    },
    {
        language: 'fr',
        translationDesc: 'est trop cool',
        translationName: null,
    },
];

test('name should work', () => {
    expect(langmaps.prefLabel(name, translations)).toStrictEqual({ en: 'tom', fr: 'je suis tom' });
});

test('desc should work', () => {
    expect(langmaps.definition(description, translations)).toStrictEqual({ en: 'is cool', fr: 'est trop cool' });
});

