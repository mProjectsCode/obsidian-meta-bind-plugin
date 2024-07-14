<script lang="ts">
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import type { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<string[]> & {
		showSuggester: () => void;
	} = $props();

	let value = $state(props.value);

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
		props.onValueChange(value);
		// tell svelte to update
		value = value;
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
				name: 'Move left',
				icon: 'arrow-left',
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
				name: 'Move right',
				icon: 'arrow-right',
				onclick: () => {
					const temp = value[index + 1];
					value[index + 1] = value[index];
					value[index] = temp;
					props.onValueChange(value);
				},
			});
		}

		menuActions.push({
			name: 'Copy image path',
			icon: 'copy',
			onclick: () => {
				const imagePath = value[index];

				navigator.clipboard.writeText(imagePath).then(() => {
					props.plugin.internal.showNotice('Image path copied to clipboard');
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

<div class="mb-image-card-grid">
	{#each value as image, i}
		<div class="mb-image-card" oncontextmenu={e => openContextMenuForElement(e, i)} role="listitem">
			<img class="mb-image-card-image" src={props.plugin.internal.imagePathToUri(image)} alt={image} />
			<div class="mb-image-card-footer">
				<span>{image}</span>
			</div>
		</div>
	{/each}
</div>
<div class="mb-list-input">
	<Button variant={ButtonStyleType.DEFAULT} on:click={() => props.showSuggester()}>Add new image</Button>
</div>
