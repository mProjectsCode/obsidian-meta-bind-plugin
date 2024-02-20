<script lang="ts">
	import ImageSuggesterCard from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterCard.svelte';
	import { SuggesterOption } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
	import { prepareFuzzySearch } from 'obsidian';

	export let options: SuggesterOption<string>[];
	export let onSelect: (item: string) => void;

	let search = '';
	let filteredOptions: SuggesterOption<string>[];

	$: runSearch(search);

	function runSearch(search: string): void {
		if (!search) {
			filteredOptions = options;
			return;
		}

		const searchFn = prepareFuzzySearch(search);

		let x: SuggesterOption<string>[] = [];
		for (const option of options) {
			if (searchFn(option.value)?.score !== undefined) {
				x.push(option);
			}
		}

		filteredOptions = x;
	}
</script>

<div class="mb-image-search-container">
	<input type="text" bind:value={search} placeholder="Search Images..." />
</div>
<div class="mb-image-card-grid">
	{#each filteredOptions as option}
		<ImageSuggesterCard image={option.value} onSelect={onSelect}></ImageSuggesterCard>
	{/each}
</div>

<style>
</style>
