<script lang="ts">
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let plugin: IPlugin;
	export let image: string;
</script>

<div class="mb-image-card">
	<img class="mb-image-card-image" src={plugin.internal.imagePathToUri(image)} alt={image} />
</div>
