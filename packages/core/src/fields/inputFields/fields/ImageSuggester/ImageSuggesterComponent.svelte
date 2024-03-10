<script lang="ts">
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let plugin: IPlugin;

	export let value: string;
	export let showSuggester: () => void;
	export let onValueChange: (value: string) => void;

	export function setValue(v: string): void {
		value = v;
	}

	function openSuggester(event: MouseEvent) {
		showSuggester();
	}

	function openSuggesterOnKey(event: KeyboardEvent) {
		if (event.key === ' ') {
			showSuggester();
		}
	}
</script>

<div class="mb-image-suggest-input">
	{#if value}
		<img class="mb-image-suggest-image" src={plugin.internal.imagePathToUri(value)} alt={value} />
	{/if}
	<div class="mb-image-suggest-footer">
		<span class="mb-image-suggest-footer-text">{value || 'no image selected'}</span>
		<button class="btn btn-active" on:click={openSuggester} on:keydown={openSuggesterOnKey}> Change Image</button>
	</div>
</div>
