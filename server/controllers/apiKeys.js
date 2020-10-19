/* eslint-disable no-lonely-if */
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
const apiKeyModel = require('../ODM/models').apiKey;
const profileModel = require('../ODM/models').profile;
const profileVersionModel = require('../ODM/models').profileVersion;
const organizationModel = require('../ODM/models').organization;
const { authorizationError, notFoundError } = require('../errorTypes/errors');
const mongoSanitize = require('mongo-sanitize');
const metrics = require('./metrics');

exports.getApiKeys = async function (req, res, next) {
    let apiKeys;
    try {
        const org = await organizationModel.findByUuid(req.params.org);
        if (!org) throw new notFoundError('Organization does not exist.');

        apiKeys = await apiKeyModel.find({ scopeObject: org });
    } catch (err) {
        return next(err);
    }

    res.send({
        success: true,
        apiKeys: apiKeys,
    });
};

exports.generateApiKey = async function (req, res, next) {
    let apiKey;
    try {
        apiKey = await apiKeyModel.createNew(
            'organization',
            req.organization,
            req.user,
            req.body,
        );
    } catch (err) {
        return next(err);
    }

    res.send({
        success: true,
        apiKey: apiKey,
    });
};

exports.getApiKey = async function (req, res, next) {
    let apiKey;
    try {
        apiKey = await apiKeyModel.findOne({ uuid: req.params.apiKey });

        if (!apiKey) {
            throw new notFoundError('Api Key does not exist.');
        }
    } catch (err) {
        return next(err);
    }

    res.send({
        success: true,
        apiKey: apiKey,
    });
};

exports.updateApiKey = async function (req, res, next) {
    let apiKey;
    try {
        apiKey = await apiKeyModel.findOneAndUpdate(
            { uuid: req.params.apiKey },
            req.body,
            { new: true },
        );

        if (!apiKey) {
            throw new notFoundError('Api Key does not exist.');
        }
    } catch (err) {
        next(err);
    }

    res.send({
        success: true,
        apiKey: apiKey,
    });
};

exports.deleteApiKey = async function (req, res, next) {
    try {
        await apiKeyModel.deleteByUuid(req.params.apiKey);
    } catch (err) {
        next(err);
    }

    res.send({
        success: true,
    });
};

exports.middleware = {
    validateApiKey: function (resource) {
        return async function (req, res, next) {
            const apiKey = req.header('x-api-key');

            try {
                const storedKey = await apiKeyModel.findByUuid(apiKey)
                    .populate('scopeObject').populate('updatedBy');

                if (storedKey) {
                    if (req.method === 'POST' || req.method === 'PUT') {
                        await metrics.recordMetric('profileAPIWrite', storedKey.uuid, req);
                    } else if (req.method === 'GET') {
                        await metrics.recordMetric('profileAPIRead', storedKey.uuid, req);
                    }
                }

                if (resource === 'organization') {
                    if (!apiKey || !storedKey) {
                        throw new authorizationError('ApiKey is missing or incorrect.');
                    }
                    req.organization = storedKey.scopeObject;
                }

                if (resource === 'profile') {
                    if (!apiKey || !(storedKey && storedKey.scopeObject)) {
                        req.validationScope = 'public';
                    } else {
                        let profile;
                        profile = await profileModel.findByUuid(req.params.profile)
                            .populate('organization');
                        if (!profile) {
                            profile = await profileVersionModel.findByUuid(req.params.profile)
                                .populate('organization');
                            if (!profile) {
                                throw new notFoundError(`There was no profile found with uuid ${req.params.profile}`);
                            }
                        }

                        if (profile.organization.uuid === storedKey.scopeObject.uuid) {
                            req.validationScope = 'private';
                        } else {
                            req.validationScope = 'public';
                        }
                    }
                }
                req.user = storedKey && storedKey.updatedBy;
            } catch (err) {
                return next(err);
            }

            next();
        };
    },
};
