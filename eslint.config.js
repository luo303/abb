const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*']
  },
  {
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      quotes: ['warn', 'single'],
      semi: ['warn', 'never'],
      'no-undef': 2,
      '@typescript-eslint/no-explicit-any': 'off',
      // 强制使用 === 而非 ==（避免类型隐式转换）
      eqeqeq: [2, 'always']
    }
  }
])
