<script lang="ts">
	import type { IPlugin } from 'packages/core/src/IPlugin';

	const {
		plugin,
		image,
		internal = true,
	}: {
		plugin: IPlugin;
		image: string;
		internal?: boolean;
	} = $props();

	let imageUri = $derived(internal ? plugin.internal.imagePathToUri(image) : image);
</script>

<div class="mb-image-card">
	<img class="mb-image-card-image" src={imageUri} alt={image} />
</div>
