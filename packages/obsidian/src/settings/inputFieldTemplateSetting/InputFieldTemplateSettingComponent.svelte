<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import FlexRow from 'packages/core/src/utils/components/FlexRow.svelte';
	import { type InputFieldTemplate } from 'packages/core/src/Settings';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';

	export let plugin: IPlugin;
	export let template: InputFieldTemplate;

	const dispatch = createEventDispatcher();

	function dispatchDeleteEvent(): void {
		dispatch('delete-template', {
			template: template,
		});
	}
</script>

<div class="mb-card">
	<FlexRow>
		<input type="text" bind:value={template.name} placeholder="template-name" />
		<Button on:click={() => dispatchDeleteEvent()} variant={ButtonStyleType.DESTRUCTIVE} tooltip="Delete Template">
			<Icon plugin={plugin} iconName="x" />
		</Button>
	</FlexRow>
	<textarea
		bind:value={template.declaration}
		placeholder="INPUT[slider(addLabels)]"
		style="width: 100%; height: 100px; resize: vertical;"
	></textarea>
</div>
