import { plugin } from 'bun';
import sveltePreprocess from 'svelte-preprocess';
import esbuildSvelte from 'esbuild-svelte';

plugin(
	// @ts-ignore
	esbuildSvelte({
		compilerOptions: { css: 'injected' },
		preprocess: sveltePreprocess(),
		filterWarnings: warning => {
			// we don't want warnings from node modules that we can do nothing about
			return !warning.filename?.includes('node_modules');
		},
	}),
);
