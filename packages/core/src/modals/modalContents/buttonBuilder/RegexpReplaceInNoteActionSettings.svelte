<script lang="ts">
	import type { RegexpReplaceInNoteButtonAction } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		plugin,
		action,
	}: {
		plugin: IPlugin;
		action: RegexpReplaceInNoteButtonAction;
	} = $props();
</script>

<SettingComponent name="Regexp" description="The regexp to find replacements.">
	<input type="text" bind:value={action.regexp} />
</SettingComponent>

<SettingComponent name="Regexp Flags" description="The regexp flags for this regexp.">
	<input type="text" bind:value={action.regexpFlags} placeholder="g" />
</SettingComponent>

<SettingComponent name="Replacement Text" description="The text to replace the button with."></SettingComponent>
<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.replacement}></textarea>
</div>
