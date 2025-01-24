<script lang="ts">
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import { DomHelpers } from 'packages/core/src/utils/Utils';
	import { onDestroy } from 'svelte';

	let element: HTMLElement;

	const {
		value,
		plugin,
		filePath,
	}: {
		value: string;
		plugin: IPlugin;
		filePath: string;
	} = $props();

	let markdownUnloadCallback: (() => void) | undefined = undefined;

	onDestroy(() => {
		markdownUnloadCallback?.();
	});

	async function render(v: string): Promise<void> {
		markdownUnloadCallback?.();
		DomHelpers.empty(element);
		markdownUnloadCallback = await plugin.internal.renderMarkdown(v, element, filePath);
	}

	$effect(() => void render(value));
</script>

<div bind:this={element}></div>
