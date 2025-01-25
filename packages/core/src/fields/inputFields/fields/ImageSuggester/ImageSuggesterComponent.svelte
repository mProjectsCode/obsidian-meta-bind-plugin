<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import type { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';

	const props: InputFieldSvelteProps<string | undefined> & {
		showSuggester: () => void;
		clear: () => void;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: string | undefined): void {
		value = v;
	}

	function showContextMenu(e: MouseEvent): void {
		const menuActions: ContextMenuItemDefinition[] = [];

		menuActions.push({
			name: 'Edit',
			icon: 'pencil',
			onclick: () => {
				props.showSuggester();
			},
		});

		menuActions.push({
			name: 'Remove',
			icon: 'x',
			warning: true,
			onclick: () => props.clear(),
		});

		props.plugin.internal.createContextMenu(menuActions).showWithEvent(e);
	}
</script>

{#if value}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="mb-image-card" oncontextmenu={e => showContextMenu(e)}>
		<img
			class="mb-image-card-image"
			src={props.plugin.internal.imagePathToUri(value)}
			alt={value}
			aria-label={value}
		/>
		<Button variant={ButtonStyleType.PLAIN} onclick={e => showContextMenu(e)} classes="mb-image-card-button">
			<Icon iconName="ellipsis-vertical" plugin={props.plugin} />
		</Button>
	</div>
{:else}
	<div class="mb-image-empty">
		<Button variant={ButtonStyleType.PLAIN} onclick={() => props.showSuggester()} tooltip="Select image">
			No image selected. Click to select.
		</Button>
	</div>
{/if}
