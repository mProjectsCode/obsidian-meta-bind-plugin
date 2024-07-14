<script lang="ts">
	import type { ReplaceSelfButtonAction } from 'packages/core/src/config/ButtonConfig';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import type { IPlugin } from 'packages/core/src/IPlugin';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: ReplaceSelfButtonAction;
	} = $props();
</script>

<SettingComponent name="Replacement Text" description="The text to replace the match with."></SettingComponent>
<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.replacement}></textarea>
</div>
