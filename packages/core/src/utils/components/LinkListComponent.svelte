<script lang="ts">
	import type { MarkdownLink } from 'packages/core/src//parsers/MarkdownLinkParser';
	import LinkComponent from 'packages/core/src/utils/components/LinkComponent.svelte';
	import ListWrapper from 'packages/core/src/utils/components/ListWrapper.svelte';

	let {
		mdLinkList,
	}: {
		mdLinkList: MarkdownLink[];
	} = $props();

	export function updateList(newMdLinkList: MarkdownLink[]) {
		mdLinkList = newMdLinkList;
	}
</script>

{#if mdLinkList.length === 0}
	<span></span>
{:else if mdLinkList.length === 1}
	<LinkComponent mdLink={mdLinkList[0]}></LinkComponent>
{:else}
	<ListWrapper elements={mdLinkList}>
		{#snippet children(element)}
			<LinkComponent mdLink={element}></LinkComponent>
		{/snippet}
	</ListWrapper>
{/if}
