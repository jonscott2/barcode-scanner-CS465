import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-use-before-define': [
        'error',
        {
          functions: false
        }
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      curly: ['warn'],
      eqeqeq: [
        'error',
        'always',
        {
          null: 'ignore'
        }
      ]
    }
  },
  {
    ignores: ['dist']
  }
];
