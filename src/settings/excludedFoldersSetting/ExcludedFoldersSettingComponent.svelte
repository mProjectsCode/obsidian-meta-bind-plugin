<script lang="ts">
	import { ExcludedFoldersSettingModal } from './ExcludedFoldersSettingModal';
	import { ErrorCollection } from '../../utils/errors/ErrorCollection';
	import ErrorCollectionComponent from '../../utils/errors/ErrorCollectionComponent.svelte';
	import ModalButtonGroup from '../../utils/components/ModalButtonGroup.svelte';
	import Button from '../../utils/components/Button.svelte';
	import Icon from '../../utils/components/Icon.svelte';

	export let excludedFolders: string[];
	export let modal: ExcludedFoldersSettingModal;

	let errorCollection: ErrorCollection | undefined;

	function deleteFolder(name: string): void {
		excludedFolders = excludedFolders.filter(x => x !== name);
	}

	function addFolder(): void {
		excludedFolders.push('');

		excludedFolders = excludedFolders;
	}

	function save(): void {
		errorCollection = modal.save(excludedFolders);

		if (errorCollection === undefined) {
			modal.close();
		}
	}

	function cancel(): void {
		modal.close();
	}
</script>

<div>
	<table>
		<thead>
			<tr>
				<th> Folder Path</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each excludedFolders as folder}
				<tr>
					<td style="width: 100%">
						<input type="text" bind:value={folder} placeholder="path/to/folder" style="width: 100%" />
					</td>
					<td>
						<Button on:click={() => deleteFolder(folder)} tooltip="Delete">
							<Icon iconName="x"></Icon>
						</Button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<Button on:click={() => addFolder()} variant="primary" tooltip="Add new excluded Folder">Add Folder</Button>

	{#if errorCollection}
		<div>
			<h3 class="mod-error">Some Folder Paths are invalid</h3>

			<ErrorCollectionComponent errorCollection={errorCollection} declaration={undefined}
			></ErrorCollectionComponent>
		</div>
	{/if}

	<ModalButtonGroup>
		<Button on:click={() => save()} variant="primary" tooltip="Save Changes">Save</Button>
		<Button on:click={() => cancel()} tooltip="Revert Changes">Cancel</Button>
	</ModalButtonGroup>
</div>
