<script lang="ts">
	import { MetaBindTable, MetaBindTableRow } from './MetaBindTable';
	import MetaBindTableCellComponent from './MetaBindTableCellComponent.svelte';
	import Icon from '../../utils/components/Icon.svelte';
	import Button from '../../utils/components/Button.svelte';

	export let table: MetaBindTable;
	export let tableHead: string[] = [];

	let tableRows: MetaBindTableRow[] = [];

	export function updateTable(cells: MetaBindTableRow[]): void {
		tableRows = cells;
	}
</script>

<div class="mb-table-wrapper">
	<table class="mb-html-table">
		<thead>
			<tr>
				{#each tableHead as headCell}
					<th>{headCell}</th>
				{/each}
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each tableRows as tableRow (tableRow.index)}
				<tr>
					{#if tableRow.isValid}
						{#each tableRow.cells as tableCell}
							<MetaBindTableCellComponent table={table} bind:cell={tableCell}
							></MetaBindTableCellComponent>
						{/each}
					{:else}
						<td class="meta-bind-error" colspan={tableHead.length}> invalid data</td>
					{/if}

					<td>
						<Button on:click={() => table.removeColumn(tableRow.index)}>
							<Icon iconName="x" />
						</Button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Button on:click={() => table.addColumn()}>Add Column</Button>
