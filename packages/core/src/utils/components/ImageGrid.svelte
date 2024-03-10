<script lang="ts">
	import ImageCard from 'packages/core/src/utils/components/ImageCard.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let images: string[] = [];
	export let plugin: IPlugin;
</script>

<div class="mb-image-card-grid">
	{#each images as image}
		<ImageCard plugin={plugin} image={image}></ImageCard>
	{/each}
</div>
