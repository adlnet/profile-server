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
const hooks = Express.Router({ mergeParams: true });
const controller = require('../controllers/hooks');

const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const permissions = require('../utils/permissions');
const deny = require('../utils/deny');

const Hook = require('../ODM/models').hook;
const lock = require('../utils/lock');
const unlock = require('../utils/unlock');

function hookOwner(req, res, next) {
    req.hook = req.resource;
    if (req.user._id.toString() !== req.hook.createdBy.toString()) {
        return res.status(401).send({
            success: false,
            message: 'Not hook owner',
        });
    }
    next();
}

const permissionStack = [
    mustBeLoggedIn,
    getResource(Hook, 'hook', 'uuid'),
    hookOwner,
];

hooks.get('/', controller.getHooks);
hooks.post('/', controller.createHook);


hooks.get('/subjects', controller.getHookSubjects);
hooks.get('/:hook', controller.getHook);
hooks.put('/:hook', ...permissionStack, controller.updateHook);
hooks.delete('/:hook', ...permissionStack, controller.deleteHook);

module.exports = hooks;
