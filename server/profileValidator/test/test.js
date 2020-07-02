/* eslint-disable notice/notice */
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
const walk = require('fs-walk');
const fs = require('fs');
const path = require('path');
const validator = require('../validator');

const util = require('util');

const activity = require('../schemas/activity');
const concept = require('../schemas/concept');
const definition = require('../schemas/definition');
const document = require('../schemas/document');
const extension = require('../schemas/extension');
const interactionData = require('../schemas/interactionData');
const jsonschema = require('../schemas/jsonschema');
const languageMap = require('../schemas/languageMap');
const organization = require('../schemas/organization');
const pattern = require('../schemas/pattern');
const profile = require('../schemas/profile');
const profileVersion = require('../schemas/profileVersion');
const rule = require('../schemas/rule');
const template = require('../schemas/template');

// used when part of profile server
const profileDir = 'server/profileValidator/xapi-authored-profiles';

// used when testing only profile validator
// const profileDir = './xapi-authored-profiles';

walk.filesSync(profileDir, (basedir, filename, stat) => {
    if (/jsonld$/.test(filename)) {
        try {
            const json = JSON.parse(fs.readFileSync(path.join(basedir, filename)));
            it('Should validate the profile ' + path.join(basedir, filename), () => {
                const valid = validator.validate(json, profile);
                if (valid.errors.length) {
                    // console.log(util.inspect(valid.errors,{depth:100}));

                    for (const i in valid.errors) {
                        console.log(valid.errors[i]);
                        if (valid.errors[i].name === 'oneOf') {
                            let valid2;
                            const ins = valid.errors[i].instance;
                            if (ins.type === 'ResultExtension' || ins.type === 'ContextExtension' || ins.type === 'ActivityExtension') {
                                valid2 = validator.validate(ins, extension);
                            }

                            if (ins.type === 'Verb' || ins.type === 'ActivityType' || ins.type === 'AttachmentUsageType') {
                                valid2 = validator.validate(ins, concept);
                            }

                            if (ins.type === 'StateResource' || ins.type === 'AgentProfileResource' || ins.type === 'ActivityProfileResource') {
                                valid2 = validator.validate(ins, document);
                            }
                            if (valid2 && valid2.errors.length) {
                                console.log(valid2);
                            }
                        }
                    }

                    throw (new Error(['Errors in ' + filename + ': ' + valid.errors.length, ...valid.errors.map(i => i.stack)].join('\n')));
                }
            });
        } catch (e) {
            console.log(e);
            console.log('When loading ' + filename);
        }
    }
});
