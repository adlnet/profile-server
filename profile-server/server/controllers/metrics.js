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
const mongoose = require('mongoose');
let Metrics = null;
mongoose.connection.on('connected', () => {
    Metrics = mongoose.connection.db.collection('metrics');
    Metrics.ensureIndex({ timeStamp: 1 });
    Metrics.ensureIndex({ metric: 1 });
});
const day = 1000 * 60 * 60 * 24;
const week = day * 7;
module.exports.count = async function (counterName, counterType, inc = 1) {
    if (!Metrics) return;
    let timeStamp = Date.now();
    timeStamp /= (day);
    timeStamp = Math.floor(timeStamp);
    timeStamp *= day;
    await Metrics.updateOne({ timeStamp: timeStamp, counterName: counterName, counterType: counterType }, { $inc: { value: inc } }, { upsert: true });
};
module.exports.populateDemoData = async function (req, res) {
    for (let i = 0.0; i < 5000; i++) {
        let timeStamp = Date.now();
        timeStamp /= (day);
        timeStamp = Math.floor(timeStamp);
        timeStamp *= day;
        timeStamp -= Math.floor(Math.random() * 400) * day;
        const inc = Math.floor(Math.random() * 3);
        const counterType = ['profileAPIExport', 'profileUIExport', 'profileUIView', 'profileAPIView'][Math.floor(Math.random() * 3.99999)];
        Metrics.updateOne({ timeStamp: timeStamp, counterName: req.params.profile, counterType: counterType }, { $inc: { value: inc } }, { upsert: true });
    }
    res.send('ok');
};
module.exports.overtime = async function (counterName, counterType) {
    if (!Metrics) return;
    const overTime = await Metrics.aggregate([
        {
            $match: {
                counterName: counterName,
                counterType: counterType,
                timeStamp: { $gt: Date.now() - week * 4 },
            },
        },
        {
            $group: {
                _id: '$timeStamp',
                value: { $sum: '$value' },
            },
        },
        {
            $sort: {
                _id: 1,
            },
        },
    ]).toArray();
    return overTime;
};

module.exports.total = async function (counterName, counterType) {
    if (!Metrics) return;
    const overTime = await Metrics.aggregate([
        {
            $match: {
                counterName: counterName,
                counterType: counterType,
                timeStamp: { $gt: Date.now() - (week * 4) },
            },
        },
        {
            $group: {
                _id: 1,
                value: { $sum: '$value' },
            },
        },
    ]).toArray();
    return overTime;
};

module.exports.mostViewed = async function (req, res) {
    if (!Metrics) return;
    const overTime = await Metrics.aggregate([
        {
            $match: {
                counterType: 'profileUIView',
                timeStamp: { $gt: Date.now() - req.query.days * day },
            },
        },
        {
            $group: {
                _id: '$counterName',
                value: { $sum: '$value' },
            },
        },

        {
            $lookup: {
                from: 'profiles',
                localField: '_id',
                foreignField: 'uuid',
                as: 'profile',
            },
        },
        {
            $addFields: {
                profile: { $arrayElemAt: ['$profile', 0] },
            },
        },
        {
            $match: { 'profile.currentPublishedVersion': { $exists: true } },
        },
        {
            $lookup: {
                from: 'profileversions',
                localField: 'profile.currentPublishedVersion',
                foreignField: '_id',
                as: 'currentPublishedVersion',
            },
        },
        {
            $addFields: {
                currentPublishedVersion: { $arrayElemAt: ['$currentPublishedVersion', 0] },
            },
        },
        {
            $match: {
                currentPublishedVersion: { $exists: true },
            },
        },
        {
            $project: {
                y: '$value',
                name: '$currentPublishedVersion.name',
            },
        },

        {
            $sort: {
                y: -1,
            },
        },
        {
            $limit: 10,
        },

    ]).toArray();
    res.send(overTime);
};
module.exports.mostExported = async function (req, res) {
    if (!Metrics) return;
    const overTime = await Metrics.aggregate([
        {
            $match: {
                counterType: { $in: ['profileAPIExport', 'profileUIExport'] },
                timeStamp: { $gt: Date.now() - req.query.days * day },
            },
        },
        {
            $group: {
                _id: { counterName: '$counterName', counterType: '$counterType' },
                value: { $sum: '$value' },
            },
        },
        {
            $lookup: {
                from: 'profiles',
                localField: '_id.counterName',
                foreignField: 'uuid',
                as: 'profile',
            },
        },
        {
            $addFields: {
                profile: { $arrayElemAt: ['$profile', 0] },
            },
        },
        {
            $lookup: {
                from: 'profileversions',
                localField: 'profile.currentPublishedVersion',
                foreignField: '_id',
                as: 'currentPublishedVersion',
            },
        },
        {
            $addFields: {
                currentPublishedVersion: { $arrayElemAt: ['$currentPublishedVersion', 0] },
            },
        },
        {
            $match: {
                currentPublishedVersion: { $exists: true },
            },
        },
        {
            $project: {
                y: '$value',
                name: '$currentPublishedVersion.name',
            },
        },
        {
            $sort: {
                y: -1,
            },
        },
        {
            $limit: 10,
        },

    ]).toArray();
    res.send(overTime);
};


module.exports.mostAPIRetrievals = async function (req, res) {
    if (!Metrics) return;
    const overTime = await Metrics.aggregate([
        {
            $match: {
                counterType: { $in: ['profileAPIRead', 'profileAPIWrite'] },
                timeStamp: { $gt: Date.now() - req.query.days * day },
            },
        },
        {
            $group: {
                _id: { counterName: '$counterName', counterType: '$counterType' },
                value: { $sum: '$value' },
            },
        },

        {
            $lookup: {
                from: 'apikeys',
                localField: '_id.counterName',
                foreignField: 'uuid',
                as: 'keys',
            },
        },
        {
            $addFields: {
                apiKey: { $arrayElemAt: ['$keys', 0] },
            },
        },
        {
            $project: {
                y: '$value',
                name: '$apiKey.description',
            },
        },

        {
            $sort: {
                y: -1,
            },
        },
        {
            $limit: 10,
        },

    ]).toArray();
    res.send(overTime);
};

module.exports.serveProfileSparkline = function () {
    return async function (req, res, next) {
        const counterName = req.params.profile;
        const data = await module.exports.overtime(counterName, { $in: ['profileUIView', 'profileDownloads'] });

        res.send(data);
    };
};

module.exports.serveProfileViewTotal = function () {
    return async function (req, res, next) {
        const counterName = req.params.profile;
        const data = await module.exports.total(counterName, { $in: ['profileUIView', 'profileDownloads'] });

        res.send(data);
    };
};

module.exports.serveProfileExportTotal = function () {
    return async function (req, res, next) {
        const counterName = req.params.profile;
        const data = await module.exports.total(counterName, { $in: ['profileUIExport', 'profileAPIExport'] });

        res.send(data);
    };
};

module.exports.serveMostAPIRetrievals = function () {
    return async function (req, res, next) {
        const counterName = req.params.profile;
        const data = await module.exports.total(counterName, { $in: ['profileUIExport', 'profileAPIExport'] });

        res.send(data);
    };
};

module.exports.recordMetric = async function (metric, uuid, req) {
    const log = console.prodLog || console.log;
    try {
        await module.exports.count(uuid, metric);
        log(`METRIC COUNT: ${metric} - ${uuid}`);
    } catch (e) {
        log(`ERROR: Exception attempting to record API Write: ${req && req.method} ${req && req.originalURL}`);
        log(e);
    }
};
