<script lang="ts">
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import ImageCard from 'packages/core/src/utils/components/ImageCard.svelte';

	const {
		plugin,
		images = [],
	}: {
		plugin: IPlugin;
		images: string[];
	} = $props();
</script>

<div class="mb-image-card-grid">
	{#each images as image}
		<ImageCard plugin={plugin} image={image}></ImageCard>
	{/each}
</div>
