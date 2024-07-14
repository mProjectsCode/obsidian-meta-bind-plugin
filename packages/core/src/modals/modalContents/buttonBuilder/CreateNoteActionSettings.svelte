<script lang="ts">
	import type { ButtonAction, CreateNoteButtonAction } from 'packages/core/src/config/ButtonConfig';
	import { ButtonActionType, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import Toggle from 'packages/core/src/utils/components/Toggle.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: CreateNoteButtonAction;
	} = $props();

	function createNoteActionChangeFolderPath(action: ButtonAction): void {
		if (action.type !== ButtonActionType.CREATE_NOTE) {
			return;
		}

		plugin.internal.openFolderSelectModal((folder: string) => {
			action.folderPath = folder;
		});
	}
</script>

<SettingComponent name="Folder: {action.folderPath || 'none'}" description="The folder to create a new note in.">
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => createNoteActionChangeFolderPath(action)}>Change</Button>
</SettingComponent>

<SettingComponent name="File Name: {action.fileName || 'default'}" description="The file name of the new note.">
	<input type="text" bind:value={action.fileName} placeholder="some name" />
</SettingComponent>

<SettingComponent name="Open Note" description="Whether to open the new note after this action ran.">
	<Toggle bind:checked={action.openNote}></Toggle>
</SettingComponent>
