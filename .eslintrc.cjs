const projectConfig = require('./automation/config.json');

const overrides = [];

for (const corePackage of projectConfig.corePackages) {
	const patterns = [];

	for (const nonCorePackage of projectConfig.packages) {
		patterns.push({
			group: [`packages/${nonCorePackage}/*`],
			message: `Core package "${corePackage}" should not import from the non core "${nonCorePackage}" package.`,
		});
	}

	overrides.push({
		files: [`packages/${corePackage}/src/**/*.ts`],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: patterns,
				},
			],
		},
	});
}

for (const nonCorePackage of projectConfig.packages) {
	const patterns = [];

	for (const otherNonCorePackage of projectConfig.packages) {
		if (otherNonCorePackage === nonCorePackage) {
			continue;
		}
		patterns.push({
			group: [`packages/${otherNonCorePackage}/*`],
			message: `Non core package "${nonCorePackage}" should not import from the non core "${otherNonCorePackage}" package.`,
		});
	}

	overrides.push({
		files: [`packages/${nonCorePackage}/src/**/*.ts`],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: patterns,
				},
			],
		},
	});
}

const flatOverrides = overrides.map(o => ({
	files: o.files,
	restrictedImports: o.rules['no-restricted-imports'][1].patterns.map(p => p.group).flat(),
}));

console.log('Import restrictions:');
console.log(flatOverrides);

/** @type {import('eslint').Linter.Config} */
const config = {
	root: true,
	parser: '@typescript-eslint/parser',
	env: {
		node: true,
	},
	plugins: ['isaacscript', 'import', 'only-warn', 'no-relative-import-paths'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
	],
	parserOptions: {
		sourceType: 'module',
		tsconfigRootDir: __dirname,
		ecmaVersion: 'latest',
		project: ['./tsconfig.json', './packages/*/tsconfig.json'],
	},
	rules: {
		'@typescript-eslint/no-explicit-any': ['warn'],

		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
		],
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{ prefer: 'type-imports', fixStyle: 'inline-type-imports' },
		],

		'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
		'@typescript-eslint/restrict-template-expressions': 'off',

		'no-relative-import-paths/no-relative-import-paths': 'error',

		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/explicit-function-return-type': ['warn'],
		'@typescript-eslint/require-await': 'off',
	},
	overrides: [...overrides],
};

module.exports = config;
