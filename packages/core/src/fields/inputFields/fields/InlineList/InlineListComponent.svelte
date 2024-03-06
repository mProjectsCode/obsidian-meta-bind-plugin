<script lang="ts">
	import Icon from '../../../../utils/components/Icon.svelte';
	import { MBLiteral, stringifyLiteral } from '../../../../utils/Literal';
	import LiteralRenderComponent from '../../../../utils/components/LiteralRenderComponent.svelte';
	import { IPlugin } from '../../../../IPlugin';
	import { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';

	export let plugin: IPlugin;
	export let value: MBLiteral[];
	export let showInput: () => void;
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

	function inputKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			showInput();
		}
	}

	function openContextMenuForElement(e: MouseEvent, index: number) {
		const menuActions: ContextMenuItemDefinition[] = [];

		if (index > 0) {
			menuActions.push({
				name: 'Move left',
				icon: 'arrow-left',
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
				name: 'Move right',
				icon: 'arrow-right',
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
					multiline: false,
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

<div class="mb-inline-list">
	{#each value as entry, i}
		<div class="mb-inline-list-item">
			<LiteralRenderComponent value={entry}></LiteralRenderComponent>
			<button class="mb-inline-list-item-button" on:click={e => openContextMenuForElement(e, i)}>
				<Icon plugin={plugin} iconName="more-vertical" />
			</button>
		</div>
	{/each}
	<div class="mb-inline-list-add" on:click={() => showInput()} on:keydown={inputKey} role="button" tabindex="0">
		<!-- Alignment hack with zero width space -->
		<span>&#x200B;</span>
		<Icon plugin={plugin} iconName="plus" />
	</div>
</div>
