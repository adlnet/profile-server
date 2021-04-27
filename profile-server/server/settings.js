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
const commandLineUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const colors = require('colors');

// bail for tests
let skipCommandLine = false;
for (const i in process.argv) {
    if (/(mocha|jest)$/.test(process.argv[i])) {
        skipCommandLine = true;
    }
}

const defaults = {
    port: {
        default: 3005,
        type: Number,
        description: 'The actual port that the system will listen on.',
        configurable: true,
        category: 'Basics',
    },
    workers: {
        default: 0,
        type: Number,
        description: 'The number of workers to spawn. "0" will use all cores.',
        configurable: true,
        category: 'Basics',
    },
    connectionString: {
        default: 'mongodb://localhost:27017/profileServer',
        type: String,
        description: 'The MongoDB connection',
        configurable: true,
        category: 'Basics',
    },
    showConfig: {
        default: false,
        type: Boolean,
        description: 'Show the currently configured settings',
        configurable: true,
        category: 'Basics',
    },
    createUser: {
        default: false,
        type: Boolean,
        description: 'Run the create user script',
        configurable: true,
        category: 'Basics',
    },
    debug: {
        default: false,
        type: Boolean,
        description: 'Show debug output',
        configurable: true,
        category: 'Basics',
    },
    help: {
        default: false,
        type: Boolean,
        description: 'Show the command line documentation',
        configurable: true,
        category: 'Basics',
    },
    profileRootIRI: {
        default: 'https://profiles.adlnet.gov/xapi',
        type: String,
        description: 'The root IRI of profiles created by this server',
        configurable: true,
        category: 'Basics',
    },
    profileAPIRootURL: {
        default: 'https://profiles.adlnet.gov',
        type: String,
        description: 'The root URL of the server',
        configurable: true,
        category: 'Basics',
    },
    SERVER_SECRET: {
        default: 'sdflkas;flkjas;ldf',
        type: String,
        description: 'A secret used for session signing',
        configurable: true,
        category: 'Basics',
    },
    QUERY_RESULT_LIMIT: {
        default: 10,
        type: Boolean,
        description: 'The number of results per page in the API',
        configurable: true,
        category: 'Basics',
    },
    version: {
        default: false,
        type: StringBool,
        description: 'Print the version number',
        configurable: true,
        category: 'Basics',
    },
    forceExit: {
        default: false,
        type: StringBool,
        description: 'only here to allow the test suite to run',
        configurable: true,
        category: '',
    },
    lockTimeout: {
        default: 1000 * 60 * 10,
        type: Number,
        description: 'How long until the lock times out.',
        configurable: true,
        category: '',
    },

    email_user: { type: String, category: 'Email', configurable: true, description: 'The username for the outgoing email server' },
    email_pass: { type: String, category: 'Email', configurable: true, description: 'The password for the outgoing email server' },
    email_server: { type: String, category: 'Email', default: 'smtp.gmail.com', configurable: true, description: 'The address of the outgoing email server' },
    system_email_from: { type: String, category: 'Email', default: 'support@adlnet.gov', configurable: true, description: 'The email address that will be used in the <from> field of outgoing emails.' },
    clientURL: { type: String, category: 'Basics', default: 'http://localhost:3000', configurable: true, description: 'The URL of the client side software' },
};


function StringBool() {

}

class SettingsManager {

}

const settings = new SettingsManager();

function toType(value, envVal) {
    if (value !== undefined && typeof value === 'boolean') {
        envVal = envVal == 'true';
    } else if (value !== undefined && typeof value === 'string') {
        envVal = envVal;
    } else if (value !== undefined && typeof value === 'number') {
        envVal = parseFloat(envVal);
    } else if (value !== undefined && value !== null && typeof value === 'object') {
        envVal = JSON.parse(envVal);
    }
    return envVal;
}
const optionDefinitions = [];
for (const i in defaults) {
    optionDefinitions.push(
        { name: i, type: defaults[i].type !== StringBool ? defaults[i].type : String },
    );
}

let commandLine = {};
if (!skipCommandLine) commandLine = commandLineArgs(optionDefinitions);

const optionList = [];
const logo = '';// require('./logo.js');

const sections = [{
    content: logo + colors.cyan(`
                    Alias (xapi-profile-server)
    `),
    raw: true,
},
{
    header: 'Configuration',
    content: ' You can set parameters using the --flag=value --flag2=value2 format. Each listed parameter can also be placed in a file called .env along side this executable. In the .env file, omit the `--` characters from the flag names, and separate the options with a new line. The same parameters (minus the `--`) can be set as environment variables. The order of precedence is command line flags override environment, environment overrides .env file, .env file overrides defaults.',
},
{
    header: 'Example',
    content: [
        '$ ./alias [{bold --port} {underline 8080}] {bold --disableAccountCreation} ',
        '$ ./alias {bold --help}',
    ],
},
{
    header: 'Basic Options',
    optionList: optionList,
    group: ['Basics'],
},
{
    header: 'Email Configuration',
    optionList: optionList,
    group: ['Email'],
}];

if (process.stdout.columns < 80) {
    sections[0] = {
        header:
            colors.cyan('Alias (xapi-profile-server)'),
    };
}

for (const i in defaults) {
    optionList.push(
        { name: i, description: defaults[i].description + colors.cyan(` (Default: ${defaults[i].default})`), type: defaults[i].type, group: defaults[i].category },
    );
}

const getUsage = require('command-line-usage');
if (commandLine.help) {
    console.prodLog(getUsage(sections));
    process.exit();
}

const env = require('dotenv').config({ path: '.env' });


const runtimeValues = {};
const p = new Proxy(settings, {
    set: function (target, prop, value) {
        if (defaults.hasOwnProperty(prop)) {
            console.log('Runtime setting change ' + prop + ' to ' + value);
            runtimeValues[prop] = value;
        } else {
            console.log('Attempt to change unknown setting at runtime ' + prop);
        }
    },
    get: function (target, prop, receiver) {
        if (prop === 'allOptions') {
            return defaults;
        }
        if (prop === 'go') {
            return function () {
                if (!p.connectionString) {
                    console.prodLog('connectionString must be set');
                    return false;
                }
                if (p.help) {
                    const getUsage = require('command-line-usage');
                    if (commandLine.help) {
                        console.prodLog(getUsage(sections));
                        process.exit();
                    }
                }
                if (p.createUser) {
                    const getUsage = require('command-line-usage');
                    if (commandLine.createUser) {
                        require('./scripts/createUser.js');

                        return false;
                        // require("./scripts/configure")
                    }
                }


                return true;
            };
        }
        if (defaults.hasOwnProperty(prop)) {
            let value = defaults[prop].default;
            // Check the env



            if (env.parsed[prop] !== undefined) {
                const envVal = env.parsed[prop];
                // try to format as default prop


                if (envVal !== undefined && envVal !== null) { value = toType(value, envVal); }
            }
            if (commandLine[prop] !== undefined && commandLine[prop] !== null) { value = defaults[prop].type === StringBool ? commandLine[prop] === 'true' : commandLine[prop]; }
            if (runtimeValues[prop] !== undefined) { value = runtimeValues[prop]; }

            return value;
        }
        console.log(`Attempted to read unknown setting ${prop}`);
        return null;
    },
});

if (commandLine.showConfig) {
    for (const i in defaults) {
        if (defaults[i].configurable) {
            console.prodLog(i + ' = ' + colors.cyan(p[i] !== null && p[i] !== undefined ? p[i] : 'null'));
        }
    }
    process.exit();
}

if (commandLine.version) {
    console.log('1.0.0');
    process.exit();
}

module.exports = p;
