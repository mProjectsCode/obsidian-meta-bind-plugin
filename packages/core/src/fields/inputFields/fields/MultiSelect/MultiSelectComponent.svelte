<script lang="ts">
	import type { OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import LiteralRenderComponent from 'packages/core/src/utils/components/LiteralRenderComponent.svelte';
	import { stringifyLiteral, type MBLiteral } from 'packages/core/src/utils/Literal';

	const props: InputFieldSvelteProps<MBLiteral[]> & {
		options: OptionInputFieldArgument[];
	} = $props();

	let value = $state(props.value);

	export function setValue(v: MBLiteral[]): void {
		value = v;
	}

	function selectOption(option: MBLiteral): void {
		if (value.includes(option)) {
			value = value.filter(x => x !== option);
		} else {
			value.push(option);
		}

		props.onValueChange($state.snapshot(value));
	}

	function selectOptionOnKey(event: KeyboardEvent, option: MBLiteral): void {
		if (event.key === ' ') {
			selectOption(option);
		}
	}
</script>

{#each props.options as option}
	<div
		class="mb-select-input-element mb-mod-multi"
		class:is-selected={value.includes(option.value)}
		role="button"
		tabindex="0"
		onclick={e => {
			if (e.target instanceof HTMLInputElement) {
				return;
			}
			selectOption(option.value);
		}}
		onkeypress={event => selectOptionOnKey(event, option.value)}
		data-value={stringifyLiteral(option.value)}
	>
		<input type="checkbox" checked={value.includes(option.value)} oninput={() => selectOption(option.value)} />
		<LiteralRenderComponent value={option.name}></LiteralRenderComponent>
	</div>
{/each}
