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
module.exports.count = function(counterName, counterType, inc = 1) {
    if (!Metrics) return;
    let timeStamp = Date.now();
    timeStamp /= (day);
    timeStamp = Math.floor(timeStamp);
    timeStamp *= day;
    Metrics.updateOne({ timeStamp: timeStamp, counterName: counterName, counterType: counterType }, { $inc: { value: inc } }, { upsert: true });
};

module.exports.overtime = async function(counterName, counterType) {
    if (!Metrics) return;
    const overTime = await Metrics.aggregate([
        {
            $match: {
                counterName: counterName,
                counterType: counterType,
                timeStamp: { $gt: Date.now() - week },
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

module.exports.serveProfileSparkline = function() {
    const counterType = 'profileDownloads';
    return async function(req, res, next) {
        const counterName = req.params.profile;
        const data = await module.exports.overtime(counterName, counterType);
        return res.send([{ // mockup data for testing
            _id: 100,
            value: 100,
        },
        {
            _id: 200,
            value: 100,
        }, {
            _id: 300,
            value: 1300,
        }, {
            _id: 400,
            value: 1400,
        }, {
            _id: 500,
            value: 1100,
        }, {
            _id: 600,
            value: 1500,
        }, {
            _id: 700,
            value: 1200,
        }, {
            _id: 800,
            value: 1060,
        }]);
        res.send(data);
    };
};
