<script lang="ts">
	import ImageSuggesterCard from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterCard.svelte';
	import { SuggesterOption } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let plugin: IPlugin;
	export let options: SuggesterOption<string>[];
	export let onSelect: (item: string) => void;

	let search = '';
	let filteredOptions: SuggesterOption<string>[];
	let fuzzySearch = plugin.internal.createFuzzySearch();

	$: runSearch(search);

	function runSearch(search: string): void {
		if (!search) {
			filteredOptions = options;
			return;
		}

		fuzzySearch.setSearch(search);

		filteredOptions = fuzzySearch.filterItems(options, x => x.value);
	}
</script>

<div class="mb-image-search-container">
	<input type="text" bind:value={search} placeholder="Search Images..." />
</div>
<div class="mb-image-card-grid">
	{#each filteredOptions as option}
		<ImageSuggesterCard plugin={plugin} image={option.value} onSelect={onSelect}></ImageSuggesterCard>
	{/each}
</div>

<style>
</style>
