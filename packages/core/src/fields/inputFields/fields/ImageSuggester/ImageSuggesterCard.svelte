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
	class="mb-image-card"
	on:click={() => onSelect(image)}
	on:keydown={event => keySelect(event, image)}
	role="button"
	tabindex="0"
>
	<img class="mb-image-card-image" src={plugin.internal.imagePathToUri(image)} alt={image} />
	<div class="mb-image-card-footer">
		<span>{image}</span>
	</div>
</div>
