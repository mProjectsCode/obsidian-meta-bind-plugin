<script lang="ts">
	import Icon from '../DatePicker/Icon.svelte';
	import LinkComponent from '../../utils/LinkComponent.svelte';
	import {isMdLink, MarkdownLink, parseMdLink} from '../../parsers/MarkdownLinkParser';

	export let showSuggest: () => void;

	let mdLink: MarkdownLink;
	let str: string;
	let isLink: boolean = false;

	export function updateValue(value: string): void {
		isLink = isMdLink(value);
		if (isLink) {
			try {
				mdLink = parseMdLink(value);
			} catch (e) {
				console.warn(e);
			}
		} else {
			str = value;
		}
	}

	function suggest(event: MouseEvent): void {
		// don't fire the event if user clicked on the link
		if (!(event.target instanceof HTMLAnchorElement)) {
			showSuggest();
		}
	}
</script>

<style>
	.suggest-input {
		position: relative;
		color:    var(--text-normal);
		display:  inline-block;
	}

	.suggest-text {
		background:    var(--background-secondary);
		border-radius: var(--meta-bind-plugin-border-radius);
		border:        var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
		padding:       5px 5px 5px 7px;
		cursor:        pointer;
		width:         fit-content;
		display:       inline-block;
	}
</style>

<div class="suggest-input" on:click={suggest}>
	<div class="suggest-text">
		{#if isLink}
			<LinkComponent bind:mdLink={mdLink}></LinkComponent>
		{:else}
			<span>{str}</span>
		{/if}
		<Icon iconName="list"/>
	</div>
</div>
