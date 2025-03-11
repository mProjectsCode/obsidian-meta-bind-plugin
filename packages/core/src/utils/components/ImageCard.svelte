<script lang="ts">
	import type { MetaBind } from '../..';

	const {
		mb,
		image,
		internal = true,
	}: {
		mb: MetaBind;
		image: string;
		internal?: boolean;
	} = $props();

	let imageUri = $derived(internal ? mb.internal.imagePathToUri(image) : image);
</script>

<div class="mb-image-card">
	<img class="mb-image-card-image" src={imageUri} alt={image} />
</div>
