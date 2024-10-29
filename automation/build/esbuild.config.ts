import builtins from 'builtin-modules';
import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import { getBuildBanner } from 'build/buildBanner';

const banner = getBuildBanner('Release Build', version => version);

const build = await esbuild.build({
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
	format: 'cjs',
	target: 'es2022',
	logLevel: 'info',
	sourcemap: false,
	treeShaking: true,
	outfile: 'main.js',
	minify: true,
	metafile: true,
	define: {
		MB_DEV_BUILD: 'false',
		MB_DEBUG: 'false',
	},
	plugins: [
		esbuildSvelte({
			compilerOptions: { css: 'injected', dev: false },
			filterWarnings: warning => {
				// we don't want warnings from node modules that we can do nothing about
				return !warning.filename?.includes('node_modules');
			},
		}),
	],
});

const file = Bun.file('meta.txt');
await Bun.write(file, JSON.stringify(build.metafile, null, '\t'));

process.exit(0);
