<script lang="ts">
	import type { MetaBind } from 'packages/core/src';
	import type { SleepButtonAction } from 'packages/core/src/config/ButtonConfig';

	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		mb,
		action = $bindable(),
	}: {
		mb: MetaBind;
		action: SleepButtonAction;
	} = $props();
</script>

<SettingComponent name="Sleep time" description="The time to sleep in milliseconds.">
	<input type="number" bind:value={action.ms} placeholder="100 ms" />
</SettingComponent>
