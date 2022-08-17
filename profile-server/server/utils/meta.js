/** ***************************************************************
* Copyright 2022 Advanced Distributed Learning (ADL)
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

const metaModel = require('../ODM/models.js').meta;
const userModel = require('../ODM/models.js').user;

const assignTemporaryUsernames = (startingIndex) => new Promise((resolve, reject) => {
    userModel.find({username: { $exists: false }}, async(err, users) => {

        let additions = 0;

        for (let k=0; k<users.length; k++) {
            let user = users[k];
            if (user.username != undefined)
                continue;

            user.username = `temp-username-${startingIndex + k}`;
            user.save();

            console.prodLog(`Assigning username of ${user.username} to ${user.email}`);

            additions = k;
        }

        resolve(additions);
    });
});

module.exports = {
    ensureTemporaryUsernames: () => new Promise((resolve, reject) => {
        
        metaModel.findOne(
            {
                singleton: true,
            },
            async (err, metadata) => {

                if (metadata == undefined)
                    metadata = new metaModel();
                
                let startingIndex = metadata.tempUsernameIndex;

                let additions = await assignTemporaryUsernames(startingIndex);

                metadata.singleton = true;
                metadata.startingIndex = startingIndex + additions;
    
                await metadata.save();

                resolve(additions);
        });
    })
}

