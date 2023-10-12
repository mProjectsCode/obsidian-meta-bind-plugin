<script lang="ts">
	import {ListInputField} from './ListInputField';
	import Icon from '../../../utils/Icon.svelte';
	import {Button, TextInput} from 'obsidian-svelte';

	import {InputFieldArgumentType} from '../../../parsers/inputFieldParser/InputFieldConfigs';

	export let value: string[] = [];
	export let onValueChange: (value: any) => void;
	export let listInput: ListInputField;

	let addValue: string = '';

	let placeholder = listInput.renderChild.getArgument(InputFieldArgumentType.PLACEHOLDER);

	export function updateValue(v: string[]) {
		value = v;
	}

	function add() {
		value.push(addValue);
		// call with copy of array
		onValueChange(value);
		addValue = '';
		// tell svelte to update
		value = value;
	}

	function remove(i: number) {
		value.splice(i, 1);
		// call with copy of array
		onValueChange(value);
		// tell svelte to update
		value = value;
	}
</script>

<div class="mb-list-items">
	{#each value as entry, i}
		<div class="mb-list-item">
			<span>{entry}</span>
			<Button on:click={() => remove(i)}>
				<Icon iconName="x"/>
			</Button>
		</div>
	{:else}
		<span class="mb-list-empty">Empty</span>
	{/each}
</div>
<div class="mb-list-input">
	<TextInput bind:value={addValue} placeholder="{placeholder?.value ?? 'add entry...'}" width="100%"></TextInput>
	<Button on:click={() => add()} disabled="{!addValue}">
		<Icon iconName="plus"/>
	</Button>
</div>

