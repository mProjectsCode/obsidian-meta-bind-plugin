<script lang="ts">
	import type { RunTemplaterFileButtonAction } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: RunTemplaterFileButtonAction;
	} = $props();
</script>

<SettingComponent
	name="File path: {action.templateFile || 'default'}"
	description="The path from the vault to the templater file."
>
	<input type="text" bind:value={action.templateFile} placeholder="some path" />
</SettingComponent>
