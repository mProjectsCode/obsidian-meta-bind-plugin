<script lang="ts">
	import type { TemplaterCreateNoteButtonAction } from 'packages/core/src/config/ButtonConfig';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import Toggle from 'packages/core/src/utils/components/Toggle.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: TemplaterCreateNoteButtonAction;
	} = $props();

	function changeTemplateFile(action: TemplaterCreateNoteButtonAction): void {
		plugin.internal.openFileSelectModal((file: string) => {
			action.templateFile = file;
		});
	}

	function changeFolderPath(action: TemplaterCreateNoteButtonAction): void {
		plugin.internal.openFolderSelectModal((folder: string) => {
			action.folderPath = folder;
		});
	}
</script>

<SettingComponent
	name="Template file: {action.templateFile || 'none'}"
	description="The template file to create a new note of."
>
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => changeTemplateFile(action)}>Change</Button>
</SettingComponent>

<SettingComponent name="Folder: {action.folderPath || 'none'}" description="The folder to create a new note in.">
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => changeFolderPath(action)}>Change</Button>
</SettingComponent>

<SettingComponent name="File name: {action.fileName || 'default'}" description="The file name of the new note.">
	<input type="text" bind:value={action.fileName} placeholder="some name" />
</SettingComponent>

<SettingComponent name="Open note" description="Whether to open the new note after this action ran.">
	<Toggle bind:checked={action.openNote}></Toggle>
</SettingComponent>

<SettingComponent
	name="Open if note already exists"
	description="Whether to open the note instead of creating a new one if the note already exists."
>
	<Toggle bind:checked={action.openIfAlreadyExists}></Toggle>
</SettingComponent>
