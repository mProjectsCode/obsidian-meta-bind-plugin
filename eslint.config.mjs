// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import only_warn from 'eslint-plugin-only-warn';
import no_relative_import_paths from 'eslint-plugin-no-relative-import-paths';
import * as plugin_import from 'eslint-plugin-import';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import obsidianmd from 'eslint-plugin-obsidianmd';

import projectConfig from './automation/config.json' with { type: 'json' };

/** @type {{files: string[], rules: Record<string, [string, {patterns: {group: string[], message: string }[]}]>}[]} */
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

export default tseslint.config(
	{
		ignores: ['npm/', 'node_modules/', 'exampleVault/', 'automation/', 'main.js', '**/*.svelte', '**/*.d.ts'],
	},
	...eslintPluginSvelte.configs['flat/recommended'],
	...eslintPluginSvelte.configs['flat/prettier'],
	{
		files: ['packages/**/*.ts'],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: true,
			},
		},
		plugins: {
			// @ts-ignore
			'only-warn': only_warn,
			'no-relative-import-paths': no_relative_import_paths,
			import: plugin_import,
			obsidianmd: obsidianmd,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': ['warn'],

			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports', fixStyle: 'separate-type-imports' },
			],

			'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
			'import/order': [
				'error',
				{
					'newlines-between': 'never',
					alphabetize: { order: 'asc', orderImportKind: 'asc', caseInsensitive: true },
				},
			],

			'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
			'@typescript-eslint/restrict-template-expressions': 'off',

			'no-relative-import-paths/no-relative-import-paths': ['warn', { allowSameFolder: false }],

			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/explicit-function-return-type': ['warn'],
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/no-unused-expressions': [
				'warn',
				{
					allowShortCircuit: true,
				},
			],
			...obsidianmd.configs.recommended.rules,
		},
	},
	...overrides,
);
