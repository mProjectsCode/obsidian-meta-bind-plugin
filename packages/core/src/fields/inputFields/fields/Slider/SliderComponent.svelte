<script lang="ts">
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<number> & {
		minValue: number;
		maxValue: number;
		stepSize: number;
		addLabels: boolean;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: number): void {
		value = v;
	}
</script>

{#if props.addLabels}
	<span class="mb-slider-input-label">{props.minValue}</span>
{/if}
<input
	class="mb-slider-input slider"
	type="range"
	tabindex="0"
	aria-label={value.toString()}
	min={props.minValue}
	max={props.maxValue}
	step={props.stepSize}
	bind:value={value}
	oninput={() => props.onValueChange(value)}
/>
{#if props.addLabels}
	<span class="mb-slider-input-label">{props.maxValue}</span>
{/if}
