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
 * Middleware used to find a resource and attach it to the request object.
 *
 * @param {Mongoose Model} Model The model of the resource
 * @param {string} keyParam The value used to find the resource
 * @param {string} modelKey The property on the model to search
 * @param {boolean} required Does this middleware have to return a resource
 * @param {string} resourceKey The property on the request object to hold this resource
 */
module.exports = function getResource(Model, keyParam, modelKey = 'uuid', required = true, resourceKey = 'resource') {
    return async function (req, res, next) {
        const resource = await Model.findOne({ [modelKey]: req.params[keyParam] });
        req[resourceKey] = resource;
        if (!required || resource) { next(); } else {
            return res.status(404).send({
                success: false,
                message: `Could not locate ${keyParam} resource with ${modelKey}: ${req.params[keyParam]}`,
            });
        }
    };
};
