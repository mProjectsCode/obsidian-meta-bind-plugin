<script lang="ts">
	import { MetaBindTable, MetaBindTableCell } from './MetaBindTable';
	import { onDestroy, onMount } from 'svelte';
	import { Component } from 'obsidian';

	export let table: MetaBindTable;
	export let cell: MetaBindTableCell;

	let element: HTMLElement;
	let component: Component;

	onMount(() => {
		component = new Component();
		component.load();
		table.createCell(cell, element, component);
	});

	onDestroy(() => {
		component.unload();
	});
</script>

<td>
	<div bind:this={element}></div>
</td>
