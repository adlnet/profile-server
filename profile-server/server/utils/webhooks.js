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

const eventBus = require('./eventBus');
// This does not necessarily need to be in this file.

const crypto = require('crypto');
const request = require('request');

const signer = (algorithm, buffer, secret) => {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(buffer, 'utf-8');
    return algorithm + '=' + hmac.digest('hex');
};
async function sendWebHook(hook, payload) {
    const body = JSON.stringify(payload);

    const headers = {
        'content-type': 'application/json',
    };
    if (hook.signatureMethod && hook.signatureMethod !== 'none') {
        headers['X-Hub-Signature'] = signer(hook.signatureMethod, Buffer.from(body), hook.clientSecret);
    }
    return new Promise((res) => {
        request({
            method: 'POST',
            url: hook.target,
            body: body,
            headers: headers,
        }, (error, response, body) => {
            if (error) {
                return console.error('upload failed:', error);
            }
            console.log('Upload successful!  Server responded with:', body);
            res();
        });
    });
}
function hookupWebhook(event) {
    eventBus.on(event, async (e, profileVersion) => {
        const Hook = require('../ODM/models').hook;
        console.log(profileVersion);
        const hooks = await Hook.find({ event: event, subject: profileVersion.parentProfile }).exec();
        for (const i in hooks) {
            await sendWebHook(hooks[i], profileVersion);
        }
    });
}
for (const i of ['profilePublished', 'profileCreated']) {
    hookupWebhook(i);
}
