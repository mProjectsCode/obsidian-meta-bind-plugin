<script lang="ts">
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<number | null> & {
		placeholder: string;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: number): void {
		value = v;
	}
</script>

<input
	type="number"
	tabindex="0"
	placeholder={props.placeholder}
	bind:value={value}
	oninput={() => props.onValueChange($state.snapshot(value))}
/>
