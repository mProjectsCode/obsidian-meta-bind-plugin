<script lang="ts">
	import ImageCard from 'packages/core/src/utils/components/ImageCard.svelte';
	import type { IPlugin } from 'packages/core/src/IPlugin';

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
