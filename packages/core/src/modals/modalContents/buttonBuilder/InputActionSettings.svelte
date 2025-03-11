<script lang="ts">
	import type { MetaBind } from 'packages/core/src';
	import type { InputButtonAction } from 'packages/core/src/config/ButtonConfig';

	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		mb,
		action = $bindable(),
	}: {
		mb: MetaBind;
		action: InputButtonAction;
	} = $props();
</script>

<SettingComponent name="Text" description="The text to input at the cursor.">
	<input type="text" bind:value={action.str} placeholder="some text" />
</SettingComponent>
