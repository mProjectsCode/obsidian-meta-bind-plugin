<script lang="ts">
	import type { Mountable } from 'packages/core/src/utils/Mountable';
	import { onDestroy } from 'svelte';

	let {
		mountable,
	}: {
		mountable: Mountable;
	} = $props();

	let element: HTMLElement;
	let current: Mountable | undefined;

	$effect(() => {
		current?.unmount();
		current = mountable;
		current.mount(element);
	});

	onDestroy(() => {
		current?.unmount();
	});
</script>

<div bind:this={element}></div>
