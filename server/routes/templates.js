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
const templates = Express.Router({ mergeParams: true });
const controller = require('../controllers/templates');

const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const permissions = require('../utils/permissions');
const deny = require('../utils/deny');
const lock = require('../utils/lock');
const unlock = require('../utils/unlock');

const Template = require('../ODM/models').template;

const permissionStack = [
    mustBeLoggedIn,
    getResource(Template, 'template', 'uuid'),
    permissions(),
    deny,
];


templates.get('/', controller.getTemplates);
templates.post('/', controller.createTemplate);

templates.get('/:template/lock', ...permissionStack, lock());
templates.get('/:template/unlock', ...permissionStack, unlock());


templates.get('/:template', ...permissionStack, controller.getTemplate);
templates.put('/:template', ...permissionStack, unlock(true), controller.updateTemplate);
templates.delete('/:template', ...permissionStack, lock(true), controller.deleteTemplate);

module.exports = templates;
