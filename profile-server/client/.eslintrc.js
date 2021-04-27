module.exports = {
    extends: ["eslint:recommended",
        "plugin:react/recommended"],
    env: {
        node: true,
        es6: true,
        "jest/globals": true
    },
    plugins: ['notice'],
    "parser": "babel-eslint",
    rules: {
        "notice/notice": ["error",
            {
                "templateFile": "./license.js",
                "onNonMatchingHeader": "replace"
            }
        ],
        "react/prop-types": [1, { skipUndeclared: true }]
    },
};
