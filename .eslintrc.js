module.exports = {
  extends: ['eslint:recommended', 'plugin:ava/recommended'],
  env: {
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off', // override eslint:recommended

    // --fix
    eqeqeq: 'error',
    'no-else-return': 'error',
    'no-useless-return': 'error',
    'no-implicit-coercion': 'error',
    'dot-notation': 'warn',
    'arrow-parens': ['error', 'as-needed'],
    'no-useless-rename': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-spread': 'warn',

    // no --fix
    'no-const-assign': 'warn',
    'no-use-before-define': 'warn',
    'no-return-await': 'warn'
  }
};
