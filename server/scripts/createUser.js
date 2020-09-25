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


const MongoClient = require('mongodb').MongoClient;
const colors = require('colors');
const settings = require('../settings.js');
const uuid = require('uuid');


const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.setPrompt('>');

function prompt(p, _default) {
    rl.prompt();
    return new Promise(res => {
        rl.question(colors.bgWhite(colors.black(p)) + '\n>>> ', (answer) => {
            res(answer);
        });
        if (_default !== undefined) { rl.write(_default); }
    });
}

function escapeRegExp(text) {
    if (!text) return '.*';
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function toCaseInsenstiveRegexp(text) {
    return new RegExp(escapeRegExp(text), 'i');
}

const createUser = async function (user_email, user_pass, user_type, mongoServer) {
    const mongoose = require('mongoose');
    console.prodLog('Setting up user', mongoServer);
    await mongoose.connect(mongoServer);
    const user = require('../ODM/models').user;

    const crypto = require('crypto');


    let currentUser = await user.findOne({ email: user_email });
    if (!currentUser) {
        console.prodLog('User does not exist. Creating new user');
        if (!user_pass || user_pass.length === 0) {
            console.prodLog('You should supply a password when creating a new user');
            user_pass = uuid.v4();
            console.prodLog('Generating a password. The password is ' + user_pass);
        }
        if (user_type !== 'admin' && user_type !== 'user') {
            console.prodLog('Assuming normal user type.');
            user_type = 'user';
        }
        currentUser = new user();

        // var randomSalt = CryptoJS.lib.WordArray.random(128 / 8)
        const randomSalt = crypto.randomBytes(16);
        currentUser.salt = randomSalt.toString('hex');
        currentUser.email = user_email;
        currentUser.verifiedEmail = true;
        currentUser.uuid = uuid.v4();
        // newuser.verifyCode = CryptoJS.lib.WordArray.random(128 / 8).toString();
        currentUser.verifyCode = crypto.randomBytes(16).toString('hex');
    }
    currentUser.acceptsTOS = new Date();
    if (user_pass && user_pass.length > 0) { await currentUser.resetPassword(user_pass.toString(), true); }
    if (user_type && user_type.length > 0) { currentUser.type = user_type; }
    currentUser.email = user_email;

    if (user_type) { currentUser.type = user_type; }
    await currentUser.save();
    console.prodLog('Success');
};

function request(url) {
    return new Promise((res) => {
        _request.get(url, (err, xhr, body) => {
            res({ err, body, xhr });
        });
    });
}

function connectMongo(server) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(server, (err, db) => {
            if (err) return reject(err);

            return resolve(db);
        });
    });
}


async function go() {
    try {
        await connectMongo(settings.connectionString);
    } catch (e) {
        console.prodLog('There was a problem connecting to MongoDB. Please correct this issues, and run this script again.');
        process.exit();
    }


    const options = {};
    options.user_email = await prompt('Enter the email address for the user. If this account already exists, the password will be updated');
    options.user_pass = await prompt('Enter the new password for the user.');
    options.user_type = await prompt('Enter the user type. use either "admin" or "user".');

    await createUser(options.user_email, options.user_pass, options.user_type, settings.connectionString);


    process.exit();
}

async function trygo() {
    try {
        await go();
    } catch (e) {
        console.prodLog(e);
    }
}

trygo();
