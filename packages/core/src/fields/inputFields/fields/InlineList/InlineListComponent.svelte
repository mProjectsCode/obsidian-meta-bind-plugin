<script lang="ts">
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import LiteralRenderComponent from 'packages/core/src/utils/components/LiteralRenderComponent.svelte';
	import type { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import type { MBLiteral } from 'packages/core/src/utils/Literal';
	import { stringifyLiteral } from 'packages/core/src/utils/Literal';

	const props: InputFieldSvelteProps<MBLiteral[]> & {
		showInput: () => void;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: MBLiteral[]): void {
		value = v;
	}

	export function pushValue(v: MBLiteral): void {
		value.push(v);
		props.onValueChange($state.snapshot(value));
	}

	function remove(i: number): void {
		value.splice(i, 1);
		props.onValueChange($state.snapshot(value));
	}

	function inputKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			props.showInput();
		}
	}

	function openContextMenuForElement(e: MouseEvent, index: number): void {
		const menuActions: ContextMenuItemDefinition[] = [];

		if (index > 0) {
			menuActions.push({
				name: 'Move left',
				icon: 'arrow-left',
				onclick: () => {
					const temp = value[index - 1];
					value[index - 1] = value[index];
					value[index] = temp;
					props.onValueChange($state.snapshot(value));
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
					props.onValueChange($state.snapshot(value));
				},
			});
		}

		menuActions.push({
			name: 'Edit',
			icon: 'pencil',
			onclick: () => {
				props.mb.internal.openTextPromptModal({
					title: 'Meta Bind List',
					subTitle: 'Edit the value of a list item.',
					value: stringifyLiteral(value[index]),
					multiline: false,
					onSubmit: (v: MBLiteral) => {
						value[index] = v;
						props.onValueChange($state.snapshot(value));
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

		props.mb.internal.createContextMenu(menuActions).showWithEvent(e);
	}
</script>

<div class="mb-inline-list">
	{#each value as entry, i}
		<div
			class="mb-inline-list-item"
			oncontextmenu={e => openContextMenuForElement(e, i)}
			role="listitem"
			data-value={stringifyLiteral(entry)}
		>
			<LiteralRenderComponent value={entry}></LiteralRenderComponent>
		</div>
	{/each}
	<div class="mb-inline-list-add" onclick={() => props.showInput()} onkeydown={inputKey} role="button" tabindex="0">
		<!-- Alignment hack with zero width space -->
		<span>&#x200B;</span>
		<Icon mb={props.mb} iconName="plus" />
	</div>
</div>
