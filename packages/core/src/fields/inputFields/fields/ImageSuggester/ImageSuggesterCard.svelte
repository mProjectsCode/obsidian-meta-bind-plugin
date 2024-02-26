<script lang="ts">
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let plugin: IPlugin;
	export let image: string;
	export let onSelect: (item: string) => void;

	function keySelect(event: KeyboardEvent, image: string): void {
		if (event.key === ' ') {
			onSelect(image);
		}
	}
</script>

<div
	class="image-card"
	on:click={() => onSelect(image)}
	on:keydown={event => keySelect(event, image)}
	role="button"
	tabindex="0"
>
	<img class="image-card-image" src={plugin.internal.imagePathToUri(image)} alt={image} />
	<span class="image-card-text">{image}</span>
</div>

<style>
	.image-card-image {
		width: 100%;
		height: fit-content;
		max-height: 500px;
		object-fit: contain;
	}

	.image-card-text {
		display: block;
		margin: var(--size-4-2);
		margin-bottom: var(--size-4-4);
	}
</style>
