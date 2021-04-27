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
const admin = Express.Router({ mergeParams: true });
const controller = require('../controllers/admin');

const mustBeLoggedIn = require('../utils/mustBeLoggedIn');

function mustBeAdmin(req, res, next) {
    if (!req.user || req.user.type !== 'admin') { return next('Permission Denied'); }
    next();
}
admin.use(mustBeLoggedIn, mustBeAdmin);
admin.get('/users', controller.getUsers);
admin.get('/user/:userId', controller.getUser);
admin.post('/user/:userId', controller.updateUser);
admin.get('/verificationRequests', controller.verificationRequests);
admin.post('/verify/:versionId', controller.verify);



module.exports = admin;
