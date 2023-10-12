<script lang="ts">
	import {MBLiteral, stringifyLiteral} from '../../../../utils/Utils';
	import {OptionInputFieldArgument} from '../../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';

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

<select class='dropdown' bind:value={value} on:change={() => selectOption()}>
	{#each options as option}
		<option value={option.value}>{option.name}</option>
	{/each}
</select>
