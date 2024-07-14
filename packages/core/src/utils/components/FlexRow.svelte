<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		reverse = false,
		stretchChildren = false,
		children,
	}: {
		reverse?: boolean;
		stretchChildren?: boolean;
		children: Snippet;
	} = $props();

	const classes = $derived(
		[reverse ? 'mb-flex-row-reverse' : 'mb-flex-row', stretchChildren ? 'mb-flex-row-stretch' : ''].join(' '),
	);
</script>

<div class={classes}>
	{@render children()}
</div>
