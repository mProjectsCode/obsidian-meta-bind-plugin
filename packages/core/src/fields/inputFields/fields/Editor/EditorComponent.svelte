<script lang="ts">
	import { onMount } from 'svelte';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

	const props: InputFieldSvelteProps<string> & {
		render: (el: HTMLElement, value: string) => void;
	} = $props();

	let value = $state(props.value);

	let renderEl: HTMLElement;
	let inputEl: HTMLElement;

	onMount(() => {
		renderEl.style.display = 'block';
		inputEl.style.display = 'none';
		props.render(renderEl, value);
	});

	export function setValue(v: string): void {
		value = v;
		props.render(renderEl, v);
	}

	function focusOut() {
		renderEl.style.display = 'block';
		inputEl.style.display = 'none';
		props.render(renderEl, value);
	}

	function focusIn() {
		// console.log('focus in');
		renderEl.style.display = 'none';
		inputEl.style.display = 'block';
		inputEl.focus();
	}

	function focusInOnKey(event: KeyboardEvent) {
		if (event.key === ' ') {
			focusIn();
		}
	}
</script>

<div
	class="editor-input card"
	onclick={() => focusIn()}
	onkeypress={event => focusInOnKey(event)}
	role="button"
	tabindex="0"
>
	<textarea
		bind:this={inputEl}
		bind:value={value}
		onfocusout={() => focusOut()}
		oninput={() => props.onValueChange(value)}
	></textarea>
	<div bind:this={renderEl}></div>
</div>

<style>
	.editor-input {
		background: var(--background-secondary);
		width: 100%;
		height: 500px;
		padding: 0;
		position: relative;
		margin-left: 0;
		overflow: scroll;
	}

	.editor-input > textarea {
		background: var(--background-secondary);
		border: none;
		padding: var(--size-4-4) var(--size-4-8);
		margin: 0;
		position: absolute;
		inset: 0;
		resize: none;
		border-radius: 0;
	}

	.editor-input > div {
		padding: var(--size-4-4) var(--size-4-8);
		position: absolute;
		inset: 0;
	}
</style>
