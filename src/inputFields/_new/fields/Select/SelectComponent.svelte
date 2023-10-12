<script lang="ts">
	import {MBLiteral, stringifyLiteral} from '../../../../utils/Utils';
	import {OptionInputFieldArgument} from '../../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';

	export let value: MBLiteral;
	export let options: OptionInputFieldArgument[];
	export let onValueChange: (value: MBLiteral) => void;

	export function setValue(v: MBLiteral): void {
		value = v;
	}

	function selectOption(option: MBLiteral) {
		value = option;
		onValueChange(value);
	}

	function selectOptionOnKey(event: KeyboardEvent, option: MBLiteral) {
		if (event.key === ' ') {
			selectOption(option);
		}
	}
</script>

{#each options as option}
    <div
        class="mb-select-input-element"
        class:is-selected={option.value === value}
        role="button"
        tabindex="0"
        on:click={() => selectOption(option.value)}
        on:keypress={(event) => selectOptionOnKey(event, option.value)}
    >
        {option.name}
    </div>
{/each}
