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
const expressRateLimit = require("express-rate-limit").default;
const users = Express.Router();
const controller = require('../controllers/users');

const validate = require('../utils/validator');
const createAccount = require('../schema/createAccount');
const login = require('../schema/login');
const captcha = require("./captcha");
const mustBeLoggedIn = require('../utils/mustBeLoggedIn');
const getResource = require('../utils/getResource');
const ValidationError = require("../errorTypes/validationError");

const validationRateLimiter = expressRateLimit({
    windowMs: 1000 * 60 * 5, // 5 Minutes
    max: 3,
    handler: async(req, res, next, options) => {
        res.status(400).send({
            success: false,
            message: "This endpoint is rate limited, please wait a few minutes before trying again.",
        });
    },
    standardHeaders: true,
    legacyHeaders: false
});

users.get('/status', controller.status);
users.get('/salt', controller.salt);
users.post('/login', validate(login), controller.login);
users.post('/create', captcha.checkCaptcha(), validate(createAccount), controller.createUser);
users.post('/logout', controller.logout);

users.post('/forgot', captcha.checkCaptcha(), controller.forgotPassword);
users.post('/reset', controller.resetPassword);
users.get('/checkResetKey', controller.checkResetKey);

users.get('/validate/:code', validationRateLimiter, controller.validateEmailWithLink);
users.post('/validate', validationRateLimiter, controller.validateEmail);
users.post('/resendValidation', captcha.checkCaptcha(), controller.resendValidation);

users.post('/username', mustBeLoggedIn, captcha.checkCaptcha(), controller.setUsername);

function blockTypeManipulation(req, res, next) {
    delete req.body.type;
    delete req.body.admin;
    delete req.body.username;
    delete req.body.usernameChosen;
    delete req.body.verifyCode;
    delete req.body.verifiedEmail;
    next();
}

users.post('/update', blockTypeManipulation, controller.editAccount);
const hooks = require('./hooks');
const Hook = require('../ODM/models').hook;

users.use('/hooks', mustBeLoggedIn, hooks);

module.exports = users;


