<script lang="ts">
	import ImageCard from 'packages/core/src/utils/components/ImageCard.svelte';
	import type { MetaBind } from '../..';

	let {
		mb,
		images = [],
	}: {
		mb: MetaBind;
		images: { link: string; internal: boolean }[];
	} = $props();

	export function updateImages(newImages: { link: string; internal: boolean }[]) {
		images = newImages;
	}
</script>

<div class="mb-image-card-grid">
	{#each images as image}
		<ImageCard mb={mb} image={image.link} internal={image.internal}></ImageCard>
	{:else}
		<span>No images</span>
	{/each}
</div>
