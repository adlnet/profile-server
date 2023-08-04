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
/**
 * Middleware added to routes that require a logged in user. Will
 * look for a user in req.user.
 */
const permissions = require("./permissions");

const mustBeLoggedIn = function(req, res, next) {
    if (!req.user) {
        return res.status(401).send({
            success: false,
            message: 'Must be logged in',
        });
    }
    next();
};

const mustBeSiteAdmin = function(req, res, next) {
    if (!req.user || req.user.type !== 'admin') { return next('Permission Denied'); }
    next();
};

const mustBeOrgAdmin = function() {
    return permissions("resource", ["admin"]);
};

const doesUserBelongToOrg = async function(user, orgUUID) {
    if (!user)
        return false;

    if (user.type === 'admin')        
        return true;

    return false;
}

module.exports = {
    mustBeLoggedIn,
    mustBeSiteAdmin,
    mustBeOrgAdmin
}
