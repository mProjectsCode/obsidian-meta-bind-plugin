<script lang='ts'>

	import ImageSuggesterCard from './ImageSuggesterCard.svelte';
	import { SuggesterOption } from '../Suggester/SuggesterHelper';

	export let options: SuggesterOption<string>[];
	export let onSelect: (item: string) => void;
</script>

<style>
    .mb-image-card-grid {
        display:               grid;
        grid-template-columns: repeat(auto-fit, minmax(min(500px, 100%), 1fr));
        gap:                   var(--size-4-4);
    }
</style>

<div class='mb-image-card-grid'>
	{#each options as option}
		<ImageSuggesterCard image={option.value} onSelect={onSelect}></ImageSuggesterCard>
	{/each}
</div>
