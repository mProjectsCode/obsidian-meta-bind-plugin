import { plugin } from 'bun';
import { readFileSync } from 'fs';
import { compile } from 'svelte/compiler';

plugin({
	name: 'svelte loader',
	setup(builder) {
		builder.onLoad({ filter: /\.svelte(\?[^.]+)?$/ }, ({ path }) => {
			try {
				const source = readFileSync(
					path.substring(0, path.includes('?') ? path.indexOf('?') : path.length),
					'utf-8',
				);

				const result = compile(source, {
					filename: path,
					generate: 'client',
					dev: true,
				});

				return {
					contents: result.js.code,
					loader: 'js',
				};
			} catch (err) {
				if (err instanceof Error) {
					throw new Error(`Failed to compile Svelte component: ${err.message}`);
				} else {
					throw new Error(`Failed to compile Svelte component`);
				}
			}
		});
	},
});
