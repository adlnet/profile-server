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
const express = require('express');
const searchRouter = express.Router();
module.exports = searchRouter;

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const models = {
    profiles: require('../ODM/models').profileVersion,
    concepts: require('../ODM/models').concept,
    templates: require('../ODM/models').template,
    patterns: require('../ODM/models').pattern,
};

searchRouter.get('/:type', async (req, res, next) => {
    const model = models[req.params.type];
    if (!model) {
        return res.status(400).send({
            success: false,
            message: 'unknown model type',
        });
    }
    const fields = model.schema.paths;
    const subfields = model.schema.subPaths;

    const allFields = {
        ...fields,
        ...subfields,
    };

    const regex = new RegExp(escapeRegExp(req.query.search));
    const query = {};
    console.log(query);
    for (const i in allFields) {
        if (req.query.search && allFields[i].instance == 'String') { query[i] = regex; }
    }
    const results = await model.find(query).populate('parentProfile organization parentProfile.organization').exec();
    res.send({
        success: true,
        results: results,
    });
});
