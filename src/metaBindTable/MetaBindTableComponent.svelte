<script lang="ts">
	import {MetaBindTable, MetaBindTableRow} from './MetaBindTable';
	import MetaBindTableCellComponent from './MetaBindTableCellComponent.svelte';
	import Icon from '../utils/Icon.svelte';
	import {Button} from 'obsidian-svelte';

	export let table: MetaBindTable;
	export let tableHead: string[] = [];

	let tableCells: MetaBindTableRow[] = [];

	export function updateTable(cells: MetaBindTableRow[]): void {
		tableCells = cells;
	}

</script>

<table>
	<thead>
	<tr>
		{#each tableHead as headCell}
			<th>{headCell}</th>
		{/each}
	</tr>
	</thead>
	<tbody>

	{#each tableCells as tableRow (tableRow.index)}
		<tr>
			{#if tableRow.isValid}
				{#each tableRow.cells as tableCell}
					<MetaBindTableCellComponent table={table} bind:cell={tableCell}></MetaBindTableCellComponent>
				{/each}
			{:else}
				<td class="meta-bind-error" colspan={tableHead.length}>
					invalid data
				</td>
			{/if}

			<td>
				<Button on:click={() => table.removeColumn(tableRow.index)}>
					<Icon iconName="x"/>
				</Button>
			</td>
		</tr>
	{/each}

	</tbody>
</table>

<Button on:click={() => table.addColumn()}>
	Add Column
</Button>
