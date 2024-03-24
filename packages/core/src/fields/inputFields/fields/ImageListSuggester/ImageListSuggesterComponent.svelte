<script lang="ts">
	import Icon from '../../../../utils/components/Icon.svelte';
	import Button from '../../../../utils/components/Button.svelte';
	import { IPlugin } from '../../../../IPlugin';
	import { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';

	export let plugin: IPlugin;
	export let value: string[];
	export let showSuggester: () => void;
	export let onValueChange: (value: string[]) => void;

	export function setValue(v: string[]): void {
		value = v;
	}

	export function addValue(v: string): void {
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
			name: 'Copy image path',
			icon: 'copy',
			onclick: () => {
				const imagePath = value[index];

				navigator.clipboard.writeText(imagePath).then(() => {
					plugin.internal.showNotice('Image path copied to clipboard');
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

<div class="mb-image-card-grid">
	{#each value as image, i}
		<div class="mb-image-card" on:contextmenu={e => openContextMenuForElement(e, i)} role="listitem">
			<img class="mb-image-card-image" src={plugin.internal.imagePathToUri(image)} alt={image} />
			<div class="mb-image-card-footer">
				<span>{image}</span>
			</div>
		</div>
	{/each}
</div>
<div class="mb-list-input">
	<Button variant={ButtonStyleType.DEFAULT} on:click={() => showSuggester()}>Add new image</Button>
</div>
