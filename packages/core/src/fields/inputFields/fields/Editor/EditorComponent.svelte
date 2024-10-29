<script lang="ts">
	import MarkdownRenderComponent from 'packages/core/src/fields/inputFields/fields/Editor/MarkdownRenderComponent.svelte';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<string> & {
		render: (el: HTMLElement, value: string) => void;
		filePath: string;
	} = $props();

	let value = $state(props.value);
	let editing = $state(false);

	export function setValue(v: string): void {
		value = v;
	}

	function focusOut(): void {
		editing = false;
	}

	function focusIn(): void {
		editing = true;
	}

	function focusInOnKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			focusIn();
		}
	}
</script>

<div
	class="mb-editor-input card"
	onclick={() => focusIn()}
	onkeypress={event => focusInOnKey(event)}
	role="button"
	tabindex="0"
>
	{#if editing}
		<textarea bind:value={value} onfocusout={() => focusOut()} oninput={() => props.onValueChange(value)}
		></textarea>
	{:else}
		<MarkdownRenderComponent value={value} plugin={props.plugin} filePath={props.filePath}
		></MarkdownRenderComponent>
	{/if}
</div>
