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
const validate = require('jsonschema').validate;
const _ = require('lodash');
module.exports = function validateTypeWrapper(type) {
    const middleware = function (req, res, next) {
        const dataRequest = req.body;

        const output = validate(dataRequest, type);

        console.log('validator.js ', { output });
        if (output.errors.length === 0) {
            next();
        } else {
            let message = '';
            const error = output.errors[0];
            const path = error.property.replace('instance.', 'properties.').split('.');
            let customError;
            if (path) {
                customError = _.get(type, `${path.join('.')}.customError`);
                while (!customError && path.length) {
                    path.pop();

                    customError = _.get(type, `${path.join('.')}.customError`);
                }
            }
            if (!customError) customError = _.get(type, 'customError');
            if (customError) message = customError;
            else message = `${error.property} ${error.message}`;

            res.status(200).send({
                success: false,
                err: message,
            });
        }
    };
    middleware.type = 'validation';
    return middleware;
};
