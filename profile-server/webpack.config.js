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
let path = require('path');



module.exports = {
    entry: { "Index": "./client/Index.jsx" },
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
                    presets: ['@babel/preset-env', '@babel/preset-react'],
                },
            },
        ],
    },
    
    devServer: {
        disableHostCheck: true;
    }
};
