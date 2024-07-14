<script lang="ts">
	import { TableMountable, type MetaBindTableRow } from 'packages/core/src/fields/metaBindTable/TableMountable';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import MountableComponent from 'packages/core/src/utils/components/MountableComponent.svelte';

	const {
		table,
		tableHead = [],
	}: {
		table: TableMountable;
		tableHead?: string[];
	} = $props();

	let tableRows: MetaBindTableRow[] = $state([]);

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
				<th class="mb-html-table-button-cell"></th>
			</tr>
		</thead>
		<tbody>
			{#each tableRows as tableRow (tableRow.index)}
				<tr>
					{#if tableRow.isValid}
						{#each tableRow.cells as cell}
							<td>
								<MountableComponent mountable={cell}></MountableComponent>
							</td>
						{/each}
					{:else}
						<td class="meta-bind-error" colspan={tableHead.length}> invalid data</td>
					{/if}

					<td class="mb-html-table-button-cell">
						<Button on:click={() => table.removeColumn(tableRow.index)}>
							<Icon plugin={table.plugin} iconName="x" />
						</Button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Button on:click={() => table.addColumn()}>Add Row</Button>
