<script lang="ts">
	import { TableMountable, MetaBindTableCell } from 'packages/core/src/fields/metaBindTable/TableMountable';
	import { onDestroy, onMount } from 'svelte';

	export let table: TableMountable;
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
