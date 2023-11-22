<script lang="ts">
	import { InputFieldTemplate } from '../Settings';
	import { createEventDispatcher } from 'svelte';
	import Button from '../../utils/components/Button.svelte';
	import Icon from '../../utils/components/Icon.svelte';

	export let template: InputFieldTemplate;

	const dispatch = createEventDispatcher();

	function dispatchDeleteEvent(): void {
		console.log('dispatch');
		dispatch('delete-template', {
			name: template.name,
		});
	}
</script>

<tr>
	<td>
		<input type="text" bind:value={template.name} placeholder="template-name" />
	</td>
	<td style="width: 100%">
		<input
			type="text"
			bind:value={template.declaration}
			placeholder="INPUT[slider(addLabels)]"
			style="width: 100%"
		/>
	</td>
	<td>
		<Button on:click={() => dispatchDeleteEvent()} tooltip="Delete Template">
			<Icon iconName="x" />
		</Button>
	</td>
</tr>
