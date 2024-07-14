<script lang="ts">
	import { MarkdownLink } from 'packages/core/src/parsers/MarkdownLinkParser';

	const {
		mdLink,
	}: {
		mdLink: MarkdownLink;
	} = $props();

	const linkHref = $derived(mdLink.block ? `${mdLink.target}#${mdLink.block}` : mdLink.target);
	const cssClass = $derived(mdLink.internal ? 'internal-link' : 'external-link');
</script>

{#if mdLink.alias}
	<a data-href={linkHref} href={linkHref} class={cssClass} target="_blank" rel="noopener" aria-label={linkHref}>
		{mdLink.alias}
	</a>
{:else}
	<a data-href={linkHref} href={linkHref} class={cssClass} target="_blank" rel="noopener">
		{linkHref}
	</a>
{/if}
