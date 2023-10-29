<script lang='ts'>
	import { MBLiteral } from '../../../../utils/Utils';
	import Icon from '../../../../utils/Icon.svelte';
	import LinkComponent from '../../../../utils/LinkComponent.svelte';
	import { isMdLink, MarkdownLink, parseMdLink } from '../../../../parsers/MarkdownLinkParser';
	import { onMount } from 'svelte';

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

		isLink = isMdLink(valueAsString);
		if (isLink) {
			try {
				mdLink = parseMdLink(valueAsString);
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

<div
	class='mb-suggest-input'
	on:click={openSuggester}
	on:keydown={openSuggesterOnKey}
	role='button'
	tabindex='0'>
	<div class='mb-suggest-text'>
		{#if isLink}
			<LinkComponent bind:mdLink={mdLink}></LinkComponent>
		{:else}
			<span>{str}</span>
		{/if}
	</div>
	<Icon iconName='list' />
</div>
