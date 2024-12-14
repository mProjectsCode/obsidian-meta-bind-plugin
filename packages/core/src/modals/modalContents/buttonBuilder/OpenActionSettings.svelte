<script lang="ts">
	import { ButtonStyleType, type OpenButtonAction } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import Toggle from 'packages/core/src/utils/components/Toggle.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: OpenButtonAction;
	} = $props();

	function changeFilePath(): void {
		plugin.internal.openMarkdownFileSelectModal((file: string) => {
			action.link = file;
		});
	}
</script>

<SettingComponent name="Link" description="The link to open.">
	<input type="text" bind:value={action.link} placeholder="[[Some Note]] or https://www.example.com" />
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => changeFilePath()} tooltip="Select from vault"
		><Icon iconName="list" plugin={plugin}></Icon></Button
	>
</SettingComponent>

<SettingComponent name="New tab" description="Whether to open the link in a new tab.">
	<Toggle bind:checked={action.newTab}></Toggle>
</SettingComponent>
