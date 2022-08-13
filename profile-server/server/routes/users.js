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
const users = Express.Router();
const controller = require('../controllers/users');

const validate = require('../utils/validator');
const createAccount = require('../schema/createAccount');
const login = require('../schema/login');
const captcha = require("./captcha");

users.get('/status', controller.status);
users.get('/salt', controller.salt);
users.post('/login', validate(login), controller.login);
users.post('/create', captcha.checkCaptcha(), validate(createAccount), controller.createUser);
users.post('/logout', controller.logout);

users.post('/forgot', captcha.checkCaptcha(), controller.forgotPassword);
users.post('/reset', controller.resetPassword);
users.get('/checkResetKey', controller.checkResetKey);


function blockTypeManipulation(req, res, next) {
    delete req.body.type;
    delete req.body.admin;
    next();
}

users.post('/update', blockTypeManipulation, controller.editAccount);
const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const hooks = require('./hooks');
const Hook = require('../ODM/models').hook;


users.use('/hooks', mustBeLoggedIn, hooks);

module.exports = users;


