import builtins from 'builtin-modules';
import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte';
import process from 'process';
import { getBuildBanner } from 'build/buildBanner';

const banner = getBuildBanner('Publish Release Build', version => `Publish Release Build (based on ${version})`);

esbuild
	.build({
		banner: {
			js: banner,
		},
		entryPoints: ['packages/publish/src/main.ts'],
		bundle: true,
		external: [
			'obsidian',
			'electron',
			'@codemirror/autocomplete',
			'@codemirror/closebrackets',
			'@codemirror/collab',
			'@codemirror/commands',
			'@codemirror/comment',
			'@codemirror/fold',
			'@codemirror/gutter',
			'@codemirror/highlight',
			'@codemirror/history',
			'@codemirror/language',
			'@codemirror/lint',
			'@codemirror/matchbrackets',
			'@codemirror/panel',
			'@codemirror/rangeset',
			'@codemirror/rectangular-selection',
			'@codemirror/search',
			'@codemirror/state',
			'@codemirror/stream-parser',
			'@codemirror/text',
			'@codemirror/tooltip',
			'@codemirror/view',
			...builtins,
		],
		format: 'iife',
		globalName: 'meta_bind_publish',
		target: 'es2020',
		logLevel: 'info',
		sourcemap: false,
		treeShaking: true,
		minify: true,
		outfile: './Publish.js',
		define: {
			MB_DEV_BUILD: 'false',
			MB_DEBUG: 'false',
		},
		plugins: [
			esbuildSvelte({
				compilerOptions: { css: 'injected' },
				filterWarnings: warning => {
					// we don't want warnings from node modules that we can do nothing about
					return !warning.filename?.includes('node_modules');
				},
			}),
		],
	})
	.catch(() => process.exit(1));
