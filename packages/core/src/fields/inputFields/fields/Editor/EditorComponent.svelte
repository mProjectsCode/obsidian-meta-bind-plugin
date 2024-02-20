<script lang="ts">
	import { onMount } from 'svelte';
	import { IPlugin } from '../../../../IPlugin';

	export let plugin: IPlugin;
	export let value: string;
	export let onValueChange: (value: any) => void;
	export let render: (el: HTMLElement, value: string) => void;

	let renderEl: HTMLElement;
	let inputEl: HTMLElement;

	onMount(() => {
		renderEl.style.display = 'block';
		inputEl.style.display = 'none';
		render(renderEl, value);
	});

	export function setValue(v: string): void {
		value = v;
		render(renderEl, v);
	}

	function focusOut() {
		renderEl.style.display = 'block';
		inputEl.style.display = 'none';
		render(renderEl, value);
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
	on:click={() => focusIn()}
	on:keypress={event => focusInOnKey(event)}
	role="button"
	tabindex="0"
>
	<textarea
		bind:this={inputEl}
		bind:value={value}
		on:focusout={() => focusOut()}
		on:input={() => onValueChange(value)}
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
