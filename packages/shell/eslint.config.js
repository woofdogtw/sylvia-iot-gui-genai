import pluginVue from 'eslint-plugin-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/attributes-order': 'off',
      'vue/html-self-closing': ['error', {
        html: { void: 'always', normal: 'never', component: 'always' },
      }],
    },
  },
  {
    ignores: [
      'dist/**',
      '.quasar/**',
      'node_modules/**',
      'public/**',
    ],
  },
]
