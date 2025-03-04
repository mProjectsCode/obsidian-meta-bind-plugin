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

	function getLimitString(length: number, limit: number): string {
		const limitStr = limit.toString();
		const lengthStr = length.toString().padStart(limitStr.length, '0');
		return `${lengthStr}/${limitStr}`;
	}
</script>

<input
	type="text"
	tabindex="0"
	placeholder={props.placeholder}
	bind:value={value}
	maxlength={props.limit}
	oninput={() => props.onValueChange($state.snapshot(value))}
/>
{#if props.limit !== undefined}
	<span
		class={`mb-content-limit-indicator ${value.length > props.limit ? 'mb-content-limit-indicator-overflow' : ''}`}
		>{getLimitString(value.length, props.limit)}</span
	>
{/if}
