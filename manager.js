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
require('./server/logging');
const settings = require('./server/settings.js');

const path = require('path');

const colors = require('colors');
function go() {
    console.prodLog('Alias');

    if (!settings.go()) {

        return;
    }
    console.log('Starting cluster');

    const recluster = require('recluster');

    let cluster;
    const args = (process.argv.slice(2));

    const os = require('os');
    const cpuCount = os.cpus().length;

    let workers = settings.workers || cpuCount;

    cluster = recluster(path.join(__dirname, 'server.js'), { readyWhen: 'listening', workers: workers, args });


    cluster.run(!settings.debug);

    function exitHandler(err) {
        // swallow annoying errors caused by shutdown
        console.log('Exiting...', err);
        console.log(new Error().stack);
        process.stdout.on('error', (e) => { });
        cluster.terminate(() => {
            process.exit();
        });
    }
    cluster.on('message', (worker, message) => {
        // if (message.action === 'terminate') {
        //     console.prodLog('terminating cluster');
        //     console.prodLog(message.message);
        //     exitHandler();
        // }
        if (message.action === 'log') {
            const workers = cluster.workers();

            const name = message.name;
            const avail = ['grey', 'yellow', 'red', 'green',
                'blue', 'white', 'magenta'];
            const styles = ['inverse', 'underline', 'italic', 'bold', 'reset', 'reset', 'reset'];
            const sum = name.split('').reduce((p, c) => p + c.charCodeAt(0), 0);
            const col = avail[sum % avail.length];
            const style = styles[sum % styles.length];


            // when not in debug mode, show messages from only first worker.
            if (!settings.debug) {
                if (worker === workers[0]) console.prodLog(colors[style][col](name.replace('.js', ':')), ...message.message);
            } else {
                console.prodLog(colors[style][col](name.replace('.js', ':')), ...message.message);
            }
            // console.log.call(console,message.message);
        }
    });

    process.cluster = cluster;
    process.stdin.resume(); // so the program will not close instantly
    // do something when app is closing

    /* process.on(
        'exit',
        exitHandler.bind(null, {
            cleanup: true,
        }),
    ); */
    // catches ctrl+c event
    process.on(
        'SIGINT',
        exitHandler.bind(null, {
            exit: true,
        }),
    );
    // catches "kill pid" (for example: nodemon restart)
    process.on(
        'SIGUSR1',
        exitHandler.bind(null, {
            exit: true,
        }),
    );
    process.on(
        'SIGUSR2',
        exitHandler.bind(null, {
            exit: true,
        }),
    );
    // catches uncaught exceptions
    process.on(
        'uncaughtException', (err) => {
            //   exitHandler(err);
        },

    );

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });
    process.stdout.write(colors.red('>'));
    rl.on('line', (line) => {
        console._log1(colors.red('>>>'), line);
        process.stdout.write(colors.red('>'));
        if (line === 'reload') {
            cluster.reload(() => { });
        }
    });
}


go();
