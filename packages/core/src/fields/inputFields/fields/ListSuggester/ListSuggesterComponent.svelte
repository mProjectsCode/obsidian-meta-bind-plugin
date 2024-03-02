<script lang="ts">
	import Icon from '../../../../utils/components/Icon.svelte';
	import { MBLiteral, stringifyLiteral } from '../../../../utils/Literal';
	import LiteralRenderComponent from '../../../../utils/components/LiteralRenderComponent.svelte';
	import Button from '../../../../utils/components/Button.svelte';
	import { IPlugin } from '../../../../IPlugin';
	import { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';

	export let plugin: IPlugin;
	export let value: MBLiteral[];
	export let showSuggester: () => void;
	export let showTextPrompt: () => void;
	export let allowsOther: boolean;
	export let onValueChange: (value: MBLiteral[]) => void;

	export function setValue(v: MBLiteral[]): void {
		value = v;
	}

	export function addValue(v: MBLiteral): void {
		value.push(v);

		value = value;
	}

	function remove(i: number) {
		value.splice(i, 1);
		// call with copy of array
		onValueChange(value);
		// tell svelte to update
		value = value;
	}

	function suggestKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			showSuggester();
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
		<div class="mb-list-item">
			<LiteralRenderComponent value={entry}></LiteralRenderComponent>
			<Button variant={ButtonStyleType.PLAIN} on:click={e => openContextMenuForElement(e, i)}>
				<Icon plugin={plugin} iconName="more-vertical" />
			</Button>
		</div>
	{:else}
		<span class="mb-list-empty">Empty</span>
	{/each}
</div>
<div class="mb-list-input">
	<Button variant={ButtonStyleType.DEFAULT} on:click={() => showSuggester()}>Add new item</Button>
	{#if allowsOther}
		<Button variant={ButtonStyleType.DEFAULT} on:click={() => showTextPrompt()}>Add other item</Button>
	{/if}
</div>
