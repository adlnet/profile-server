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
 * Middleware added to test if a resource is available to be edited.
 * Looks for req.resource to be populated with a model with lock properties.
 *
 * @param {boolean} _continue To call next and move on to the next
 * function on the route
 */
const settings = require('../settings');
module.exports = function (_continue = false) {
    return async function lock(req, res, next) {
        if (!req.user) throw new Error('Anonymous users cannot lock a resource');
        if (!req.resource) throw new Error('Cannot obtain a lock on this resource. The resource may have been removed.');

        if (!('locked' in req.resource)) throw new Error('Resource not lockable');

        if (req.resource.locked) {
            if (req.resource.lockedTime > Date.now() - settings.lockTimeout) {
                if (req.resource.lockedBy && req.resource.lockedBy.toString() !== req.user.id.toString()) {
                    return res.status(409).send({
                        success: false,
                        message: 'This resource is locked by another user.',
                    });
                }
            }
        }
        req.resource.locked = true;
        req.resource.lockedTime = Date.now();
        req.resource.lockedBy = req.user;
        await req.resource.save();
        if (_continue) { next(); } else {
            return res.status(200).send({
                success: true,
                message: 'locked',
                timeout: settings.lockTimeout,
            });
        }
    };
};
