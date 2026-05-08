import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Allow unused vars that start with _ (intentionally ignored params)
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // The codebase uses bare destructured `c` etc. without using everything; warn not error
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },
  prettier,
  {
    ignores: ['dist/**', 'node_modules/**', 'index.html', '*.html'],
  },
];
