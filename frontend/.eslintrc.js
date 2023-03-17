module.exports = {
	root: true,
	env: {
		node: true
	},
	'extends': [
		'plugin:vue/vue3-essential',
		'eslint:recommended'
	],
	rules: {
		// 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-console': 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
	},
	parserOptions: {
		// parser: 'babel-eslint'
		parser: '@babel/eslint-parser'
	}
}
  