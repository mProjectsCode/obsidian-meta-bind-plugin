<script lang="ts">
	import type { MetaBind } from 'packages/core/src';
	import type { InsertIntoNoteButtonAction } from 'packages/core/src/config/ButtonConfig';

	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		mb,
		action = $bindable(),
	}: {
		mb: MetaBind;
		action: InsertIntoNoteButtonAction;
	} = $props();
</script>

<SettingComponent name="Line" description="The line number to insert at.">
	<input type="number" bind:value={action.line} placeholder="0" />
</SettingComponent>

<SettingComponent name="Text to insert" description="The text to insert into the note."></SettingComponent>
<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.value}></textarea>
</div>
