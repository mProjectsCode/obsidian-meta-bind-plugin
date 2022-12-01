<script lang="ts">
	import {MarkdownLink} from '../parsers/MarkdownLinkParser';

	export let mdLink: MarkdownLink;

	function getHref() {
		return mdLink.block ? `${mdLink.target}#${mdLink.block}` : mdLink.target;
	}
</script>

{#if mdLink.alias}
	<!-- svelte-ignore a11y-unknown-aria-attribute -->
	<a
		data-href={getHref()}
		href={getHref()}
		class="internal-link"
		target="_blank"
		rel="noopener"
		aria-label={getHref()}
		aria-label-position="top"
	>
		{mdLink.alias}
	</a>
{:else}
	<a
		data-href={getHref()}
		href={getHref()}
		class="internal-link"
		target="_blank"
		rel="noopener"
	>
		{getHref()}
	</a>
{/if}
