<script lang="ts">
	import { ReplaceInNoteButtonAction } from 'packages/core/src/config/ButtonConfig';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let action: ReplaceInNoteButtonAction;
	export let plugin: IPlugin;
</script>

<SettingComponent name="Line From" description="The line that marks the start of the area to replace.">
	<input type="number" bind:value={action.fromLine} placeholder="0" />
</SettingComponent>

<SettingComponent name="Line To" description="The line that marks the end of the area to replace.">
	<input type="number" bind:value={action.toLine} placeholder="0" />
</SettingComponent>

<SettingComponent name="Replacement Text" description="The text to replace the note section."></SettingComponent>
<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.replacement}></textarea>
</div>
