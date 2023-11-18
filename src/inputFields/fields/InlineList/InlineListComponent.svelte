<script lang="ts">
	import Icon from '../../../utils/components/Icon.svelte';
	import { isMdLink, parseMdLink } from '../../../parsers/MarkdownLinkParser';
	import LinkComponent from '../../../utils/components/LinkComponent.svelte';
	import { MBLiteral } from '../../../utils/Literal';
	import LiteralRenderComponent from '../../../utils/components/LiteralRenderComponent.svelte';

	export let value: MBLiteral[];
	export let showInput: () => void;
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

	function input(event: MouseEvent): void {
		// don't fire the event if user clicked on the link
		if (!(event.target instanceof HTMLAnchorElement)) {
			showInput();
		}
	}

	function inputKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			showInput();
		}
	}
</script>

<div class="mb-inline-list">
	{#each value as entry, i}
		<div class="mb-inline-list-item">
			<LiteralRenderComponent value={entry}></LiteralRenderComponent>
			<button class="mb-inline-list-item-button" on:click={() => remove(i)}>
				<Icon iconName="x" />
			</button>
		</div>
	{/each}
	<div class="mb-inline-list-add" on:click={input} on:keydown={inputKey} role="button" tabindex="0">
		<!-- Alignment hack with zero width space -->
		<span>&#x200B;</span>
		<Icon iconName="plus" />
	</div>
</div>
