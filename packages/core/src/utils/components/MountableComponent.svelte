<script lang="ts">
	import { Mountable } from 'packages/core/src/utils/Mountable';
	import { onDestroy, onMount } from 'svelte';

	const {
		mountable,
	}: {
		mountable: Mountable;
	} = $props();

	let element: HTMLElement;

	onMount(() => {
		mountable.mount(element);
	});

	onDestroy(() => {
		mountable.unmount();
	});
</script>

<div bind:this={element}></div>
