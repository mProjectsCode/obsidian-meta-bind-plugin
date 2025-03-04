<script lang="ts">
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<string> & {
		placeholder: string;
		limit: number | undefined;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: string): void {
		value = v;
	}
</script>

<textarea
	class="mb-input-textarea"
	tabindex="0"
	placeholder={props.placeholder}
	bind:value={value}
	maxlength={props.limit}
	oninput={() => props.onValueChange($state.snapshot(value))}
></textarea>
