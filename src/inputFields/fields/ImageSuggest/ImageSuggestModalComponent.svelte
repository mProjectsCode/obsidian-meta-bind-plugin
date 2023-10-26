<script lang='ts'>
	import ImageCard from './ImageCard.svelte';

	export let options: string[];
	export let onSelect: (item: string) => void;
</script>

<style>
    .image-card-grid {
        display:               grid;
        grid-template-columns: repeat(auto-fit, minmax(min(500px, 100%), 1fr));
        gap:                   var(--size-4-4);
    }
</style>

<div class='image-card-grid'>
	{#each options as option}
		<ImageCard image={option} onSelect={onSelect}></ImageCard>
	{/each}
</div>
