<script lang="ts">
	import { MarkdownLink } from '../../parsers/MarkdownLinkParser';
	import LinkComponent from './LinkComponent.svelte';
	import ListWrapper from './ListWrapper.svelte';

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
