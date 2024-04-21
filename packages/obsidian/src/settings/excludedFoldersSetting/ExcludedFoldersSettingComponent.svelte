<script lang="ts">
	import { ExcludedFoldersSettingModal } from './ExcludedFoldersSettingModal';
	import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let excludedFolders: string[];
	export let modal: ExcludedFoldersSettingModal;
	export let plugin: IPlugin;

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
							<Icon plugin={plugin} iconName="x"></Icon>
						</Button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<Button on:click={() => addFolder()} variant={ButtonStyleType.PRIMARY} tooltip="Add new excluded Folder"
		>Add Folder</Button
	>

	{#if errorCollection}
		<div>
			<h3 class="mod-error">Some Folder Paths are invalid</h3>

			<ErrorCollectionComponent settings={{ errorCollection: errorCollection }}></ErrorCollectionComponent>
		</div>
	{/if}

	<ModalButtonGroup>
		<Button on:click={() => save()} variant={ButtonStyleType.PRIMARY} tooltip="Save Changes">Save</Button>
		<Button on:click={() => cancel()} tooltip="Revert Changes">Cancel</Button>
	</ModalButtonGroup>
</div>
