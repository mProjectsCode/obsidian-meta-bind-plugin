import { UserConfig, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import banner from 'vite-plugin-banner';
import path from 'path';
import builtins from 'builtin-modules';
import { getBuildBanner } from './automation/build/buildBanner';
import manifest from './manifest.json' with { type: 'json' };

const entryFile = 'packages/obsidian/src/main.ts';

export default defineConfig(async ({ mode }) => {
	const { resolve } = path;
	const prod = mode === 'production';
	const outDir = prod ? 'dist/' : `exampleVault/.obsidian/plugins/${manifest.id}/`;

	let plugins = [
		svelte(),
		banner({
			outDir: outDir,
			content: getBuildBanner(prod ? 'Release Build' : 'Dev Build', version => version),
		}),
		viteStaticCopy({
			targets: [
				{
					src: 'manifest.json',
					dest: outDir,
				},
			],
		}),
	];

	return {
		plugins: plugins,
		resolve: {
			alias: {
				packages: path.resolve(__dirname, './packages'),
			},
		},
		define: {
			MB_VERSION: manifest.version,
			MB_DEV_BUILD: !prod,
			MB_DEBUG: false,
		},
		build: {
			lib: {
				entry: resolve(__dirname, entryFile),
				name: 'main',
				fileName: () => 'main.js',
				formats: ['cjs'],
			},
			minify: prod,
			target: 'es2022',
			sourcemap: prod ? false : 'inline',
			cssCodeSplit: false,
			emptyOutDir: false,
			outDir: '',
			rolldownOptions: {
				input: {
					main: resolve(__dirname, entryFile),
				},
				output: {
					dir: outDir,
					entryFileNames: 'main.js',
					assetFileNames: 'styles.css',
				},
				external: [
					'obsidian',
					'electron',
					'@codemirror/autocomplete',
					'@codemirror/collab',
					'@codemirror/commands',
					'@codemirror/language',
					'@codemirror/lint',
					'@codemirror/search',
					'@codemirror/state',
					'@codemirror/view',
					'@lezer/common',
					'@lezer/highlight',
					'@lezer/lr',
					...builtins,
				],
			},
		},
	} as UserConfig;
});
