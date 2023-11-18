<script lang="ts">
	import { MarkdownLink } from '../../parsers/MarkdownLinkParser';

	export let mdLink: MarkdownLink;

	$: linkHref = mdLink.block ? `${mdLink.target}#${mdLink.block}` : mdLink.target;
	$: cssClass = mdLink.internal ? 'internal-link' : 'external-link';
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
