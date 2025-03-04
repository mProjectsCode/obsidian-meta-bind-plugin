<script lang="ts">
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<string> = $props();

	let value = $state(props.value);

	export function setValue(v: string): void {
		value = v;
	}
</script>

<input type="datetime-local" bind:value={value} oninput={() => props.onValueChange($state.snapshot(value))} />
