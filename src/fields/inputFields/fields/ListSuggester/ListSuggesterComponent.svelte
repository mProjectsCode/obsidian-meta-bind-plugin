<script lang="ts">
	import { Button } from 'obsidian-svelte';
	import Icon from '../../../../utils/components/Icon.svelte';
	import { MBLiteral } from '../../../../utils/Literal';
	import LiteralRenderComponent from '../../../../utils/components/LiteralRenderComponent.svelte';

	export let value: MBLiteral[];
	export let showSuggester: () => void;
	export let onValueChange: (value: MBLiteral[]) => void;

	export function setValue(v: MBLiteral[]): void {
		value = v;
	}

	export function addValue(v: MBLiteral): void {
		value.push(v);

		value = value;
	}

	function remove(i: number) {
		value.splice(i, 1);
		// call with copy of array
		onValueChange(value);
		// tell svelte to update
		value = value;
	}

	function suggest(event: MouseEvent): void {
		// don't fire the event if user clicked on the link
		if (!(event.target instanceof HTMLAnchorElement)) {
			showSuggester();
		}
	}

	function suggestKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			showSuggester();
		}
	}
</script>

<div class="mb-list-items">
	{#each value as entry, i}
		<div class="mb-list-item">
			<LiteralRenderComponent value={entry}></LiteralRenderComponent>
			<Button on:click={() => remove(i)}>
				<Icon iconName="x" />
			</Button>
		</div>
	{:else}
		<span class="mb-list-empty">Empty</span>
	{/each}
</div>
<div class="mb-list-input">
	<div class="mb-suggest-input" on:click={suggest} on:keydown={suggestKey} role="button" tabindex="0">
		<div class="mb-suggest-text">
			<span>Add Element...</span>
		</div>
		<Icon iconName="list" />
	</div>
</div>
