/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  /**
   * Rules copied from `@edge/eslint-config-typescript` - it can't be extended directly as its own dependency on
   * `plugin:@typescript-eslint/recommended` clashes with `@vue/eslint-config-typescript`
   */
  rules: {
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        'multiline': {
          'delimiter': 'none',
          'requireLast': true
        },
        'singleline': {
          'delimiter': 'comma',
          'requireLast': false
        }
      }
    ],
    '@typescript-eslint/type-annotation-spacing': [
      'error',
      {
        'before': false,
        'after': true,
        'overrides': {
          'arrow': {
            'before': true,
            'after': true
          }
        }
      }
    ],
    'arrow-body-style': [
      'error',
      'as-needed'
    ],
    'arrow-spacing': 'error',
    'brace-style': [
      'error',
      'stroustrup'
    ],
    'comma-dangle': [
      'error',
      'never'
    ],
    'curly': [
      'off'
    ],
    'eol-last': [
      'error',
      'always'
    ],
    'indent': [
      'error',
      2
    ],
    'jsx-quotes': [
      'error',
      'prefer-double'
    ],
    'line-comment-position': [
      'error',
      'above'
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'max-len': [
      'warn',
      {
        'code': 120
      }
    ],
    'no-array-constructor': 'error',
    'no-eval': 'error',
    'no-lonely-if': 'error',
    'no-multi-assign': 'error',
    'no-new-object': 'error',
    'no-tabs': 'error',
    'no-trailing-spaces': 'warn',
    'no-unreachable': 'error',
    'no-var': 'error',
    'nonblock-statement-body-position': 'error',
    'one-var': [
      'error',
      'never'
    ],
    'prefer-arrow-callback': 'error',
    'prefer-const': 'warn',
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'sort-imports': [
      'warn',
      {
        'memberSyntaxSortOrder': [
          'none',
          'all',
          'single',
          'multiple'
        ]
      }
    ],
    'sort-vars': 'error'
  }
}
