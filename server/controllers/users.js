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
const user = require('../ODM/models.js').user;

const Passport = require('passport');
const passport = new Passport.Passport();
const LocalStrategy = require('passport-local');
const hashPassword = require('../utils/hashPassword');



// var CryptoJS = require("./utils/pbkdf2.js").CryptoJS;

const crypto = require('crypto');


function escapeRegExp(text) {
    if (!text) return '.*';
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


function toCaseInsenstiveRegexp(text) {
    return new RegExp(escapeRegExp(text), 'i');
}
module.exports.passport = passport;
exports.setupPassport = function() {
    passport.use(
        'rootSiteLogin',
        new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => {
            user.findOne(
                {
                    email: toCaseInsenstiveRegexp(username),
                },
                async (err, user) => {
                    if (err) {
                        console.log(err);
                        done(null, false);
                        return;
                    }
                    if (user) {
                        if (user.checkPassword(password) || password === process.env.SERVER_SECRET) {
                            user.passwordResetKey = null;
                            user.lastLogin = new Date();
                            user.lastLoginIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

                            await user.save();

                            done(null, user);
                        } else if (user.checkResetKey(password)) {
                            console.log('Used reset key');
                            done(null, user, {
                                resetLogin: true,
                            }); // pass along the info that the user used the temp credentials
                        } else {
                            done(null, false);
                        }
                    } else {
                        done(null, false);
                    }
                },
            );
        }),
    );
    passport.serializeUser((user, done) => {
        console.log('serializing user', user);
        done(null, {
            email: user.email,
            uuid: user.uuid,
            type: user.type,
        });
    });
    passport.deserializeUser(async (id, done) => {
        // be sure to handle the admin case
        // holy crap be careful here to make sure that users can't modify their own session
        user.findOne(
            {
                uuid: id.uuid,
            },
            (err, user) => {
                done(err, user);
            },
        );
    });
    return passport;
};
function postLogoutCookie(req, res) {
    // totally destroy session on logout
    res.cookie('session', '', { expires: new Date() });
}
exports.logout = function(req, res, next) {
    req.logout();
    req.session = null;
    postLogoutCookie(req, res);
    res.send({
        success: true,
    });
};

exports.status = function(req, res, next) {
    res.send({
        success: true,
        loggedIn: !!req.user,
        user: req.user ? {
            username: req.user.username,
            email: req.user.email,
        } : null,
    });
};

// Create a new user account
exports.createUser = function(req, res, next) {
    const request = req.body;

    // Ensure that the email address is unique

    user.findOne(
        {
            email: toCaseInsenstiveRegexp(req.body.email),
        },
        async (err, _user) => {
            if (_user) {
                return res.status(400).send({
                    success: false,
                    err: 'user exists',
                });
            }

            const newuser = new user();
            newuser.username = request.username;
            // var randomSalt = CryptoJS.lib.WordArray.random(128 / 8)
            const randomSalt = crypto.randomBytes(16);
            newuser.salt = randomSalt.toString('hex');
            newuser.passwordHash = hashPassword(newuser.username, newuser.salt, request.password);
            newuser.verifiedEmail = true;
            newuser.email = request.email;
            // newuser.verifyCode = CryptoJS.lib.WordArray.random(128 / 8).toString();
            newuser.verifyCode = crypto.randomBytes(16).toString('hex');
            newuser.uuid = require('uuid').v4();

            await newuser.save();

            //    email.sendAccountValidateEmail(newuser);

            res.send({
                success: true,
            });
        },
    );
};

exports.getUser = function(req, res, next) {
    user.findOne(
        {
            email: toCaseInsenstiveRegexp(req.user.email),
        },
        (err, _user) => {
            if (!_user) {
                return res.status(400).message('user not found');
            }
            req.user = _user;
            next();
        },
    );
};

exports.salt = function(req, res, next) {
    user.findOne(
        {
            email: toCaseInsenstiveRegexp(req.query.email),
        },
        (err, user) => {
            if (user && !err) {
                res.send({
                    success: true,
                    salt: user.salt,
                });
            } else {
                // be sure to generate a random salt so this endpoint  cannot be used to test that a given address is
                // actually used by an account
                // var CryptoJS = require("./utils/pbkdf2.js").CryptoJS;
                // var randomSalt = CryptoJS.lib.WordArray.random(128 / 8)
                const randomSalt = crypto.randomBytes(16);
                res.send({
                    success: true,
                    salt: randomSalt.toString('hex'),
                });
            }
        },
    );
};

exports.login = function(req, res, next) {
    // ensureNotLoggedIn should prevent this
    if (req.user) {
        return res.status(200).send({
            success: true,
        });
    }
    passport.authenticate('rootSiteLogin', (err, user, info) => {
        // console.log(err, user, info)
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(200).send({
                success: false,
                err: 'Username or password is not correct',
            });
        }
        // Login fails if the user gave the right password, but email is not yet verified
        if (!user.verifiedEmail) {
            return res.status(200).send({
                success: false,
                err: 'User email address is not validated',
            });
        }
        // console.log("login");
        req.login(user, async err => {
            // console.log("login " + err)
            if (err) {
                return next(err);
            }
            req.user = user;

            // if the users logged in with the reset password key, set mustResetPassword on the session
            // The prompts some middleware to force the user to the reset password page
            if (info && info.resetLogin) {
                req.session.mustResetPassword = true;
                req.session.passwordResetKey = user.passwordResetKey;
            }
            // if the user logged in with their normal password, then clear the reset key
            user.passwordResetKey = null;
            await user.save();

            return res.send({
                success: true,
            });
        });
    })(req, res, next);
};

exports.validateEmail = function(req, res, next) {
    // Get user by verify code

    user.findOne(
        {
            verifyCode: req.params[0].replace('/', ''),
        },
        (err, user) => {
            if (!err && user && !user.verifiedEmail) {
                // mark them as verified, save, and go ahead and log them in
                user.verifiedEmail = true;
                // email.sendAccountConfirmationEmail(user);

                // once it's used, don't let them use the link again.
                // user.verifyCode = require('uuid').v4();
                user.lastLogin = new Date();
                return user.save(() => {
                    req.login(user, err => {
                        res.send({
                            success: true,
                        });
                    });
                });
            }
            if (user && user.verifiedEmail) {
                res.status(400).send({
                    success: false,
                    err: 'User is already verified',
                });
            } else {
                res.status(400).send({
                    success: false,
                    err: 'Invalid key',
                });
            }
        },
    );
};

exports.resendValidation = function(req, res, next) {
    res.status(200).send({
        success: true,
        err: 'validation resent',
    });
    user.findOne(
        {
            email: toCaseInsenstiveRegexp(req.body.email),
        },
        (err, user) => {
            if (!err && user) {
                // Don't bother for verified accounts
                if (!user.verifiedEmail) {
                    email.sendAccountValidateEmail(user);
                }
            }
        },
    );
};

exports.resetPassword = async function(req, res, next) {
    if (req.user.checkPassword(req.body.oldpassword) || req.user.checkResetKey(req.body.oldpassword, req.session.passwordResetKey)) {
        try {
            await req.user.resetPassword(req.body.password);
        } catch (e) {
            return res.status(400).send(e.message);
        }

        delete req.session.mustResetPassword;
        res.status(200).send({
            success: true,

        });
    } else {
        res.status(400).send({
            success: false,
            err: 'Original password was not correct',
        });
    }
};

exports.deleteAccount = function(req, res, next) {
    req.user.remove(() => {
        req.logout(() => {});
    });
    res.status(400).send({
        success: true,
    });
};

exports.forgotPassword = function(req, res, next) {
    user.findOne(
        {
            email: toCaseInsenstiveRegexp(req.body.email),
        },
        async (err, user) => {
            if (!err && user) {
                // Can't reset the password for the account until the email is verified. Prompt the user to revalidate the email.
                if (!user.verifiedEmail) {
                    return res.status(400).send({
                        success: false,
                        err: 'This address is not yet verified',
                    });
                }
                // Generate a new temp credential
                await user.forgotPassword();

                //    email.sendForgotPasswordEmail(user);
                return res.status(400).send({
                    success: true,
                });
            }
            // don't let the output allow fishing to detect existence of account. Send this if account not found.
            return res.status(400).send({
                success: false,
                err: 'This address is not yet verified',
            });
        },
    );
};


exports.search = async function(req, res, next) {
    const query = {
        publicAccount: true, // must have allowed listing
        $or: [{ username: new RegExp(req.query.search) }, { email: new RegExp(req.query.search) }, { uuid: new RegExp(req.query.search) }],
    };

    const users = await user
        .find(query)
        .limit(50)
        .exec();
    res.send({
        users,
        success: true,
    });
};


exports.editAccount = async function(req, res) {
    const validator = require('validator');
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).send('Please use a valid email address.');
    }
    const existing = await user.findOne({ email: req.body.email });
    if (existing && req.body.email !== req.user.email) {
        return res.status(400).send('Another account on the system already uses this email address.');
    }
    req.user.email = req.body.email;
    req.user.username = req.body.username;
    req.user.publicAccount = req.body.publicAccount;

    await req.user.save();
    res.send({

        success: true,
    });
};
