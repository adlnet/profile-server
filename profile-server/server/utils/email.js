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

const config = process.env;
const Mustache = require('mustache');

const templateCache = {};
const fs = require('fs');
// these can fail to require in the build when there is no .env, preventing configure from running

templateCache.verifyEmail = fs.readFileSync(__dirname + '/emails/verifyEmail.html.txt', 'utf8');
templateCache.forgotPassword = fs.readFileSync(__dirname + '/emails/forgotPassword.html.txt', 'utf8');
templateCache.profileVerificationStatus = fs.readFileSync(__dirname + '/emails/profileVerificationStatus.html.txt', 'utf8');


for (const i in templateCache) {
    Mustache.parse(templateCache[i]);
}

const nodemailer = require('nodemailer');

//const transporter = nodemailer.createTransport(`smtps://${encodeURIComponent(config.email_user)}:${encodeURIComponent(config.email_pass)}@${config.email_server}`);
const transporter = nodemailer.createTransport({
    host: config.email_server, // Office 365 server
    port: 587,     // secure SMTP,
    secure: false,
    requireTLS: true,
    auth: {
        user: config.email_user,
        pass: config.email_pass
    }
});

/**
 * Sends email
 * @param {object} mailOptions options to configure sending an email
 */
function send(mailOptions) {
    console.log(mailOptions);
    return new Promise((res, rej) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                
                //console.log("Email server: " + config.email_server);

                rej(error);
                return;
            }
            res();
        });
    });
}
// just logging to the console for now, need to get actual email hooked up
/**
 * Sends a 'forgot email' with a temporary password
 * @param {User} user User model
 * @param {function} done callback, not used
 */
exports.sendForgotPasswordEmail = function (user, done) {
    console.log("The user's password reset key is ", user.passwordResetKey);

    const message = Mustache.render(templateCache.forgotPassword, {
        fullname: user.fullname,
        email: user.email,
        reset_url: config.clientURL + '/user/resetpassword?key=' + user.passwordResetKey,
    });

    const mailOptions = {
        from: config.system_email_from, // sender address
        to: user.email, // list of receivers
        subject: 'Password Reset Request', // Subject line
        text: message, // plaintext body
        html: message, // html body
    };


    send(mailOptions);
};

/**
 * Sends administrator an email to approve new user
 * @param {User} user User model
 * @param {function} done callback, not used
 */
exports.sendAccountValidateEmail = function (user, done) {
    console.log("The user's verification key is ", user.verifyCode);

    const message = Mustache.render(templateCache.verifyEmail, {
        fullname: user.fullname,
        email: user.email,
        verify_url: `${config.verify_url}${user.verifyCode}`,
        verify_url_base: config.verify_url,
        verify_code: user.verifyCode,
    });

    const mailOptions = {
        from: config.system_email_from, // sender address
        to: user.email, // list of receivers
        subject: 'Verify Email Account', // Subject line
        text: message, // plaintext body
        html: message, // html body
    };

    send(mailOptions);
};

/**
 * Sends an email to the user who requested their profile be verified
 * about the result of the verification review.
 *
 * @param {profileVersionModel} profileVersion the profile version
 */
exports.sendProfileVerificationResponse = function (profileVersion, revoked) {
    console.log(`${profileVersion.name} v ${profileVersion.version} was ${profileVersion.isVerified ? 'verified' : revoked ? 'revoked' : 'denied'}`);
    const user = profileVersion.verificationRequestedBy;
    // debugger;
    let reason;
    if (!profileVersion.isVerified) {
        reason = { text: profileVersion.verificationDenyReason };
    }

    const message = Mustache.render(templateCache.profileVerificationStatus, {
        email: user.email,
        profilename: profileVersion.name,
        profileversion: profileVersion.version,
        approvalstatus: profileVersion.isVerified ? 'approved' : revoked ? 'revoked' : 'denied',
        reason: reason,
    });

    const mailOptions = {
        from: config.system_email_from, // sender address
        to: user.email, // list of receivers
        subject: `Your profile verification request has been ${profileVersion.isVerified ? 'approved' : revoked ? 'revoked' : 'denied'}`, // Subject line
        text: message, // plaintext body
        html: message, // html body
    };

    send(mailOptions);
};
