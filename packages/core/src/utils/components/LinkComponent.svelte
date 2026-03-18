<script lang="ts">
	import type { MarkdownLink } from 'packages/core/src/parsers/MarkdownLinkParser';

	const {
		mdLink,
	}: {
		mdLink: MarkdownLink;
	} = $props();

	const linkHref = $derived(mdLink.block ? `${mdLink.target}#${mdLink.block}` : mdLink.target);
	const cssClass = $derived(mdLink.internal ? 'internal-link' : 'external-link');
	const ariaLabel = $derived(mdLink.alias ? linkHref : undefined);

	const linkText = $derived.by(() => {
		if (mdLink.alias) {
			return mdLink.alias;
		} else if (mdLink.block) {
			return `${mdLink.target} > ${mdLink.block}`;
		} else {
			return mdLink.target;
		}
	});
</script>

<a data-href={linkHref} href={linkHref} class={cssClass} target="_blank" rel="noopener" aria-label={ariaLabel}>
	{linkText}
</a>
