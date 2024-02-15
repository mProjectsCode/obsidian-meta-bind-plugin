<script lang="ts">
	import { InputFieldTemplate } from '../Settings';
	import { createEventDispatcher } from 'svelte';
	import Button from '../../utils/components/Button.svelte';
	import Icon from '../../utils/components/Icon.svelte';
	import { ButtonStyleType } from '../../config/ButtonConfig';
	import FlexRow from '../../utils/components/FlexRow.svelte';

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
			<Icon iconName="x" />
		</Button>
	</FlexRow>
	<textarea
		type="text"
		bind:value={template.declaration}
		placeholder="INPUT[slider(addLabels)]"
		style="width: 100%; height: 100px; resize: vertical;"
	></textarea>
</div>
