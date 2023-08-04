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
const email = require('../utils/email.js');
const Passport = require('passport');
const passport = new Passport.Passport();
const LocalStrategy = require('passport-local');
const hashPassword = require('../utils/hashPassword');
const mongoSanitize = require('mongo-sanitize');
const ValidationError = require("../errorTypes/validationError");

const safeCompare = require('safe-compare');

// var CryptoJS = require("./utils/pbkdf2.js").CryptoJS;

const crypto = require('crypto');
const passwordValidator = require("password-validator");
const sessionHandling = require("./util/SessionHandler");
const sessionHandler = sessionHandling.getSessionHandler();

const passwordSchema = new passwordValidator();

passwordSchema
    .is().min(8)                                    
    .is().max(20)                                 
    .has().uppercase()                              
    .has().lowercase()                              
    .has().digits(1)                                
    .has().not().spaces()                           
    .is().not().oneOf([
        'password',
        'Passw0rd', 
        'Password123'
    ]); 

function doesPasswordHaveErrors(value) {
    let results = passwordSchema.validate(value, {
        details: true
    });

    if (results.length > 0) {
        let rules = results.map(result => result.message.replace("The string should have", ""));
        if (results.length == 1)
            return "Your password should have " + rules[0];

        if (results.length == 2)
            return `Your password should have ${rules[0]} and ${rules[1]}`;

        let earlyRules = rules.slice(0, -1);
        let lastRule = rules[rules.length - 1];
        let earlyBlock = earlyRules.join(", ");
        
        return `Your password should have ${earlyBlock}, and ${lastRule}`;
    }

    return undefined;
}

function isUsernameTaken(username) {
    return new Promise((resolve, reject) => {
        let usernameExpr = toCaseInsenstiveRegexp(username);
        user.findOne({ username: usernameExpr }, async (err, _user) => resolve(!!_user));
    });
}

function doesUsernameHaveErrors(value) {

    if (value == undefined) {
        return 'You must provide a username.';
    }
    
    if (typeof value != "string") {
        return 'Username must be a string.';
    }

    if (value.length < 4 || value.length > 24) {
        return 'Username must be between 4 and 24 characters.';
    }

    if (/^[a-zA-Z0-9]([\-_]*[a-zA-Z0-9])*$/g.test(value) == false) {
        return 'Username is required.  Hyphens and underscores are allowed, but not as the first or last characters.';
    }

    return undefined;
}

function escapeRegExp(text) {
    if (!text) 
        return '.*';
    else
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function toCaseInsenstiveRegexp(text) {
    return new RegExp(escapeRegExp(text), 'i');
}

module.exports.passport = passport;

exports.setupPassport = function () {
    const settings = require('../settings');

    const rootSiteConfig = { 
        passReqToCallback: true, 
        usernameField: 'email' 
    };

    const rootSiteStrategy = new LocalStrategy(rootSiteConfig, (req, email, password, done) => {
        user.findOne({ email: email }, async (err, user) => {
            if (err) {
                console.log(err);
                done(null, false);
                return;
            }
            if (user) {

                let hasCorrectPassword = user.checkPassword(password) || safeCompare(password, settings.SERVER_SECRET);
                if (hasCorrectPassword) {
                    user.passwordResetKey = null;
                    user.lastLogin = new Date();
                    user.lastLoginIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

                    await user.save();

                    sessionHandler.addToSessionMap(user.uuid, req.sessionID);

                    done(null, user);
                } 
                
                else if (user.checkResetKey(password)) {

                    sessionHandler.addToSessionMap(user.uuid, req.sessionID);

                    console.log('Used reset key');
                    done(null, user, {
                        resetLogin: true,
                    }); // pass along the info that the user used the temp credentials
                } 
                
                else {
                    done(null, false);
                }
            } 
            
            else {
                done(null, false);
            }
        });
    });

    const validationConfig = {
        passReqToCallback: true, 
        usernameField: 'validationCode',
        passwordField: 'validationCode'
    };

    const validationStrategy = new LocalStrategy(validationConfig, (req, code, _, done) => {
        user.findOne({ verifyCode: code }, async (err, user) => {
            if (err || !user) {
                console.log(err);
                done(null, false);
                return;
            }
            if (user && !user.verifiedEmail) {
                sessionHandler.addToSessionMap(user.uuid, req.sessionID);
                done(null, user);
            } 
            else {
                done(null, false);
            }
        });
    });

    passport.use('rootSiteLogin', rootSiteStrategy);
    passport.use('emailValidationLogin', validationStrategy);

    passport.serializeUser((user, done) => {
        console.log('serializing user', user);
        done(null, {
            email: user.email,
            uuid: user.uuid,
            type: user.type,
        });
    });

    passport.deserializeUser(async (id, done) => {

        console.log('deserializing user', id);
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
};

exports.logout = function (req, res, next) {

    sessionHandler.killThisSession(req, res, () => {
        res.cookie('session', '', { expires: new Date() });
        res.send({
            success: true,
        });
    });
};

exports.status = function (req, res, next) {

    let user = req.user;
    if (!user) {
        return res.send({
            success: true,
            loggedIn: false,
            user: null,
        });
    }

    let userID = req.user.uuid;
    let knownSession = sessionHandler.userHasKnownSession(userID, req.sessionID);
    if (!knownSession) {
        return sessionHandler.killThisSession(req, res, () => {
            res.send({
                success: true,
                loggedIn: false,
                user: null,
            });
        });
    }

    res.send({
        success: true,
        loggedIn: true,
        user: {
            username: req.user.username,
            usernameChosen: req.user.usernameChosen,
            fullname: `${req.user.firstname} ${req.user.lastname}`,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            email: req.user.email,
            type: req.user.type,
            uuid: req.user.uuid,
            publicizeName: req.user.publicizeName
        },
    });
};

// Create a new user account
exports.createUser = function (req, res, next) {
    const request = req.body;

    // Ensure that the email address is unique
    user.findOne(
        {
            email: toCaseInsenstiveRegexp(req.body.email),
        },
        async (err, _user) => {
            if (_user) {
                return res.status(400).send({
                    success: true,
                    err: 'Email address already associated with an account.',
                });
            }

            let usernameTaken = await isUsernameTaken(request.username);
            if (usernameTaken) {
                return res.status(400).send({
                    success: true,
                    err: "Username is taken, please choose a different one.",
                });
            }

            let weakPasswordMessage = await doesPasswordHaveErrors(request.password);
            if (weakPasswordMessage) {
                return res.status(400).send({
                    success: true,
                    err: weakPasswordMessage,
                });
            }

            let usernameError = doesUsernameHaveErrors(request.username);
            if (usernameError) {
                return res.status(400).send({
                    success: true,
                    err: usernameError,
                });
            }

            const newuser = new user();

            newuser.username = request.username;
            newuser.usernameChosen = true;
            newuser.firstname = request.firstname;
            newuser.lastname = request.lastname;

            newuser.salt = crypto.randomBytes(16).toString('hex');
            newuser.passwordHash = hashPassword(newuser.email, newuser.salt, request.password);
            
            newuser.verifiedEmail = false;
            newuser.email = request.email;

            newuser.verifyCode = crypto.randomBytes(16).toString('hex');
            newuser.uuid = require('uuid').v4();

            await newuser.save();

            email.sendAccountValidateEmail(newuser);

            res.send({
                success: true,
            });
        },
    );
};

exports.setUsername = function(req, res, next) {

    if (req.user == undefined) {
        return res.send({
            success: true,
            err: 'You do not appear to be logged in.',
        });
    }

    user.findOne(
        {
            username: toCaseInsenstiveRegexp(req.body.username),
        },
        async (err, _user) => {

            if (req.user.usernameChosen) {
                return res.status(400).send({
                    success: true,
                    err: 'You have already chosen a username.'
                });
            }

            if (_user) {
                return res.status(400).send({
                    success: true,
                    err: 'This username is already taken.',
                });
            }

            let usernameError = doesUsernameHaveErrors(req.body.username);
            if (usernameError) {
                return res.status(400).send({
                    success: true,
                    err: usernameError,
                });
            }

            req.user.username = req.body.username;
            req.user.usernameChosen = true;

            await req.user.save();

            return res.status(200).send({
                success: true,
            });
        }
    );
};

exports.getUser = function (req, res, next) {
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

exports.salt = function (req, res, next) {
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
                const randomSalt = crypto.randomBytes(16).toString('hex');
                res.send({
                    success: true,
                    salt: randomSalt,
                });
            }
        },
    );
};

exports.login = function (req, res, next) {
    // ensureNotLoggedIn should prevent this
    if (req.user) {
        return res.status(200).send({
            success: true,
        });
    }
    passport.authenticate('rootSiteLogin', (err, user, info) => {
        // console.log(err, user, info);
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(200).send({
                success: false,
                err: 'User email or password is not correct',
            });
        }
        // Login fails if the user gave the right password, but email is not yet verified
        else if (!user.verifiedEmail) {
            return res.status(200).send({
                success: false,
                err: 'User email address has not been validated',
            });
        }

        // console.log("login");
        req.login(user, async err => {

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

exports.validateEmail = function (req, res, next) {

    // Get user by verify code
    let code = req.body.validationCode;
    if (code == undefined || code == "")
        return res.send({
            success: false,
            err: 'Invalid code.',
        });

    passport.authenticate('emailValidationLogin', async(err, user, info) => {

        if (!err && user && !user.verifiedEmail) {
            
            if (err) {
                return next(err);
            }
            
            user.verifiedEmail = true;
            user.lastLogin = new Date();

            await user.save();

            req.user = user;
            
            req.login(user, async err => {

                if (err) {
                    return next(err);
                }
                req.user = user;
                
                await user.save();

                return res.send({
                    success: true,
                });
            });
        }
        else if (user && user.verifiedEmail) {
            res.status(400).send({
                success: false,
                err: 'User is already verified',
            });
        } 
        else {
            res.status(400).send({
                success: false,
                err: 'Invalid key',
            });
        }
    })(req, res, next);    
};

exports.validateEmailWithLink = function (req, res, next) {

    let code = req.params.code;
    
    req.body = {
        validationCode: code
    };

    passport.authenticate('emailValidationLogin', async(err, user, info) => {

        if (!err && user && !user.verifiedEmail) {
            
            if (err) {
                return next(err);
            }
            
            user.verifiedEmail = true;
            user.lastLogin = new Date();

            await user.save();

            return req.login(user, async(err) => {

                req.user = user;
                await req.user.save();

                res.redirect("/");
            });
        }
        else if (user && user.verifiedEmail) {
            return res.status(404).send("User already verified.");
        } else {
            return res.status(404).send("Invalid Code.");
        }
    })(req, res, next);
};

exports.resendValidation = function (req, res, next) {
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

exports.checkResetKey = async function (req, res, next) {
    const _user = await user.findOne({ passwordResetKey: req.query.key });
    if (_user) {
        res.send({
            success: true,
        });
    } else {
        res.send({
            success: false,
        });
    }
};

exports.resetPassword = async function (req, res, next) {
    const _user = await user.findOne({ passwordResetKey: req.body.key });
    if (_user) {
        try {
            await _user.resetPassword(req.body.password);
        } catch (e) {
            return res.status(200).send({
                success: false,
                message: e.message,
            });
        }

        res.status(200).send({
            success: true,
        });
    } else {
        res.status(200).send({
            success: false,
            err: 'Resetkey was unknown',
        });
    }
};

exports.deleteAccount = function (req, res, next) {
    req.user.remove(() => {
        req.logout(() => { });
    });
    res.status(400).send({
        success: true,
    });
};

exports.forgotPassword = function (req, res, next) {
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

                email.sendForgotPasswordEmail(user);
                //    email.sendForgotPasswordEmail(user);
                return res.status(200).send({
                    success: true,
                });
            }
            // don't let the output allow fishing to detect existence of account. Send this if account not found.
            return res.status(200).send({
                success: true,
            });
        },
    );
};


exports.search = async function (req, res, next) {
    const query = {
        publicAccount: true, // must have allowed listing
        $or: [{ firstname: new RegExp(req.query.search) }, { lastname: new RegExp(req.query.search) }, { email: new RegExp(req.query.search) }, { uuid: new RegExp(req.query.search) }],
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


exports.editAccount = async function (req, res) {
    try {
        const validator = require('validator');
        if (!validator.isEmail(req.body.email)) {
            return res.send({
                success: false,
                err: 'Please use a valid email address.',
            });
        }
        const existing = await user.findOne({ email: req.body.email });
        if (existing && req.body.email !== req.user.email) {
            return res.send({
                success: false,
                err: 'Another account on the system already uses this email address.',
            });
        }
        
        req.user.publicizeName = req.body.publicizeName;
        req.user.email = req.body.email;
        req.user.firstname = req.body.firstname;
        req.user.lastname = req.body.lastname;

        // Note that the user self edit path has a prefilter to remove this, 
        // so a user cannot change their own type or enable themselves to be an admin
        if (req.body.type) { 
            req.user.type = req.body.type; 
        }

        let killOtherSessions = false;
        if (req.body.password && req.body.password === req.body.password2) {
            
            let desiredPassword = req.body.password;
            let weakPasswordMessage = await doesPasswordHaveErrors(desiredPassword);
            if (weakPasswordMessage) {
                return res.status(400).send({
                    success: true,
                    err: weakPasswordMessage,
                });
            }
            
            await req.user.resetPassword(req.body.password);
            killOtherSessions = true;
        }
        await req.user.save();
        
        if (killOtherSessions) {
            sessionHandler.killOtherUserSessions(req, res, () => {
                res.send({
                    success: true,
                });
            });
        }
        else {
            res.send({
                success: true,
            });
        }

    } catch (e) {
        return res.send({
            success: false,
            err: e.message,
        });
    }
};
