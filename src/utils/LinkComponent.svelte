<script lang="ts">
	import {MarkdownLink} from '../parsers/MarkdownLinkParser';

	export let mdLink: MarkdownLink;

	$: linkHref = mdLink.block ? `${mdLink.target}#${mdLink.block}` : mdLink.target;
</script>

{#if mdLink.alias}
	<!-- svelte-ignore a11y-unknown-aria-attribute -->
	<a
		data-href={linkHref}
		href={linkHref}
		class="internal-link"
		target="_blank"
		rel="noopener"
		aria-label={linkHref}
		aria-label-position="top">
		{mdLink.alias}
	</a>
{:else}
	<a
		data-href={linkHref}
		href={linkHref}
		class="internal-link"
		target="_blank"
		rel="noopener">
		{linkHref}
	</a>
{/if}
