// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [...tanstackConfig, {
  rules: {
    'import/no-cycle': 'off',
    'import/order': 'off',
    'sort-imports': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/require-await': 'off',
    'pnpm/json-enforce-catalog': 'off',
  },
}, {
  ignores: ['eslint.config.js', 'prettier.config.js'],
}, ...storybook.configs["flat/recommended"]];
