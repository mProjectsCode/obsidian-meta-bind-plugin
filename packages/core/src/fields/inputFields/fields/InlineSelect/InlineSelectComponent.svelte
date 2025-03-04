<script lang="ts">
	import type { OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import type { MBLiteral } from 'packages/core/src/utils/Literal';

	const props: InputFieldSvelteProps<MBLiteral> & {
		options: OptionInputFieldArgument[];
	} = $props();

	let value = $state(props.value);

	export function setValue(v: MBLiteral): void {
		value = v;
	}

	function selectOption(): void {
		props.onValueChange($state.snapshot(value));
	}
</script>

<select class="dropdown" bind:value={value} onchange={() => selectOption()}>
	{#each props.options as option}
		<option value={option.value}>{option.name}</option>
	{/each}
</select>
