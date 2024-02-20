<script lang="ts">
	import { OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
	import { MBLiteral } from '../../../../utils/Literal';
	import LiteralRenderComponent from '../../../../utils/components/LiteralRenderComponent.svelte';
	import { IPlugin } from '../../../../IPlugin';

	export let plugin: IPlugin;
	export let value: MBLiteral;
	export let options: OptionInputFieldArgument[];
	export let onValueChange: (value: MBLiteral) => void;

	export function setValue(v: MBLiteral): void {
		value = v;
	}

	function selectOption(option: MBLiteral) {
		if (value === option) {
			value = null;
		} else {
			value = option;
		}
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
		on:keypress={event => selectOptionOnKey(event, option.value)}
	>
		<LiteralRenderComponent value={option.name}></LiteralRenderComponent>
	</div>
{/each}
