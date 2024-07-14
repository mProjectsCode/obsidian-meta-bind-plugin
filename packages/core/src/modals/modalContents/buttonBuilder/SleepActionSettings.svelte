<script lang="ts">
	import type { SleepButtonAction } from 'packages/core/src/config/ButtonConfig';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import type { IPlugin } from 'packages/core/src/IPlugin';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: SleepButtonAction;
	} = $props();
</script>

<SettingComponent name="Sleep Time" description="The time to sleep in milliseconds.">
	<input type="number" bind:value={action.ms} placeholder="100 ms" />
</SettingComponent>
