<script lang="ts">
	import ImageSuggesterCard from './ImageSuggesterCard.svelte';
	import { SuggesterOption } from '../Suggester/SuggesterHelper';
	import {TextInput} from 'obsidian-svelte';
	import {prepareFuzzySearch} from 'obsidian';

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

		let x: SuggesterOption<string>[] = []
		for (const option of options) {
			if (searchFn(option.value)?.score !== undefined) {
				x.push(option);
			}
		}

		filteredOptions = x;
	}
</script>

<div class="mb-image-search-container">
	<TextInput bind:value={search} placeholder="Search Images..."></TextInput>
</div>
<div class="mb-image-card-grid">
	{#each filteredOptions as option}
		<ImageSuggesterCard image={option.value} onSelect={onSelect}></ImageSuggesterCard>
	{/each}
</div>

<style>

</style>
