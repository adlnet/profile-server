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

const authorizationError = require('../errorTypes/authorizationError');

/**
 * Called to unlock a resource
 * @param {boolean} _continue Used as middleware and should call next
 * @param {boolean} publicApi Used to send public api errors
 */
const settings = require('../settings');
module.exports = function unlock(_continue = false, publicApi = false) {
    return async function (req, res, next) {
        console.log('unlocking');
        if (!req.user) {
            if (publicApi) res.status(401).send({ success: false, message: 'User was not found' });
            else throw new Error('anonymous cannot lock');
        }
        if (!req.resource) throw new Error('resource not found');

        if (!req.resource.locked && !_continue) {
            return res.send({
                success: true,
            });
        }
        if (!('locked' in req.resource)) throw new Error('resource not lockable');

        if (req.resource.locked) {
            if (req.resource.lockedTime > Date.now() - settings.lockTimeout) {
                if (req.resource.lockedBy && req.resource.lockedBy.toString() !== req.user.id.toString()) {
                    return res.status(409).send({
                        success: false,
                        message: 'could not unlock, because not lock owner',
                    });
                }
            }
        }
        if (!req.resource.locked || req.resource.lockedTime < Date.now() - settings.lockTimeout) {
            if (req.resource.lockedUsedTime > req.resource.lockedTime) {
                return res.status(409).send({
                    success: false,
                    message: 'could not unlock, because resource is not locked, or the lock has expired. Retry the lock command before committing',
                });
            }
        }

        req.resource.locked = false;

        req.resource.lockedBy = req.user;
        if (_continue) {
            console.log('lock used time was ' + req.resource.lockedUsedTime);
            req.resource.lockedUsedTime = Date.now();
            console.log('set lock used time to ' + req.resource.lockedUsedTime);
        }
        await req.resource.save();
        if (!_continue) {
            return res.send({
                success: true,
            });
        } next();
    };
};
