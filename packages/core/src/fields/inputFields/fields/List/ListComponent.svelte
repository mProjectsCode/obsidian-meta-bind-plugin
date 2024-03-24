<script lang="ts">
	import Icon from '../../../../utils/components/Icon.svelte';
	import { MBLiteral, stringifyLiteral } from '../../../../utils/Literal';
	import LiteralRenderComponent from '../../../../utils/components/LiteralRenderComponent.svelte';
	import Button from '../../../../utils/components/Button.svelte';
	import { IPlugin } from '../../../../IPlugin';
	import { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import { ButtonStyleType } from '../../../../config/ButtonConfig';

	export let plugin: IPlugin;
	export let value: MBLiteral[];
	export let limit: number | undefined;
	export let placeholder: string;
	// TODO: implement multiLine support
	export let multiLine: boolean;
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

	function openContextMenuForElement(e: MouseEvent, index: number) {
		const menuActions: ContextMenuItemDefinition[] = [];

		if (index > 0) {
			menuActions.push({
				name: 'Move up',
				icon: 'arrow-up',
				onclick: () => {
					const temp = value[index - 1];
					value[index - 1] = value[index];
					value[index] = temp;
					onValueChange(value);
				},
			});
		}

		if (index < value.length - 1) {
			menuActions.push({
				name: 'Move down',
				icon: 'arrow-down',
				onclick: () => {
					const temp = value[index + 1];
					value[index + 1] = value[index];
					value[index] = temp;
					onValueChange(value);
				},
			});
		}

		menuActions.push({
			name: 'Edit',
			icon: 'pencil',
			onclick: () => {
				plugin.internal.openTextPromptModal({
					title: 'Meta Bind List',
					subTitle: 'Edit the value of a list item.',
					value: stringifyLiteral(value[index]),
					multiline: multiLine,
					onSubmit: (v: MBLiteral) => {
						value[index] = v;
						onValueChange(value);
					},
					onCancel: () => {},
				});
			},
		});

		menuActions.push({
			name: 'Remove',
			icon: 'x',
			warning: true,
			onclick: () => remove(index),
		});

		plugin.internal.createContextMenu(menuActions).showWithEvent(e);
	}
</script>

<div class="mb-list-items">
	{#each value as entry, i}
		<div class="mb-list-item" on:contextmenu={e => openContextMenuForElement(e, i)} role="listitem">
			<LiteralRenderComponent value={entry}></LiteralRenderComponent>
		</div>
	{:else}
		<span class="mb-list-empty">Empty</span>
	{/each}
</div>
<div class="mb-list-input">
	{#if multiLine}
		<textarea tabindex="0" placeholder={placeholder} bind:value={addValue} maxlength={limit} />
	{:else}
		<input
			type="text"
			tabindex="0"
			placeholder={placeholder}
			bind:value={addValue}
			maxlength={limit}
			on:keyup={e => {
				if (e.key === 'Enter' && addValue.length > 0) {
					add();
				}
			}}
		/>
	{/if}
	{#if limit !== undefined}
		<span class={`mb-content-limit-indicator ${value.length > limit ? 'mb-content-limit-indicator-overflow' : ''}`}
			>{getLimitString(value.length, limit)}</span
		>
	{/if}
	<Button on:click={() => add()} disabled={!addValue}>
		<Icon plugin={plugin} iconName="plus" />
	</Button>
</div>
