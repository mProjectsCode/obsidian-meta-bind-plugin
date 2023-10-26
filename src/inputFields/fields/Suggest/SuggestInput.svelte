<script lang='ts'>
	import LinkComponent from '../../../utils/LinkComponent.svelte';
	import { isMdLink, MarkdownLink, parseMdLink } from '../../../parsers/MarkdownLinkParser';
	import Icon from '../../../utils/Icon.svelte';
	import { SuggestOption } from './SuggestInputField';

	export let showSuggest: () => void;

	let mdLink: MarkdownLink;
	let str: string;
	let isLink: boolean = false;

	export function updateValue(value: SuggestOption): void {
		isLink = isMdLink(value.valueAsString());
		if (isLink) {
			try {
				mdLink = parseMdLink(value.valueAsString());
			} catch (e) {
				console.warn(e);
			}
		} else {
			str = value.valueAsString();
		}
	}

	function suggest(event: MouseEvent): void {
		// don't fire the event if user clicked on the link
		if (!(event.target instanceof HTMLAnchorElement)) {
			showSuggest();
		}
	}

	function suggestKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			showSuggest();
		}
	}
</script>

<style>
    .suggest-input {
        background:    var(--background-secondary);
        border-radius: var(--meta-bind-plugin-border-radius);
        border:        var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
        padding:       5px 5px 5px 7px;
        cursor:        pointer;
        position:      relative;
        color:         var(--text-normal);
        display:       inline-flex;
        align-items:   center;
        gap:           5px;
    }

    .suggest-text {
        display: inline-block;
    }
</style>

<div
	class='suggest-input'
	on:click={suggest}
	on:keydown={suggestKey}
	role='button'
	tabindex='0'>
	<div class='suggest-text'>
		{#if isLink}
			<LinkComponent bind:mdLink={mdLink}></LinkComponent>
		{:else}
			<span>{str}</span>
		{/if}
	</div>
	<Icon iconName='list' />
</div>
