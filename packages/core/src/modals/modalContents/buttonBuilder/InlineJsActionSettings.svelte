<script lang="ts">
	import type { InlineJSButtonAction } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		plugin,
		action = $bindable(),
	}: {
		plugin: IPlugin;
		action: InlineJSButtonAction;
	} = $props();
</script>

<SettingComponent name="JS code" description="The JavaScript code to run."></SettingComponent>

<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.code}></textarea>
</div>
