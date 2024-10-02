<script lang="ts">
	import type { OpenButtonAction } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import Toggle from 'packages/core/src/utils/components/Toggle.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: OpenButtonAction;
	} = $props();
</script>

<SettingComponent name="Link" description="The link to open.">
	<input type="text" bind:value={action.link} placeholder="[[Some Note]] or https://www.example.com" />
</SettingComponent>

<SettingComponent name="New tab" description="Whether to open the link in a new tab.">
	<Toggle bind:checked={action.newTab}></Toggle>
</SettingComponent>
