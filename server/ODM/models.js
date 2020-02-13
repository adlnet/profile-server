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
