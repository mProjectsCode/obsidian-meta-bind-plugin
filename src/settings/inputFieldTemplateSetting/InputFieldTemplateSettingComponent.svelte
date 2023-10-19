<script lang='ts'>
	import { InputFieldTemplate } from '../Settings';
	import { IconButton, TextInput } from 'obsidian-svelte';
	import { createEventDispatcher } from 'svelte';

	export let template: InputFieldTemplate;

	const dispatch = createEventDispatcher();

	function dispatchDeleteEvent(): void {
		console.log('dispatch');
		dispatch('delete-template', {
			name: template.name
		});
	}
</script>

<tr>
	<td>
		<TextInput bind:value={template.name} placeholder='template-name'></TextInput>
	</td>
	<td style='width: 100%'>
		<TextInput bind:value={template.declaration} placeholder='INPUT[slider(addLabels)]' width='100%'></TextInput>
	</td>
	<td>
		<IconButton icon='x' onClick={() => dispatchDeleteEvent()} tooltip='Delete Template'></IconButton>
	</td>
</tr>
