/** ***********************************************************************
*
* Veracity Technology Consultants CONFIDENTIAL
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
let path = require('path');



module.exports = {
    entry: {"Index":"./client/Index.jsx"},
    output: {
        path: path.resolve('./client/public'),
        filename: 'Index.js',

        // export itself to a global var
        libraryTarget: 'var',
        // name of the global var: "Foo"
        library: 'Index',
    },
    module: {
        rules: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                
                exclude: /node_modules/,
                query: {
                    presets: ['@babel/preset-env','@babel/preset-react'],
                },
            },
        ],
    },
};
