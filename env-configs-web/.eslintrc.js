module.exports = {
    plugins: ['@typescript-eslint', 'react', 'jest', 'react-hooks'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    extends: [
        'standard',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
    ],
    env: {
        browser: true,
        es6: true,
        'jest/globals': true,
    },
    rules: {
        'no-unused-vars': 'off',
        'no-useless-constructor': 'off',
        'max-lines': [
            'error',
            { max: 300, skipBlankLines: true, skipComments: true },
        ],
        'react/display-name': 'off',
        'no-return-assign': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/prop-types': 'off',
    },
};
