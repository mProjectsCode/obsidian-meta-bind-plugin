<script lang="ts">
	import Icon from '../../../../utils/components/Icon.svelte';
	import LinkComponent from '../../../../utils/components/LinkComponent.svelte';
	import { MDLinkParser, MarkdownLink } from '../../../../parsers/MarkdownLinkParser';
	import { onMount } from 'svelte';
	import { MBLiteral } from '../../../../utils/Literal';

	export let value: MBLiteral;
	export let showSuggester: () => void;
	export let onValueChange: (value: MBLiteral) => void;

	let mdLink: MarkdownLink;
	let str: string;
	let isLink: boolean = false;

	onMount(() => {
		setValue(value);
	});

	export function setValue(v: MBLiteral): void {
		let valueAsString = v?.toString() ?? 'null';

		isLink = MDLinkParser.isLink(valueAsString);
		if (isLink) {
			try {
				mdLink = MDLinkParser.parseLink(valueAsString);
			} catch (e) {
				console.warn(e);
			}
		} else {
			str = valueAsString;
		}
	}

	function openSuggester(event: MouseEvent) {
		// don't fire the event if user clicked on the link
		if (!(event.target instanceof HTMLAnchorElement)) {
			showSuggester();
		}
	}

	function openSuggesterOnKey(event: KeyboardEvent) {
		if (event.key === ' ') {
			showSuggester();
		}
	}
</script>

<div class="mb-suggest-input" on:click={openSuggester} on:keydown={openSuggesterOnKey} role="button" tabindex="0">
	<div class="mb-suggest-text">
		{#if isLink}
			<LinkComponent bind:mdLink={mdLink}></LinkComponent>
		{:else}
			<span>{str}</span>
		{/if}
	</div>
	<Icon iconName="list" />
</div>
