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
const ProfileVersionModel = require('../../ODM/models').profileVersion;

module.exports = async function (existingModels, wasRevisionOf) {
    const was = await Promise.all(wasRevisionOf.map(async versionId => {
        const inExisting = existingModels.find(e => e.iri === versionId);
        if (inExisting) return inExisting;

        const onServer = await ProfileVersionModel.findOne({ iri: versionId });
        if (onServer) return onServer;

        const parentless = new ProfileVersionModel({
            iri: versionId,
            name: versionId,
            description: versionId,
            isShallowVersion: true,
        });
        await parentless.save();
        return parentless;
    }));

    return was.length && was;
};
