import { plugin } from 'bun';
import esbuildSvelte from 'esbuild-svelte';
import { sveltePreprocess } from 'svelte-preprocess';

plugin(
	// @ts-ignore
	esbuildSvelte({
		compilerOptions: { css: 'injected', dev: true, generate: 'client', runes: true },
		preprocess: sveltePreprocess(),
		filterWarnings: warning => {
			// we don't want warnings from node modules that we can do nothing about
			return !warning.filename?.includes('node_modules');
		},
	}),
);
