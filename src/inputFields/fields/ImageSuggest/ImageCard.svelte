<script lang="ts">
	import {imagePathToUri} from '../../../utils/Utils';

	export let image: string;
	export let onSelect: (item: string) => void;
</script>

<style>
	.image-card {

	}

	.image-card-image {
		width: 100%;
	}

	.image-card-text {
		display:       block;
		margin:        var(--size-4-2);
		margin-bottom: var(--size-4-4);
	}
</style>

<div class="image-card" on:click={() => onSelect(image)}>
	<img class="image-card-image" src={imagePathToUri(image)} alt={image}/>
	<span class="image-card-text">{image}</span>
</div>
