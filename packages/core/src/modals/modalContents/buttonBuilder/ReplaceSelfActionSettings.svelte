<script lang="ts">
	import type { MetaBind } from 'packages/core/src';
	import type { ReplaceSelfButtonAction } from 'packages/core/src/config/ButtonConfig';

	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		mb,
		action = $bindable(),
	}: {
		mb: MetaBind;
		action: ReplaceSelfButtonAction;
	} = $props();
</script>

<SettingComponent name="Replacement text" description="The text to replace the match with."></SettingComponent>
<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.replacement}></textarea>
</div>
