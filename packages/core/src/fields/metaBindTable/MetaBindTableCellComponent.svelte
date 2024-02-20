<script lang="ts">
	import { MetaBindTable, MetaBindTableCell } from 'packages/core/src/fields/metaBindTable/MetaBindTable';
	import { onDestroy, onMount } from 'svelte';

	export let table: MetaBindTable;
	export let cell: MetaBindTableCell;

	let element: HTMLElement;
	let onUnmount: () => void;

	onMount(() => {
		onUnmount = table.createCell(cell, element);
	});

	onDestroy(() => {
		onUnmount?.();
	});
</script>

<td>
	<div bind:this={element}></div>
</td>
