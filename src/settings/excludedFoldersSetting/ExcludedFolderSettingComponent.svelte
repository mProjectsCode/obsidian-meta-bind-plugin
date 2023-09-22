<script lang="ts">
	import {InputFieldTemplate} from '../Settings';
	import {createEventDispatcher} from 'svelte';

	export let template: InputFieldTemplate;

	const dispatch = createEventDispatcher();

	function dispatchDeleteEvent(): void {
		console.log('dispatch');
		dispatch('delete-template', {
			name: template.name,
		});
	}
</script>


