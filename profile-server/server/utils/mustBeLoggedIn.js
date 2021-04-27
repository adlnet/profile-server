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
module.exports = function mustBeLoggedIn(req, res, next) {
    if (!req.user) {
        return res.status(401).send({
            success: false,
            message: 'Must be logged in',
        });
    }
    next();
};
