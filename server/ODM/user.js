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
const mongoose = require('mongoose');
const hashPassword = require('../utils/hashPassword');
const crypto = require('crypto');


const userSchema = mongoose.Schema(
    {
        username: String,
        passwordHash: String,
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        verifiedEmail: Boolean,
        salt: String,
        verifyCode: String,
        passwordResetKey: String,
        oldpasswords: [String],
        oldsalt: [String],
        lastLogin: Date,
        lastLoginIp: String,
        uuid: {
            type: String,
            unique: true,
        },
        _modified: Number,
        _created: Number,
        type: {
            type: String,
            default: 'user',
        },
    },
    {
        usePushEach: true,
    },
);




userSchema.methods.checkPassword = function(plaintext) {
    const testhash = hashPassword(this.username, this.salt, plaintext);

    if (this.passwordHash === testhash || this.passwordHash === plaintext) {
        return true;
    }
    return false;
};


userSchema.methods.checkResetKey = function(plaintext, keyFromSession) {
    if (keyFromSession) {
        // NOTE. We store the plaintext of the reset key. Should we hash it? If we do, we can't tell the user what it was manually
        if (keyFromSession === plaintext || plaintext == hashPassword(this.email, this.salt, keyFromSession)) {
            return true;
        }
    } else if (this.passwordResetKey) {
        if (this.passwordResetKey === plaintext || plaintext == hashPassword(this.email, this.salt, this.passwordResetKey)) {
            return true;
        }
    }
    return false;
};

userSchema.methods.forgotPassword = function(plaintext) {
    this.passwordResetKey = crypto.randomBytes(16).toString('hex');
    return this.save();
};

userSchema.methods.resetPassword = function(plaintext, ignoreHistory = false) {
    if (!ignoreHistory) {
        this.oldpasswords.push(this.passwordHash);
    }

    if (!ignoreHistory && this.oldpasswords.length > 5) {
        this.oldpasswords = this.oldpasswords.slice(this.oldpasswords.length - 5);
    }
    this.passwordHash = hashPassword(this.username, this.salt, plaintext);
    console.log('newHash: ' + this.passwordHash);
    console.log('from input: ' + plaintext);
    if (!ignoreHistory) {
        for (let i = 0; i < this.oldpasswords.length; i++) {
            if (this.oldpasswords[i]) if (this.oldpasswords[i] === hashPassword(this.username, this.salt, plaintext)) throw new Error('This password has been used recently. Please choose a new password.');
        }
    }
    // NOTE: we reset this to an unguessable number, rather then null or undefined as you might expect
    // this is because there is a greater risk of a bug allowing null or undefined to be submitted as the password at login
    // which would then look like a correct reset attempt. (becasue the user logged in with the temp reset key, which was null)
    // this is much safer, as no bug is going to accidently send this exact value
    this.passwordResetKey = crypto.randomBytes(16).toString('hex');
    return this.save();
};

userSchema.pre('save', function(next) {
    // do stuff
    this._modified = Date.now();
    if (!this._created) this._created = Date.now();
    next();
});

module.exports = userSchema;
