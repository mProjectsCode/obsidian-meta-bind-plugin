<script lang="ts">
	import type { IPlugin } from 'packages/core/src/IPlugin';

	const {
		plugin,
		image,
	}: {
		plugin: IPlugin;
		image: string;
	} = $props();
</script>

<div class="mb-image-card">
	<img class="mb-image-card-image" src={plugin.internal.imagePathToUri(image)} alt={image} />
</div>
