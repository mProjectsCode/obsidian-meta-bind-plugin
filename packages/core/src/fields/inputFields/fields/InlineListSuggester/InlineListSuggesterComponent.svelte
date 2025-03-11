<script lang="ts">
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import LiteralRenderComponent from 'packages/core/src/utils/components/LiteralRenderComponent.svelte';
	import type { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import { stringifyLiteral, type MBLiteral } from 'packages/core/src/utils/Literal';

	const props: InputFieldSvelteProps<MBLiteral[]> & {
		showSuggester: () => void;
		showTextPrompt: () => void;
		allowOther: boolean;
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

	function suggest(event: MouseEvent): void {
		if (!props.allowOther) {
			props.showSuggester();
			return;
		}

		props.plugin.internal
			.createContextMenu([
				{
					name: 'From Options',
					onclick: () => props.showSuggester(),
				},
				{
					name: 'From Text',
					onclick: () => props.showTextPrompt(),
				},
			])
			.showWithEvent(event);
	}

	function suggestKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			props.showSuggester();
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
			name: 'Remove',
			icon: 'x',
			warning: true,
			onclick: () => remove(index),
		});

		props.plugin.internal.createContextMenu(menuActions).showWithEvent(e);
	}
</script>

<div class="mb-inline-list">
	{#each value as entry, i}
		<div class="mb-inline-list-item" oncontextmenu={e => openContextMenuForElement(e, i)} role="listitem" data-value={stringifyLiteral(entry)}>
			<LiteralRenderComponent value={entry}></LiteralRenderComponent>
		</div>
	{/each}
	<div class="mb-inline-list-add" onclick={suggest} onkeydown={suggestKey} role="button" tabindex="0">
		<!-- Alignment hack with zero width space -->
		<span>&#x200B;</span>
		<Icon plugin={props.plugin} iconName="plus" />
	</div>
</div>
