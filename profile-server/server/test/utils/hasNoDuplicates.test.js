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
const hasNoDuplicates = require('../../utils/hasNoDuplicates');

describe('#hasNoDuplicates', () => {
    describe('when the array contains numbers', () => {
        describe('if it not contain duplicates', () => {
            test('it should return the array.', () => {
                const testArray = [1, 2, 3, 4];

                expect(hasNoDuplicates(testArray)).toBeTruthy();
            });
        });

        describe('if it contains duplicates', () => {
            test('it should return false.', () => {
                const testArray = [1, 2, 2, 4];

                expect(hasNoDuplicates(testArray)).toBeFalsy();
            });
        });
    });

    describe('when the array contains strings', () => {
        describe('when the array contains strings', () => {
            describe('if it does not contain duplicates', () => {
                test('it should return the array.', () => {
                    const testArray = ['a', 'b', 'c', 'd'];

                    expect(hasNoDuplicates(testArray)).toBeTruthy();
                });
            });

            describe('if it contains duplicates', () => {
                test('it should return false.', () => {
                    const testArray = ['a', 'b', 'b', 'd'];

                    expect(hasNoDuplicates(testArray)).toBeFalsy();
                });
            });
        });
    });
});
