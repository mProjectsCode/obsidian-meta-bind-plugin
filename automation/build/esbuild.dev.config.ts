import esbuild from 'esbuild';
import copy from 'esbuild-plugin-copy-watch';
import esbuildSvelte from 'esbuild-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import manifest from '../../manifest.json' assert { type: 'json' };
import { getBuildBanner } from 'build/buildBanner';

const banner = getBuildBanner('Dev Build', _ => 'Dev Build');

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ['packages/obsidian/src/main.ts'],
	bundle: true,
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
	],
	format: 'cjs',
	target: 'es2022',
	logLevel: 'info',
	sourcemap: 'inline',
	treeShaking: true,
	outdir: `exampleVault/.obsidian/plugins/${manifest.id}/`,
	outbase: 'packages/obsidian/src',
	define: {
		MB_DEV_BUILD: 'false',
		MB_DEBUG: 'true',
	},
	plugins: [
		copy({
			paths: [
				{
					from: './styles.css',
					to: '',
				},
				{
					from: './manifest.json',
					to: '',
				},
			],
		}),
		esbuildSvelte({
			compilerOptions: { css: 'injected', dev: true },
			filterWarnings: warning => {
				// we don't want warnings from node modules that we can do nothing about
				return !(
					warning.filename?.includes('node_modules') || warning.message.includes('has unused export property')
				);
			},
		}),
	],
});

await context.watch();
