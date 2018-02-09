module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": ["eslint:recommended", "google"],
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2017
    },
    "rules": {
        'no-console': 'off',
        'camelcase': 'off',
        'max-len': 'off',
        'require-jsdoc': 'off',
    }
};
