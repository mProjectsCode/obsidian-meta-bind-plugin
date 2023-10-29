<script lang='ts'>
	import { onMount } from 'svelte';

	export let value: string;
	export let onValueChange: (value: any) => void;
	export let render: (el: HTMLElement, value: string) => void;

	let renderEl: HTMLElement;
	let inputEl: HTMLElement;

	onMount(() => {
		renderEl.toggleVisibility(true);
		inputEl.toggleVisibility(false);
		render(renderEl, value);
	});


	export function setValue(v: string): void {
		value = v;
		render(renderEl, v);
	}

	function focusOut() {
		renderEl.toggleVisibility(true);
		inputEl.toggleVisibility(false);
		render(renderEl, value);
	}

	function focusIn() {
		console.log('focus in');
		renderEl.toggleVisibility(false);
		inputEl.toggleVisibility(true);
		inputEl.focus();
	}

	function focusInOnKey(event: KeyboardEvent) {
		if (event.key === ' ') {
			focusIn();
		}
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

<div class='editor-input card' on:click={() => focusIn()} on:keypress={(event) => focusInOnKey(event)} role='button'
	 tabindex='0'>
	<textarea bind:this={inputEl} bind:value={value} on:focusout={() => focusOut()}
			  on:input={() => onValueChange(value)}></textarea>
	<div bind:this={renderEl}></div>
</div>
