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
const meta = require("./server/utils/meta");
const sessionHandling = require("./server/controllers/util/SessionHandler");

require("./server/logging");

const app = require('./app');
let settings = require("./server/settings");

async function main() {
    if (settings.go()) {
    
        mongoose.connect(settings.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        console.prodLog("Starting temporary username migration ...");
        let additions = await meta.ensureTemporaryUsernames();

        console.prodLog(`Assigned ${additions} temporary usernames.`);

        console.prodLog(`Initializing session handler ...`);
        await sessionHandling.initSessionHandler();
    
        app.listen(settings.port);
        console.prodLog(`Server started on port ${settings.port}`);
    }
}

main();
