<script lang='ts'>
	import { MBLiteral } from '../../../../utils/Utils';
	import {
		OptionInputFieldArgument
	} from '../../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
	import { Button, TextInput } from 'obsidian-svelte';
	import Icon from '../../../../utils/Icon.svelte';

	export let value: MBLiteral[];
	export let limit: number | undefined;
	export let placeholder: string;
	export let onValueChange: (value: MBLiteral[]) => void;

	let addValue: string = '';

	export function setValue(v: MBLiteral[]): void {
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

	function getLimitString(length: number, limit: number) {
		const limitStr = limit.toString();
		const lengthStr = length.toString().padStart(limitStr.length, '0');
		return `${lengthStr}/${limitStr}`;
	}
</script>

<div class='mb-list-items'>
	{#each value as entry, i}
		<div class='mb-list-item'>
			<span>{entry}</span>
			<Button on:click={() => remove(i)}>
				<Icon iconName='x' />
			</Button>
		</div>
	{:else}
		<span class='mb-list-empty'>Empty</span>
	{/each}
</div>
<div class='mb-list-input'>
	<input type='text' tabindex='0' placeholder={placeholder} bind:value={addValue} maxlength={limit}>
	{#if limit !== undefined}
		<span class={`mb-content-limit-indicator ${value.length > limit ? 'mb-content-limit-indicator-overflow' : ''}`} >{getLimitString(value.length, limit)}</span>
	{/if}
	<Button on:click={() => add()} disabled={!addValue}>
		<Icon iconName='plus' />
	</Button>
</div>

