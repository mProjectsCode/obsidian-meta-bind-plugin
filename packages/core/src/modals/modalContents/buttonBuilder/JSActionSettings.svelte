<script lang="ts">
	import type { JSButtonAction } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: JSButtonAction;
	} = $props();
</script>

<SettingComponent name="JS file" description="The JavaScript file to run.">
	<input type="text" bind:value={action.file} placeholder="someJsFile.js" />
</SettingComponent>
