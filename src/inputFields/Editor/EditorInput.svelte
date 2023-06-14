<script lang="ts">
	import {MarkdownRenderer} from 'obsidian';
	import {EditorInputField} from './EditorInputField';
	import {onMount} from 'svelte';
	import MetaBindPlugin from '../../main';

	export let onValueChange: (value: any) => void;
	export let editorInput: EditorInputField;
	export let value: string;

	let focus: boolean = false;
	let renderEl: HTMLElement;
	let inputEl: HTMLElement;

	$: onValueChange(value) && render();

	onMount(() => {
		renderEl.toggleVisibility(true);
		inputEl.toggleVisibility(false);
	});

	export function updateValue(v: string): void {
		value = v;
		render();
	}

	export function render() {
		renderEl.innerHTML = '';
		if (editorInput.renderChild.plugin instanceof MetaBindPlugin) {
			MarkdownRenderer.renderMarkdown(value, renderEl, editorInput.renderChild.filePath, editorInput.renderChild);
		} else {
			renderEl.innerText = value;
		}
	}

	function focusOut(event: MouseEvent) {
		renderEl.toggleVisibility(true);
		inputEl.toggleVisibility(false);
		render();
	}

	function focusIn(event: MouseEvent) {
		console.log('focus in');
		renderEl.toggleVisibility(false);
		inputEl.toggleVisibility(true);
		inputEl.focus();
	}
</script>

<style>
	.editor-input {
		background:  var(--background-secondary);
		width:       100%;
		height:      500px;
		padding:     0;
		position:    relative;
		margin-left: 0;
	}

	.editor-input > textarea {
		background: var(--background-secondary);
		border:     none;
		padding:    var(--size-4-4) var(--size-4-8);
		margin:     0;
		position:   absolute;
		inset:      0;
		resize:     none;
	}

	.editor-input > div {
		padding:  var(--size-4-4) var(--size-4-8);
		position: absolute;
		inset:    0;
	}
</style>

<div class="editor-input card" on:click={(event) => focusIn(event)}>
	<textarea bind:this={inputEl} bind:value={value} on:focusout={(event) => focusOut(event)}></textarea>
	<div bind:this={renderEl}></div>
</div>

