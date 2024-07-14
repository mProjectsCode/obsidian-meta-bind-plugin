<script lang="ts">
	import ImageSuggesterCard from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterCard.svelte';
	import type { SuggesterOption } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
	import type { IPlugin } from 'packages/core/src/IPlugin';

	const {
		plugin,
		options,
		onSelect,
	}: {
		plugin: IPlugin;
		options: SuggesterOption<string>[];
		onSelect: (item: string) => void;
	} = $props();

	let search = $state('');
	let fuzzySearch = plugin.internal.createFuzzySearch();

	let filteredOptions: SuggesterOption<string>[] = $derived.by(() => {
		if (!search) {
			return options;
		}

		fuzzySearch.setSearch(search);

		return fuzzySearch.filterItems(options, x => x.value);
	});
</script>

<div class="mb-image-search-container">
	<input type="text" bind:value={search} placeholder="Search Images..." />
</div>
<div class="mb-image-card-grid">
	{#each filteredOptions as option}
		<ImageSuggesterCard plugin={plugin} image={option.value} onSelect={onSelect}></ImageSuggesterCard>
	{/each}
</div>
