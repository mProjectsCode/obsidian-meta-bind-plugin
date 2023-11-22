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

// plugin({
// 	name: 'svelte loader',
// 	async setup(builder) {
// 		const { compile, preprocess } = await import('svelte/compiler');
// 		const { readFileSync } = await import('fs');
//
// 		builder.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
// 			return {
// 				// Use the preprocessor of your choice.
// 				contents: compile(
// 					await preprocess(readFileSync(path, 'utf8'), sveltePreprocess()).then(processed => processed.code),
// 					{
// 						filename: path,
// 						generate: 'dom',
// 					},
// 				).js.code,
// 				loader: 'js',
// 			};
// 		});
// 	},
// });
