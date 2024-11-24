<script lang="ts">
	import type { ButtonAction, RunTemplaterFileButtonAction } from 'packages/core/src/config/ButtonConfig';
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
		action: RunTemplaterFileButtonAction;
	} = $props();

</script>

<SettingComponent name="File path: {action.templateFile || 'default'}" description="The path from the vault to the templater file.">
	<input type="text" bind:value={action.templateFile} placeholder="some path" />
</SettingComponent>


