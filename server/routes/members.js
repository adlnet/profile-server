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
const members = Express.Router({ mergeParams: true });
const controller = require('../controllers/members');

const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const permissions = require('../utils/permissions');
const level = require('../utils/level');

const Org = require('../ODM/models').organization;


const permissionStack = [
    mustBeLoggedIn,
    getResource(Org, 'org', 'uuid'),
    permissions(undefined, ['admin', 'owner']),
    level('admin'),
];



members.get('/', getResource(Org, 'org', 'uuid'), controller.getMembers);
members.post('/', ...permissionStack, controller.addMember);
members.put('/', ...permissionStack, controller.updateMember);
members.delete('/:memberId', ...permissionStack, controller.removeMember);


module.exports = members;
