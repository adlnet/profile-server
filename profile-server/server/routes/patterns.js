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
const Express = require('express');
const patterns = Express.Router({ mergeParams: true });
const controller = require('../controllers/patterns');

const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const permissions = require('../utils/permissions');
const deny = require('../utils/deny');

const Pattern = require('../ODM/models').pattern;
const lock = require('../utils/lock');
const unlock = require('../utils/unlock');
const permissionStack = [
    mustBeLoggedIn,
    getResource(Pattern, 'pattern', 'uuid'),
    permissions(),
    deny,
];

patterns.get('/', controller.getPatterns);
patterns.post('/', controller.createPattern);

patterns.get('/:pattern/lock', ...permissionStack, lock());
patterns.get('/:pattern/unlock', ...permissionStack, unlock());

patterns.get('/:pattern', controller.getPattern);
patterns.put('/:pattern', ...permissionStack, unlock(true), controller.updatePattern);
patterns.delete('/:pattern', ...permissionStack, lock(true), controller.deletePattern);

module.exports = patterns;
