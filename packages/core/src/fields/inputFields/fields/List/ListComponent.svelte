<script lang="ts">
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import { type MBLiteral, stringifyLiteral } from 'packages/core/src/utils/Literal';
	import LiteralRenderComponent from 'packages/core/src/utils/components/LiteralRenderComponent.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import type { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<MBLiteral[]> & {
		limit: number | undefined;
		placeholder: string;
		multiLine: boolean;
	} = $props();

	let value = $state(props.value);

	let addValue = $state('');

	export function setValue(v: MBLiteral[]): void {
		value = v;
	}

	function add() {
		value.push(addValue);
		props.onValueChange(value);

		addValue = '';
	}

	function remove(i: number) {
		value.splice(i, 1);
		props.onValueChange(value);
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
					props.onValueChange(value);
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
					props.onValueChange(value);
				},
			});
		}

		menuActions.push({
			name: 'Edit',
			icon: 'pencil',
			onclick: () => {
				props.plugin.internal.openTextPromptModal({
					title: 'Meta Bind List',
					subTitle: 'Edit the value of a list item.',
					value: stringifyLiteral(value[index]),
					multiline: props.multiLine,
					onSubmit: (v: MBLiteral) => {
						value[index] = v;
						props.onValueChange(value);
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

		props.plugin.internal.createContextMenu(menuActions).showWithEvent(e);
	}
</script>

<div class="mb-list-items">
	{#each value as entry, i}
		<div class="mb-list-item" oncontextmenu={e => openContextMenuForElement(e, i)} role="listitem">
			<LiteralRenderComponent value={entry}></LiteralRenderComponent>
		</div>
	{:else}
		<span class="mb-list-empty">Empty</span>
	{/each}
</div>
<div class="mb-list-input">
	{#if props.multiLine}
		<textarea tabindex="0" placeholder={props.placeholder} bind:value={addValue} maxlength={props.limit}></textarea>
	{:else}
		<input
			type="text"
			tabindex="0"
			placeholder={props.placeholder}
			bind:value={addValue}
			maxlength={props.limit}
			onkeyup={e => {
				if (e.key === 'Enter' && addValue.length > 0) {
					add();
				}
			}}
		/>
	{/if}
	{#if props.limit !== undefined}
		<span
			class={`mb-content-limit-indicator ${value.length > props.limit ? 'mb-content-limit-indicator-overflow' : ''}`}
			>{getLimitString(value.length, props.limit)}</span
		>
	{/if}
	<Button on:click={() => add()} disabled={!addValue}>
		<Icon plugin={props.plugin} iconName="plus" />
	</Button>
</div>
