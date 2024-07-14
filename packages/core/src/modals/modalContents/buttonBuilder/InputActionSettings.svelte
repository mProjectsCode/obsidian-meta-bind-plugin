<script lang="ts">
	import type { InputButtonAction } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: InputButtonAction;
	} = $props();
</script>

<SettingComponent name="Text" description="The text to input at the cursor.">
	<input type="text" bind:value={action.str} placeholder="some text" />
</SettingComponent>
