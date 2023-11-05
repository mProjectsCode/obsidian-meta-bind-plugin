<script lang="ts">
	import { OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
	import { MBLiteral } from '../../../utils/Literal';

	export let value: MBLiteral;
	export let options: OptionInputFieldArgument[];
	export let onValueChange: (value: MBLiteral) => void;

	export function setValue(v: MBLiteral): void {
		value = v;
	}

	function selectOption() {
		onValueChange(value);
	}
</script>

<select class="dropdown" bind:value={value} on:change={() => selectOption()}>
	{#each options as option}
		<option value={option.value}>{option.name}</option>
	{/each}
</select>
