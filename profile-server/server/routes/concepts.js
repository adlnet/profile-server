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
const concepts = Express.Router({ mergeParams: true });
const controller = require('../controllers/concepts');
const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const permissions = require('../utils/permissions');
const deny = require('../utils/deny');

const lock = require('../utils/lock');
const unlock = require('../utils/unlock');

const Concept = require('../ODM/models').concept;

const permissionStack = [
    mustBeLoggedIn,
    getResource(Concept, 'concept', 'uuid'),
    permissions(),
    deny,
];

concepts.get('/', controller.getConcepts);
concepts.post('/', controller.createConcept);

concepts.delete('/link/:concept', ...permissionStack, lock(true), controller.unlinkConceptReq);

concepts.get('/:concept/lock', ...permissionStack, lock());
concepts.get('/:concept/unlock', ...permissionStack, unlock());
concepts.post('/:concept/claim', ...permissionStack, lock(true), controller.claimConcept);

concepts.get('/:concept', controller.getConcept);
concepts.put('/:concept', ...permissionStack, unlock(true), controller.updateConcept);
concepts.delete('/:concept', ...permissionStack, lock(true), controller.deleteConcept);

module.exports = concepts;
