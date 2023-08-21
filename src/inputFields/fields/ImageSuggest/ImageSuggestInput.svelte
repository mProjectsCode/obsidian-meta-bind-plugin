<script lang="ts">
	import {imagePathToUri} from '../../../utils/Utils';

	export let showSuggest: () => void;

	let image: string;

	export function updateValue(value: string): void {
		console.log('svelte update');
		image = value;
	}

	function suggest(event: MouseEvent): void {
		showSuggest();
	}

	function suggestKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			showSuggest();
		}
	}
</script>

<style>
	.image-suggest-input {
		background:    var(--background-secondary);
		border-radius: var(--meta-bind-plugin-border-radius);
		border:        var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
		padding:       var(--size-4-2);
		width:         100%;
	}

	.image-suggest-image {
		width: 100%;
	}

	.image-suggest-footer {
		display:        flex;
		flex-direction: row;
		color:          var(--text-normal);
		align-items:    baseline;
	}

	.image-suggest-footer-text {
		flex:        1;
		margin-left: var(--size-4-2);
	}
</style>

<div class="image-suggest-input">
	{#if image}
		<img class="image-suggest-image" src={imagePathToUri(image)} alt={image}/>
	{/if}
	<div class="image-suggest-footer">
		<span class="image-suggest-footer-text">{image || 'no image selected'}</span>
		<button
			class="btn btn-active"
			on:click={suggest}
			on:keydown={suggestKey}>
			change image
		</button>
	</div>
</div>
