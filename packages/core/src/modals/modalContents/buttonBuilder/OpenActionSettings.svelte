<script lang="ts">
	import type { MetaBind } from 'packages/core/src';
	import { ButtonStyleType, ButtonPaneType, type OpenButtonAction } from 'packages/core/src/config/ButtonConfig';

	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import Toggle from 'packages/core/src/utils/components/Toggle.svelte';

	const {
		mb,
		action = $bindable(),
	}: {
		mb: MetaBind;
		action: OpenButtonAction;
	} = $props();

	function changeFilePath(): void {
		mb.internal.openMarkdownFileSelectModal((file: string) => {
			action.link = file;
		});
	}
</script>

<SettingComponent name="Link" description="The link to open.">
	<input type="text" bind:value={action.link} placeholder="[[Some Note]] or https://www.example.com" />
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => changeFilePath()} tooltip="Select from vault"
		><Icon iconName="list" mb={mb}></Icon></Button
	>
</SettingComponent>

<SettingComponent name="Open in" description="How the link should open.">
	<select bind:value={action.panetype}>
		<option value={false}>Same Tab</option>
		<option value={ButtonPaneType.NewTab}>New Tab</option>
		<option value={ButtonPaneType.NewSplit}>New Split</option>
		<option value={ButtonPaneType.NewWindow}>New Window</option>
	</select>
</SettingComponent>
