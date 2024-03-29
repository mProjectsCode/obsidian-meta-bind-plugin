<script lang="ts">
	import { SleepButtonAction } from 'packages/core/src/config/ButtonConfig';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let action: SleepButtonAction;
	export let plugin: IPlugin;
</script>

<SettingComponent name="Sleep Time" description="The time to sleep in milliseconds.">
	<input type="number" bind:value={action.ms} placeholder="100 ms" />
</SettingComponent>
