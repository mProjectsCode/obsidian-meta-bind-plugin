<script lang="ts">
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import { onMount } from 'svelte';

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

	function focusOut(): void {
		renderEl.style.display = 'block';
		inputEl.style.display = 'none';
		props.render(renderEl, value);
	}

	function focusIn(): void {
		// console.log('focus in');
		renderEl.style.display = 'none';
		inputEl.style.display = 'block';
		inputEl.focus();
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
	<textarea
		bind:this={inputEl}
		bind:value={value}
		onfocusout={() => focusOut()}
		oninput={() => props.onValueChange(value)}
	></textarea>
	<div bind:this={renderEl}></div>
</div>
