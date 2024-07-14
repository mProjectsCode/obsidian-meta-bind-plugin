<script lang="ts">
	import { OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
	import type { MBLiteral } from 'packages/core/src/utils/Literal';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<MBLiteral> & {
		options: OptionInputFieldArgument[];
	} = $props();

	let value = $state(props.value);

	export function setValue(v: MBLiteral): void {
		value = v;
	}

	function selectOption() {
		props.onValueChange(value);
	}
</script>

<select class="dropdown" bind:value={value} onchange={() => selectOption()}>
	{#each props.options as option}
		<option value={option.value}>{option.name}</option>
	{/each}
</select>
