<script lang="ts">
	import { MarkdownLink } from 'packages/core/src//parsers/MarkdownLinkParser';
	import LinkComponent from 'packages/core/src/utils/components/LinkComponent.svelte';
	import ListWrapper from 'packages/core/src/utils/components/ListWrapper.svelte';

	export let mdLinkList: MarkdownLink[];
</script>

{#if mdLinkList.length === 0}
	<span></span>
{:else if mdLinkList.length === 1}
	<LinkComponent mdLink={mdLinkList[0]}></LinkComponent>
{:else}
	<ListWrapper elements={mdLinkList} let:element>
		<LinkComponent mdLink={element}></LinkComponent>
	</ListWrapper>
{/if}
