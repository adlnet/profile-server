/** ***********************************************************************
*
* Veracity Technology Consultants CONFIDENTIAL
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
const concept = require('./concept');
const organization = require('./organization');
const pattern = require('./pattern');
const template = require('./template');
const profile = require('./profile');
const user = require('./user');

const mongoose = require('mongoose');

module.exports = {
    concept: mongoose.model('concept', concept),
    organization: mongoose.model('organization', organization),
    pattern: mongoose.model('pattern', pattern),
    template: mongoose.model('template', template),
    profile: mongoose.model('profile', profile),
    user: mongoose.model('user', user),
};
