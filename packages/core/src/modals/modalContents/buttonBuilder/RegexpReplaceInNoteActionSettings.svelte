<script lang="ts">
	import { RegexpReplaceInNoteButtonAction } from 'packages/core/src/config/ButtonConfig';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let action: RegexpReplaceInNoteButtonAction;
	export let plugin: IPlugin;
</script>

<SettingComponent name="Regexp" description="The regexp to find replacements.">
	<input type="text" bind:value={action.regexp} />
</SettingComponent>

<SettingComponent name="Replacement Text" description="The text to replace the button with."></SettingComponent>
<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.replacement}></textarea>
</div>
