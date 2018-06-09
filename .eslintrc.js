module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],

        "no-console": "off",
        "no-unused-vars": ["warn", { "args": "none" }],
        "curly": ["error", "all"],
        "brace-style": ["error", "1tbs"]
    }
};
