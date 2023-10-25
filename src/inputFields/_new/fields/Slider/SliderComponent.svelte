<script lang='ts'>
	export let value: number;
	export let minValue: number;
	export let maxValue: number;
	export let stepSize: number;
	export let addLabels: boolean;
	export let onValueChange: (value: number) => void;

	export function setValue(v: number): void {
		value = v;
	}
</script>

{#if addLabels}
	<span class='meta-bind-plugin-slider-input-label'>{minValue}</span>
	<input type='range' tabindex='0' min={minValue} max={maxValue} step={stepSize} bind:value={value}
		   on:input={() => onValueChange(value)}>
	<span class='meta-bind-plugin-slider-input-label'>{maxValue}</span>
{:else}
	<input type='range' tabindex='0' min={minValue} max={maxValue} step={stepSize} bind:value={value}
		   on:input={() => onValueChange(value)}>
{/if}


