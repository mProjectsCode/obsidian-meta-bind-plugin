<script lang="ts">
	import ImageSuggesterCard from 'packages/core/src/modals/modalContents/ImageSuggesterModalCard.svelte';
	import type { SuggesterOption } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import Button from '../../utils/components/Button.svelte';
	import { ButtonStyleType } from '../../config/ButtonConfig';
	import ModalButtonGroup from '../../utils/components/ModalButtonGroup.svelte';

	const {
		plugin,
		options,
		canSelectNone,
		onSelect,
		onCancel,
	}: {
		plugin: IPlugin;
		options: SuggesterOption<string>[];
		canSelectNone: boolean;
		onSelect: (item: string | undefined) => void;
		onCancel: () => void;
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

<div class="mb-image-modal-header">
	<input type="text" bind:value={search} placeholder="Search images..." />
</div>
<div class="mb-image-card-grid">
	{#each filteredOptions as option}
		<ImageSuggesterCard plugin={plugin} image={option.value} onSelect={onSelect}></ImageSuggesterCard>
	{/each}
</div>

<ModalButtonGroup>
	{#if canSelectNone}
		<Button variant={ButtonStyleType.PRIMARY} onclick={() => onSelect(undefined)}>Select none</Button>
	{/if}
	<Button onclick={() => onCancel()}>Cancel</Button>
</ModalButtonGroup>
