<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	const {
		elements = [],
		children,
	}: {
		elements?: T[];
		children: Snippet<[T]>;
	} = $props();
</script>

{#each elements.slice(0, elements.length - 1) as element}
	{@render children(element)}
	<span>,</span>
	<span></span>
	<!-- some strange line breaks to get the comma seperated spacing to work -->
{/each}
{@render children(elements[elements.length - 1])}
