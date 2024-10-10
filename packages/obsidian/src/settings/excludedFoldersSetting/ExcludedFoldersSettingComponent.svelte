<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import ModalButtonGroup from 'packages/core/src/utils/components/ModalButtonGroup.svelte';
	import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
	import ErrorCollectionComponent from 'packages/core/src/utils/errors/ErrorCollectionComponent.svelte';
	import type { ExcludedFoldersSettingModal } from 'packages/obsidian/src/settings/excludedFoldersSetting/ExcludedFoldersSettingModal';

	let {
		plugin,
		modal,
		excludedFolders: propExcludedFolders,
	}: {
		plugin: IPlugin;
		modal: ExcludedFoldersSettingModal;
		excludedFolders: string[];
	} = $props();

	let errorCollection: ErrorCollection | undefined = $state();
	let excludedFolders: string[] = $state(propExcludedFolders);

	function deleteFolder(name: string): void {
		excludedFolders = excludedFolders.filter(x => x !== name);
	}

	function addFolder(): void {
		excludedFolders.push('');
	}

	function save(): void {
		errorCollection = modal.save($state.snapshot(excludedFolders));

		if (errorCollection === undefined) {
			modal.close();
		}
	}

	function cancel(): void {
		modal.close();
	}
</script>

<div>
	<table class="mb-excluded-folders-table">
		<thead>
			<tr>
				<th> Folder Path</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each excludedFolders as folder, i (i)}
				<tr>
					<td class="mb-excluded-folders-table-input-cell">
						<input type="text" bind:value={excludedFolders[i]} placeholder="path/to/folder" />
					</td>
					<td>
						<Button onclick={() => deleteFolder(folder)} tooltip="Delete">
							<Icon plugin={plugin} iconName="x"></Icon>
						</Button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<Button onclick={() => addFolder()} variant={ButtonStyleType.PRIMARY} tooltip="Add new excluded folder"
		>Add folder</Button
	>

	{#if errorCollection}
		<div>
			<h3 class="mod-error">Some folder paths are invalid</h3>

			<ErrorCollectionComponent settings={{ errorCollection: errorCollection }}></ErrorCollectionComponent>
		</div>
	{/if}

	<ModalButtonGroup>
		<Button onclick={() => save()} variant={ButtonStyleType.PRIMARY} tooltip="Save changes">Save</Button>
		<Button onclick={() => cancel()} tooltip="Revert changes">Cancel</Button>
	</ModalButtonGroup>
</div>
