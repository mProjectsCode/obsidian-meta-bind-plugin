<script lang="ts">
	import { OpenButtonAction } from 'packages/core/src/config/ButtonConfig';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';
	import Toggle from 'packages/core/src/utils/components/Toggle.svelte';

	export let action: OpenButtonAction;
	export let plugin: IPlugin;
</script>

<SettingComponent name="Link" description="The link to open.">
	<input type="text" bind:value={action.link} placeholder="[[Some Note]] or https://www.example.com" />
</SettingComponent>

<SettingComponent name="New Tab" description="Whether to open the link in a new tab.">
	<Toggle bind:checked={action.newTab}></Toggle>
</SettingComponent>
