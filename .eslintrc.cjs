/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  ignorePatterns: ['./src/assets/js/**/*.js'],
  overrides: [
    {
      files: ['./src/views/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': ['warn'],
      },
    },
  ],
}
