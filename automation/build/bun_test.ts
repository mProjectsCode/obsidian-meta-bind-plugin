import builtins from 'builtin-modules';
import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { getBuildBanner } from 'build/buildBanner';

// currently this segfaults for me, but i want to consider using bun for the build system in the future
// https://github.com/oven-sh/bun/issues/12456

const banner = getBuildBanner('Release Build', version => version);

const build = await Bun.build({
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
		...builtins,
	],
	format: 'esm',
	target: 'browser',
	logLevel: 'info',
	sourcemap: 'none',
	treeShaking: true,
	outfile: 'main.js',
	minify: true,
	metafile: true,
	define: {
		MB_GLOBAL_CONFIG_DEV_BUILD: 'false',
	},
	plugins: [
		// @ts-ignore
		esbuildSvelte({
			compilerOptions: { css: 'injected', dev: false },
			preprocess: sveltePreprocess(),
			filterWarnings: warning => {
				// we don't want warnings from node modules that we can do nothing about
				return !warning.filename?.includes('node_modules');
			},
		}),
	],
});

// const file = Bun.file('meta.txt');
// await Bun.write(file, JSON.stringify(build.metafile, null, '\t'));

// process.exit(0);
