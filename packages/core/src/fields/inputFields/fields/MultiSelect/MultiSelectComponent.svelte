<script lang="ts">
	import { OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
	import { MBLiteral } from '../../../../utils/Literal';
	import LiteralRenderComponent from '../../../../utils/components/LiteralRenderComponent.svelte';
	import { IPlugin } from '../../../../IPlugin';

	export let plugin: IPlugin;
	export let value: MBLiteral[];
	export let options: OptionInputFieldArgument[];
	export let onValueChange: (value: MBLiteral[]) => void;

	export function setValue(v: MBLiteral[]): void {
		value = v;
	}

	function selectOption(option: MBLiteral) {
		if (value.includes(option)) {
			value = value.filter(x => x !== option);
		} else {
			value.push(option);
			value = value;
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
		class="mb-select-input-element mb-mod-multi"
		class:is-selected={value.includes(option.value)}
		role="button"
		tabindex="0"
		on:click={e => {
			if (e.target instanceof HTMLInputElement) {
				return;
			}
			selectOption(option.value);
		}}
		on:keypress={event => selectOptionOnKey(event, option.value)}
	>
		<input type="checkbox" checked={value.includes(option.value)} on:input={() => selectOption(option.value)} />
		<LiteralRenderComponent value={option.name}></LiteralRenderComponent>
	</div>
{/each}
