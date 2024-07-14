<script lang="ts">
	import type { MBLiteral } from 'packages/core/src/utils/Literal';
	import LiteralRenderComponent from 'packages/core/src/utils/components/LiteralRenderComponent.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import type { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';

	const props: InputFieldSvelteProps<MBLiteral[]> & {
		showSuggester: () => void;
		showTextPrompt: () => void;
		allowOther: boolean;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: MBLiteral[]): void {
		value = v;
	}

	export function addValue(v: MBLiteral): void {
		value.push(v);
		props.onValueChange(value);
	}

	function remove(i: number) {
		value.splice(i, 1);
		props.onValueChange(value);
	}

	function suggestKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			props.showSuggester();
		}
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
	<Button variant={ButtonStyleType.DEFAULT} on:click={() => props.showSuggester()}>Add new item</Button>
	{#if props.allowOther}
		<Button variant={ButtonStyleType.DEFAULT} on:click={() => props.showTextPrompt()}>Add other item</Button>
	{/if}
</div>
