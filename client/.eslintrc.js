module.exports = {
    extends: ["eslint:recommended",
        "plugin:react/recommended"],
    env: {
        node: true,
    },
    plugins: ['notice'],
    "parser": "babel-eslint",
    rules: {
        "notice/notice": ["error",
            {
                "templateFile": "./license.js",
                "mustMatch": "Veracity Technology Consultants"
            }
        ],
        "react/prop-types": [1, { skipUndeclared: true }]
    },
};
