<script lang="ts">
	import type { InlineJsButtonAction } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: InlineJsButtonAction;
	} = $props();
</script>

<SettingComponent name="JS Code" description="The JavaScript code to run."></SettingComponent>

<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.code}></textarea>
</div>
