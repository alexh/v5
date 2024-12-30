module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'react/no-unknown-property': ['error', { 
      ignore: [
        'object',
        'position',
        'rotation',
        'intensity',
        'angle',
        'penumbra',
        'distance',
        'castShadow',
        'attach',
        'args',
        'dispose'
      ] 
    }],
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-img-element': 'warn',
    'prefer-const': 'error',
    '@typescript-eslint/no-empty-function': ['error', { 
      allow: ['arrowFunctions'] 
    }]
  },
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'react/display-name': 'off',
      }
    }
  ]
}; 