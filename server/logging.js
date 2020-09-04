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
let lastStack = '';
const cluster = require('cluster');
const util = require('util');
console._log1 = console.log.bind(console);
const colors = require('colors');
const isPrimitive = require('is-primitive');

console.log = function(...args) {
    args = args.map(i => {
        if (i && util.isError(i)) { return colors.red.inverse(i.message) + '\n' + colors.red(i.stack); }
        return i;
    });

    const newStack = (new Error()).stack.split('\n')[3];

    let name = newStack.split('\\')[newStack.split('\\').length - 1];
    name = name.split(':')[0];

    const avail = ['grey', 'yellow', 'red', 'green',

        'blue', 'white', 'magenta'];
    const styles = ['inverse', 'underline', 'italic', 'bold', 'reset', 'reset', 'reset'];
    const sum = name.split('').reduce((p, c) => p + c.charCodeAt(0), 0);
    const col = avail[sum % avail.length];
    const style = styles[sum % styles.length];
    if (newStack !== lastStack) {
        if (!cluster.isMaster) {
            console._log1(colors.cyan(lastStack));
        }

        lastStack = newStack;
    }
    console._log1(colors.cyan('Console:') + colors[style][col](name), ...args);
};

// When now in development mode

// If in debug mode, logging actually logs
console._log2 = console.log.bind(console);

console.log = function(...a) {
    const settings = require('./settings.js');
    if (!settings.debug) {

    } else {
        if (cluster.isWorker) { process.send({ message: a, name: '', action: 'log' }); } else { console._log2(...a); } // do this to keep the stack the same depth, for stack display
    }
};
/*    process._exit = process.exit;
    process.exit = function(code = 0) {
        console.log(new Error(code));
        if (code !== 0) {
            process.send({ message: code, action: 'terminate' });
        } else {
            process._exit(code);
        }
    }; */
console.prodLog = (...args) => {
    // if a worker, send only prodlogs

    args = args.map(i => {
        if (i && util.isError(i)) { return colors.red.inverse(i.message) + '\n' + colors.red(i.stack); }
        return i;
    });

    if (cluster.isWorker) {
        args = args.map(i => {
            if (i && util.isError(i)) { return colors.red.inverse(i.message) + '\n' + colors.red(i.stack); }
            return i;
        });

        const newStack = (new Error()).stack.split('\n')[2];

        let name = newStack.split('\\')[newStack.split('\\').length - 1];
        name = name.split(':')[0];




        process.send({ message: args, name: name, action: 'log' });
    } else {
        // if not a worker, prodlog just regular logs
        console._log2(...args);
    }
};
