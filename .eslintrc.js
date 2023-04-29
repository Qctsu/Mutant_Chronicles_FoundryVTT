module.exports = {
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
    '@typhonjs-fvtt/eslint-config-foundry.js/0.8.0',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    ItemSheet: 'readonly',
    game: 'readonly',
    mergeObject: 'readonly',
    CONFIG: 'writable',
    duplicate: 'readonly',
    $: 'readonly',
    Tabs: 'readonly',
    Hooks: 'readonly',
    Items: 'readonly',
    loadTemplates: 'readonly',
    Combat: 'writable',
    canvas: 'readonly',
    ActorSheet: 'readonly',
    Actor: 'readonly',
    Actors: 'readonly',
    fetchSpell: 'readonly',
  },
  //parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: '2022',
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'no-restricted-syntax': 0,
    'no-new': 0,
    'no-underscore-dangle': 0,
    'no-console': 0,
    'no-shadow': [
      'error',
      {builtinGlobals: true, hoist: 'all', allow: ['event']},
    ],
    'import/extensions': 0,
    'class-methods-use-this': 0,
    'no-param-reassign': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src', '', 'dist'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    },
  },
  plugins: ['jest', 'prettier'],
  overrides: [
    {
      files: 'tests/**/*',
      rules: {
        'global-require': 'off',
      },
    },
  ],
};
