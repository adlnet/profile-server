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
const levels = ['member', 'admin', 'sysadmin'];
/**
 * Middleware that sets a permission level on a route. The value of
 * req.permission must be of the same level or greater to gain access.
 *
 * @param {enum} level ['member', 'admin', 'sysadmin']
 */
module.exports = function (level) {
    const required = levels.indexOf(level);
    if (required == -1) { throw new Error("don't understand this permission level."); }

    return function (req, res, next) {
        const has = levels.indexOf(req.permissionLevel);

        if (has < required) {
            return res.status(401).send({
                success: false,
                message: 'Permission denied.',
            });
        }

        return next();
    };
};
